import { NextRequest, NextResponse } from 'next/server';
import { fallbackCaseProgress, requireRole } from '@/lib/server/shared';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const store = fallbackCaseProgress as Record<string, any>;
  return NextResponse.json(store[userId] || { milestones: [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  const { userId } = await params;
  const body = await req.json();
  const store = fallbackCaseProgress as Record<string, any>;
  store[userId] = body;
  return NextResponse.json(store[userId]);
}
