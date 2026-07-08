import { NextRequest, NextResponse } from 'next/server';
import { addLog, requireRole } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const { email, role, adminName } = await req.json();
  const inviteId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  addLog('STAFF_INVITATION', adminName || auth.session.id, `Invited ${email} as ${role}`);
  return NextResponse.json({ success: true, inviteId, message: 'Invitation sent to legal staff' });
}
