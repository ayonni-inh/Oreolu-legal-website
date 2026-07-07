import { NextRequest, NextResponse } from 'next/server';
import { consultations, recordActivity } from '@/lib/server/shared';

export async function GET() { return NextResponse.json(consultations); }
export async function POST(req: NextRequest) {
  const { caseId, clientName, scheduledFor, provider, adminName } = await req.json();
  const meetCode = Math.random().toString(36).substr(2, 8);
  const joinUrl = provider === 'Zoom' ? `https://zoom.us/j/${meetCode}` : `https://meet.google.com/${meetCode}`;
  const c = { id: `con-${Date.now()}`, caseId, clientName, scheduledFor, provider: provider || 'Google Meet', joinUrl, status: 'SCHEDULED' };
  consultations.unshift(c);
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CONSULTATION', action: 'CONSULTATION_SCHEDULED', target: caseId, details: `${provider || 'Google Meet'} for ${clientName} on ${scheduledFor}` });
  return NextResponse.json(c);
}