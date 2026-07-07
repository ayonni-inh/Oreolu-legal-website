import { NextRequest, NextResponse } from 'next/server';
import { caseNotes, recordActivity, requireRole } from '@/lib/server/shared';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(caseNotes[id] || []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  const body = await req.json();
  const { author, text } = body;
  const role = auth.session.role;
  const entry = { id: `n-${Date.now()}`, author: author || auth.session.email, role, timestamp: new Date().toISOString(), text };
  caseNotes[id] = caseNotes[id] || [];
  caseNotes[id].unshift(entry);
  recordActivity({ actorName: author || auth.session.email, actorRole: role, category: 'CASE', action: 'NOTE_ADDED', target: id, details: 'Note added' });
  return NextResponse.json(entry);
}
