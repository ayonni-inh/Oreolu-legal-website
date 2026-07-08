import { NextRequest, NextResponse } from 'next/server';
import { cases, caseTimelines, caseNotes, recordActivity, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  const body = await req.json();
  const { title, clientId, clientName, category, priority, adminName } = body;
  const id = `CASE-${1000 + cases.length + 1}`;
  const newCase = { id, title, clientId, clientName, category: category || 'General', priority: priority || 'MEDIUM', status: 'INTAKE', assignedLawyerId: null as any, createdAt: new Date().toISOString(), nextAction: 'Lawyer assignment', nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() };
  cases.push(newCase);
  caseTimelines[id] = [{ id: 't-1', date: new Date().toISOString(), event: 'Case Opened', detail: `Created by ${adminName || auth.session.email}` }];
  caseNotes[id] = [];
  recordActivity({ actorName: adminName || auth.session.email, actorRole: auth.session.role, category: 'CASE', action: 'CASE_CREATED', target: id, details: `New case opened: ${title}` });
  return NextResponse.json(newCase);
}
