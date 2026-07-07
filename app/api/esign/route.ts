import { NextRequest, NextResponse } from 'next/server';
import { signatureRequests, recordActivity } from '@/lib/server/shared';

export async function GET() { return NextResponse.json(signatureRequests); }
export async function POST(req: NextRequest) {
  const { caseId, document, signer, email, adminName } = await req.json();
  const s = { id: `sig-${Date.now()}`, caseId, document, signer, email, status: 'PENDING', sentAt: new Date().toISOString() };
  signatureRequests.unshift(s);
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'ESIGN', action: 'ESIGN_REQUESTED', target: caseId, details: `Sent ${document} to ${signer} (${email})` });
  return NextResponse.json(s);
}
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const s = signatureRequests.find(x => x.id === id);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  s.status = status || s.status;
  recordActivity({ actorName: 'System', actorRole: 'System', category: 'ESIGN', action: 'ESIGN_STATUS', target: s.caseId, details: `${s.document} marked ${s.status}` });
  return NextResponse.json(s);
}