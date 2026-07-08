import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackDocuments, getSupabaseClient, requireRole } from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireRole(req, ['Admin']);
    if (!auth.allowed) return auth.response;
    const { status, adminName } = await req.json();

    addLog('DOCUMENT_STATUS_UPDATE', adminName || auth.session.id, `Document ${id} status updated to ${status}`);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('documents').update({ status }).eq('id', id).select();
      if (error) throw error;
      return NextResponse.json(data[0]);
    }

    const index = fallbackDocuments.findIndex(d => d.id === id);
    if (index !== -1) {
      fallbackDocuments[index].status = status;
      return NextResponse.json(fallbackDocuments[index]);
    }
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating document' }, { status: 500 });
  }
}
