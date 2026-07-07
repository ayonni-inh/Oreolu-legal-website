import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackUsers, getSupabaseClient, requireRole } from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const { id } = await params;
  const { status, adminName } = await req.json();
  addLog('USER_STATUS_UPDATE', adminName || auth.session.id, `User ${id} status set to ${status}`);
  const supabase = getSupabaseClient();
  if (supabase) await supabase.from('users').update({ status }).eq('id', id);
  else { const user = fallbackUsers.find(u => u.id === id); if (user) user.status = status; }
  return NextResponse.json({ success: true });
}
