import { NextRequest, NextResponse } from 'next/server';
import { addLog, requireRole } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const { action, targetUser, amount, adminName } = await req.json();
  addLog('FINANCIAL_OVERRIDE', adminName || auth.session.id, `${action} of ${amount} for user ${targetUser}`);
  return NextResponse.json({ success: true, message: `Financial override ${action} completed.` });
}
