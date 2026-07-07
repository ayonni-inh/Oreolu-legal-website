import { NextResponse } from 'next/server';
import { getSupabaseClient, invitations } from '@/lib/server/shared';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('invitations').select('*').eq('token', token).eq('status', 'PENDING').single();
      if (data) {
        if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Invitation has expired' }, { status: 404 });
        return NextResponse.json({ firstName: data.first_name, lastName: data.last_name, email: data.email, role: data.role });
      }
    } catch {}
  }
  const inv = invitations.find(i => i.token === token && i.status === 'PENDING');
  if (!inv) return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
  if (inv.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation has expired' }, { status: 404 });
  return NextResponse.json({ firstName: inv.firstName, lastName: inv.lastName, email: inv.email, role: inv.role });
}
