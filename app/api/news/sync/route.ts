import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { getSupabaseAdminClient } from '@/lib/server/admin';
import { requireRole } from '@/lib/server/shared';

export const runtime = 'nodejs';

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();

  if (
    value &&
    typeof value === 'object' &&
    '#text' in value &&
    typeof (value as { '#text'?: unknown })['#text'] === 'string'
  ) {
    return ((value as { '#text': string })['#text']).trim();
  }

  return '';
}

function getLink(item: any): string {
  if (typeof item.link === 'string') {
    return item.link.trim();
  }

  if (item.link && typeof item.link === 'object') {
    if (typeof item.link.href === 'string') return item.link.href.trim();
    if (typeof item.link['@_href'] === 'string') return item.link['@_href'].trim();
  }

  return '';
}

function getImage(item: any): string | null {
  const candidates = [
    item.enclosure?.url,
    item.enclosure?.['@_url'],
    item['media:content']?.url,
    item['media:content']?.['@_url'],
    item['media:thumbnail']?.url,
    item['media:thumbnail']?.['@_url'],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

function cleanSummary(value: unknown): string | null {
  const text = textValue(value);
  if (!text) return null;

  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
}

function stableExternalId(url: string, title: string): string {
  return crypto
    .createHash('sha256')
    .update(url || title)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['Admin', 'Staff']);

  if (!auth.allowed) {
    return auth.response;
  }

  const supabase = getSupabaseAdminClient();

  const { data: sources, error: sourceError } = await supabase
    .from('news_sources')
    .select('*')
    .eq('active', true);

  if (sourceError) {
    return NextResponse.json(
      { error: sourceError.message },
      { status: 500 },
    );
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
  });

  const results = [];

  for (const source of sources ?? []) {
    try {
      const response = await fetch(source.feed_url, {
        headers: {
          'User-Agent': 'OGA-Solicitors-NewsBot/1.0',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Feed returned HTTP ${response.status}`);
      }

      const xml = await response.text();
      const parsed = parser.parse(xml);

      const rssItems = asArray(parsed?.rss?.channel?.item);
      const atomEntries = asArray(parsed?.feed?.entry);
      const items = [...rssItems, ...atomEntries];

      let inserted = 0;
      let skipped = 0;

      for (const item of items.slice(0, 25)) {
        const title = textValue(item.title);
        const url = getLink(item);

        if (!title || !url) {
          skipped++;
          continue;
        }

        const externalId = stableExternalId(url, title);

        const { data: existing } = await supabase
          .from('external_news_items')
          .select('id')
          .eq('source_id', source.id)
          .eq('external_id', externalId)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        const publishedRaw =
          item.pubDate ||
          item.published ||
          item.updated ||
          item['dc:date'];

        const publishedAt = publishedRaw
          ? new Date(textValue(publishedRaw))
          : null;

        const { error: insertError } = await supabase
          .from('external_news_items')
          .insert({
            source_id: source.id,
            external_id: externalId,
            title,
            summary: cleanSummary(
              item.description ||
              item.summary ||
              item['content:encoded'],
            ),
            url,
            image_url: getImage(item),
            category: source.category,
            published_at:
              publishedAt && !Number.isNaN(publishedAt.getTime())
                ? publishedAt.toISOString()
                : null,
            fetched_at: new Date().toISOString(),
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        inserted++;
      }

      await supabase
        .from('news_sources')
        .update({
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', source.id);

      results.push({
        source: source.name,
        success: true,
        found: items.length,
        inserted,
        skipped,
      });
    } catch (error) {
      results.push({
        source: source.name,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown feed error',
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
  });
}