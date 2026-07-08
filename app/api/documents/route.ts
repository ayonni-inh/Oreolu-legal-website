import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackDocuments, getSupabaseClient, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || '';
    const auth = await requireRole(req, ['Admin', 'Staff']);
    const isPrivileged = auth.allowed;
    const supabase = getSupabaseClient();

    if (isPrivileged) {
      if (supabase) {
        const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }
      return NextResponse.json(fallbackDocuments);
    }

    if (supabase) {
      const { data, error } = await supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackDocuments.filter(d => d.user_id === userId));
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff', 'Client']);
    if (!auth.allowed) return auth.response;
    const { name, userId, size, type, uploaderName } = await req.json();
    const role = auth.session.role;
    const status = (role === 'Admin') ? 'APPROVED' : 'PENDING_ADMIN_APPROVAL';

    const newDoc = {
      id: `DOC-${Math.random().toString(36).substr(2, 9)}`,
      name,
      user_id: userId || auth.session.id,
      size,
      type,
      status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      uploader_role: role.toUpperCase(),
      created_at: new Date().toISOString()
    };

    addLog('DOCUMENT_UPLOADED', uploaderName || auth.session.email || 'System', `New document ${name} uploaded by ${role}. Status: ${status}`);

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('documents').insert([newDoc]).select();
      if (error) throw error;
      return NextResponse.json(data[0]);
    }

    fallbackDocuments.unshift(newDoc);
    return NextResponse.json(newDoc);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating document' }, { status: 500 });
  }
}
