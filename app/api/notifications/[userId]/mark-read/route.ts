import { NextRequest, NextResponse } from 'next/server';
import { markNotificationsRead } from '@/lib/server/shared';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json(markNotificationsRead(userId));
}