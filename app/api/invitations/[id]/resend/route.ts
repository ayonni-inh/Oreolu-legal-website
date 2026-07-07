import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getBaseUrl, getSupabaseClient, invitations, recordActivity, sendEmail } from '@/lib/server/shared';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { adminName } = await req.json();
  const inv = invitations.find(i => i.id === id);
  if (!inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  const newToken = crypto.randomBytes(32).toString('hex'), expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), newInviteUrl = `${getBaseUrl()}/?invite=${newToken}`;
  inv.token = newToken; inv.inviteUrl = newInviteUrl; inv.status = 'PENDING'; inv.expiresAt = expiresAt; inv.acceptedAt = undefined;
  const supabase = getSupabaseClient();
  if (supabase) await supabase.from('invitations').update({ token: newToken, invite_url: newInviteUrl, status: 'PENDING', expires_at: expiresAt.toISOString(), accepted_at: null }).eq('id', id);
  const emailSent = await sendEmail(inv.email, `Your invitation to OROELU GODWIN AGIDI & CO — updated link`, `<a href="${newInviteUrl}">Activate Account</a>`);
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'ADMIN', action: 'INVITE_RESENT', target: inv.userId, details: `Resent invitation to ${inv.email}` });
  return NextResponse.json({ success: true, inviteUrl: newInviteUrl, emailSent });
}
