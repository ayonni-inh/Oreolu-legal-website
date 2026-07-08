import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { fallbackUsers, getBaseUrl, getSupabaseClient, invitations, lawyers, recordActivity, requireRole, sendEmail } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const body = await req.json();
  const { firstName, lastName, email, role: inviteeRole, specialties, capacity, adminName } = body;
  const id = `lw-${Date.now()}`, userId = `staff-${Date.now()}`, name = `${firstName} ${lastName}`.trim();
  const newLawyer = { id, name, specialties: specialties || [], activeCases: 0, capacity: capacity || 8, rating: 4.5 };
  lawyers.push(newLawyer);
  const newUser: any = { id: userId, firstName, lastName, email, appRole: inviteeRole || 'Staff', clientId: userId, status: 'PENDING', permissions: ['VIEW_DOCUMENTS', 'MANAGE_APPOINTMENTS'], lawyerId: id };
  fallbackUsers.push(newUser);
  const token = crypto.randomBytes(32).toString('hex'), invId = `inv-${Date.now()}`, baseUrl = getBaseUrl(), inviteUrl = `${baseUrl}/?invite=${token}`, expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  invitations.unshift({ id: invId, token, userId, email, firstName, lastName, role: inviteeRole || 'Staff', status: 'PENDING', invitedBy: adminName || auth.session.email, inviteUrl, createdAt: new Date(), expiresAt });
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('users').upsert([{ id: userId, first_name: firstName, last_name: lastName, email, app_role: inviteeRole || 'Staff', status: 'PENDING', permissions: ['VIEW_DOCUMENTS', 'MANAGE_APPOINTMENTS'], lawyer_id: id }]);
      await supabase.from('invitations').insert([{ id: invId, token, user_id: userId, email, first_name: firstName, last_name: lastName, role: inviteeRole || 'Staff', status: 'PENDING', invited_by: adminName || auth.session.email, invite_url: inviteUrl, created_at: new Date().toISOString(), expires_at: expiresAt.toISOString() }]);
    } catch {
      // Persist in-memory invitations still work if the DB schema is incomplete.
    }
  }
  await sendEmail(email, `You've been invited to join OROELU GODWIN AGIDI & CO Portal`, `<a href="${inviteUrl}">Activate your account</a>`);
  recordActivity({ actorName: adminName || auth.session.email, actorRole: auth.session.role, category: 'ADMIN', action: 'STAFF_ADDED', target: id, details: `Added staff ${name}` });
  return NextResponse.json({ success: true, lawyer: newLawyer, user: newUser, inviteUrl, emailSent: true, invitationId: invId });
}
