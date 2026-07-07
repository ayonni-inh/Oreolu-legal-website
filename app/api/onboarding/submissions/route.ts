import { NextResponse } from 'next/server';
import { onboardingSubmissions } from '@/lib/server/shared';

export async function GET() { return NextResponse.json(onboardingSubmissions); }