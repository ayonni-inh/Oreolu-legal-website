import { NextRequest, NextResponse } from 'next/server';
import { getModel, cleanJsonText } from '@/lib/server/shared';

function safeParseResearch(text: string) {
  try {
    const cleaned = cleanJsonText(text);
    if (!cleaned) return null;
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { query, category } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query required or AI unavailable' }, { status: 400 });
    const model = getModel();
    if (!model) return NextResponse.json({ error: 'Query required or AI unavailable' }, { status: 400 });

    const catFilter = category && category !== 'All' ? ` Focus on: ${category}.` : '';
    const prompt = `You are a Nigerian legal research assistant. The user is searching for: "${query}".${catFilter}

Search Nigerian law and return 6 real, relevant legal resources from authoritative Nigerian and international sources. For each result, provide:
- Accurate case names, statute titles, or regulation names as they actually exist
- Real citations where possible (e.g. [2023] LPELR-12345(SC), CAP C20 LFN 2004, etc.)
- Accurate summaries based on actual Nigerian law
- The correct category: "Case Law", "Statutes & Regulations", or "Legal Commentary"
- A real source name and URL (use nigerialii.org, lawpavilion.com, lawnigeria.com, commonlii.org, or laws.gov.ng)

Respond ONLY with a JSON array of 6 objects with these exact keys:
[{
  "id": "unique-string",
  "title": "Full official title of case/statute/article",
  "citation": "Official citation or statute reference",
  "category": "Case Law | Statutes & Regulations | Legal Commentary",
  "date": "YYYY-MM-DD or year",
  "summary": "2-3 sentence accurate legal summary",
  "court": "Court name (for cases) or Regulatory body (for statutes)",
  "source": "Source database name",
  "url": "URL to source"
}]`;

    const result = await model.generateContent(prompt);
    const results = safeParseResearch(result.response.text());
    if (results) return NextResponse.json({ results, query });
    return NextResponse.json({ error: 'Could not parse results' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Research search failed' }, { status: 500 });
  }
}
