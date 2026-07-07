import { NextRequest, NextResponse } from 'next/server';
import { deleteNotification } from '@/lib/server/shared';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; notifId: string }> }
) {
  const { userId, notifId } = await params;
  return NextResponse.json(deleteNotification(userId, notifId));
}