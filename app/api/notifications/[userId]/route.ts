import { NextRequest, NextResponse } from 'next/server';
import { getNotifications } from '@/lib/server/shared';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json(getNotifications(userId));
}