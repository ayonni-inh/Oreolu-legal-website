import { NextRequest, NextResponse } from 'next/server';
import { lawyers } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { specialty } = body;
  const match = [...lawyers].sort((a, b) => (a.activeCases / a.capacity) - (b.activeCases / b.capacity)).find(l => !specialty || l.specialties.includes(specialty));
  return NextResponse.json(match || null);
}