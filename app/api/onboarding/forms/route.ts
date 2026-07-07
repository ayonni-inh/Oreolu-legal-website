import { NextResponse } from 'next/server';
import { ONBOARDING_FORMS } from '@/lib/server/shared';

export async function GET() { return NextResponse.json(ONBOARDING_FORMS); }