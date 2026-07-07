import { NextResponse } from 'next/server';
import { fallbackDocuments, getSupabaseClient } from '@/lib/server/shared';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    let doc: any = null;

    if (supabase) {
      const { data } = await supabase.from('documents').select('*').eq('id', id).maybeSingle();
      doc = data;
    }
    if (!doc) doc = fallbackDocuments.find(d => d.id === id);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    if (doc.file_url) return NextResponse.json({ url: doc.file_url, name: doc.name });

    if (supabase && doc.storage_path) {
      const { data, error } = await supabase.storage.from('firm-documents').createSignedUrl(doc.storage_path, 3600);
      if (!error && data?.signedUrl) return NextResponse.json({ url: data.signedUrl, name: doc.name });
    }

    return NextResponse.json({ error: 'File not available for download' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
