import { NextRequest, NextResponse } from 'next/server';
import { lawyers, cases, recordActivity } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { caseId, lawyerId, adminName } = body;
  const c = cases.find(x => x.id === caseId);
  const l = lawyers.find(x => x.id === lawyerId);
  if (!c || !l) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  c.assignedLawyerId = lawyerId;
  l.activeCases = (l.activeCases || 0) + 1;
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'LAWYER', action: 'LAWYER_ASSIGNED', target: caseId, details: `${l.name} assigned` });
  return NextResponse.json({ success: true, case: c, lawyer: l });
}