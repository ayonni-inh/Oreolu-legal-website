import { NextRequest, NextResponse } from 'next/server';
import { reminders, recordActivity } from '@/lib/server/shared';

export async function GET() { return NextResponse.json(reminders); }
export async function POST(req: NextRequest) {
  const { caseId, title, dueDate, channel, adminName } = await req.json();
  const r = { id: `rm-${Date.now()}`, caseId, title, dueDate, channel: channel || 'email', status: 'SCHEDULED' };
  reminders.unshift(r);
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'REMINDER', action: 'REMINDER_CREATED', target: caseId, details: `${title} scheduled for ${dueDate}` });
  return NextResponse.json(r);
}
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const r = reminders.find(x => x.id === id);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  r.status = status || r.status;
  return NextResponse.json(r);
}