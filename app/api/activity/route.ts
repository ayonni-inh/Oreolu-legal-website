import { NextRequest, NextResponse } from 'next/server';
import { activityLog, recordActivity, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  const limit = Number(req.nextUrl.searchParams.get('limit')) || 100;
  return NextResponse.json(activityLog.slice(0, limit));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actorId, actorName, actorRole, category, action, target, details, severity } = body;
  recordActivity({ actorId, actorName, actorRole, category, action, target, details, severity });
  return NextResponse.json({ success: true });
}
