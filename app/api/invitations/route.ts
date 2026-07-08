import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, invitations, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
      if (data) return NextResponse.json(data.map((i: any) => ({ id: i.id, token: i.token, userId: i.user_id, email: i.email, firstName: i.first_name, lastName: i.last_name, role: i.role, status: i.status, invitedBy: i.invited_by, inviteUrl: i.invite_url, createdAt: i.created_at, acceptedAt: i.accepted_at, expiresAt: i.expires_at })));
    } catch {}
  }
  return NextResponse.json(invitations.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), expiresAt: i.expiresAt.toISOString(), acceptedAt: i.acceptedAt?.toISOString() })));
}
