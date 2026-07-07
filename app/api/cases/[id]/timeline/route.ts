import { NextRequest, NextResponse } from 'next/server';
import { caseTimelines, cases, recordActivity, pushNotification } from '@/lib/server/shared';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(caseTimelines[id] || []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { event, detail, adminName } = body;
  const entry = { id: `t-${Date.now()}`, date: new Date().toISOString(), event, detail };
  caseTimelines[id] = caseTimelines[id] || [];
  caseTimelines[id].unshift(entry);
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'TIMELINE_ENTRY', target: id, details: `${event}: ${detail || ''}` });
  const relatedCase = cases.find(x => x.id === id);
  if (relatedCase?.clientId) pushNotification(relatedCase.clientId, { type: 'case_update', title: 'Case Update', message: `${event}${detail ? ': ' + detail : ''} — ${relatedCase.title}` });
  return NextResponse.json(entry);
}
