import { NextRequest, NextResponse } from 'next/server';
import { requireRole, systemLogs } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['Admin']);
  if (!auth.allowed) return auth.response;
  return NextResponse.json(systemLogs);
}
