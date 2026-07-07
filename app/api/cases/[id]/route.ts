import { NextRequest, NextResponse } from 'next/server';
import { cases, recordActivity, pushNotification } from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { priority, status, nextAction, nextActionDate, adminName } = body;
  const c = cases.find(x => x.id === id);
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (priority) c.priority = priority;
  if (status) c.status = status;
  if (nextAction) c.nextAction = nextAction;
  if (nextActionDate) c.nextActionDate = nextActionDate;
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'CASE_UPDATED', target: id, details: `Updated case ${id}` });
  if (status && c.clientId) {
    const label = status === 'ACTIVE' ? 'In Progress' : status === 'HEARING_SCHEDULED' ? 'Hearing Scheduled' : status === 'CLOSED' ? 'Closed' : status === 'JUDGMENT' ? 'Judgment Delivered' : status === 'REVIEW' ? 'Under Review' : status;
    pushNotification(c.clientId, { type: 'case_update', title: 'Case Status Updated', message: `Your case "${c.title}" has been updated to: ${label}` });
  }
  return NextResponse.json(c);
}
