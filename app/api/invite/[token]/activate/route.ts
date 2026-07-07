import { NextRequest, NextResponse } from 'next/server';
import { fallbackUsers, getSupabaseClient, hashPassword, invitations, recordActivity } from '@/lib/server/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { password } = await req.json();
  const passwordHash = hashPassword(password);
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: inv } = await supabase.from('invitations').select('*').eq('token', token).eq('status', 'PENDING').single();
      if (inv) {
        await supabase.from('invitations').update({ status: 'ACCEPTED', accepted_at: new Date().toISOString() }).eq('token', token);
        await supabase.from('users').update({ status: 'ACTIVE', password_hash: passwordHash }).eq('id', inv.user_id);
        const { data: user } = await supabase.from('users').select('*').eq('id', inv.user_id).single();
        const mappedUser = user ? { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, appRole: user.app_role, status: user.status, companyName: user.company_name, clientId: user.client_id } : null;
        const memInv = invitations.find(i => i.token === token); if (memInv) { memInv.status = 'ACCEPTED'; memInv.acceptedAt = new Date(); }
        const memUser = fallbackUsers.find(u => u.id === inv.user_id); if (memUser) { memUser.status = 'ACTIVE'; (memUser as any).passwordHash = passwordHash; }
        recordActivity({ actorName: `${inv.first_name} ${inv.last_name}`, actorRole: 'Staff', category: 'ADMIN', action: 'ACCOUNT_ACTIVATED', target: inv.user_id, details: `${inv.first_name} ${inv.last_name} activated their staff account` });
        return NextResponse.json({ success: true, user: mappedUser });
      }
    } catch {}
  }
  const inv = invitations.find(i => i.token === token && i.status === 'PENDING');
  if (!inv) return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
  const user = fallbackUsers.find(u => u.id === inv.userId); if (user) { (user as any).passwordHash = passwordHash; user.status = 'ACTIVE'; }
  inv.status = 'ACCEPTED'; inv.acceptedAt = new Date();
  recordActivity({ actorName: `${inv.firstName} ${inv.lastName}`, actorRole: 'Staff', category: 'ADMIN', action: 'ACCOUNT_ACTIVATED', target: inv.userId, details: `${inv.firstName} ${inv.lastName} activated their staff account` });
  return NextResponse.json({ success: true, user });
}
