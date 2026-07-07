import { NextRequest, NextResponse } from 'next/server';
import { lawyers } from '@/lib/server/shared';

export async function GET(_req: NextRequest) {
  return NextResponse.json(lawyers);
}