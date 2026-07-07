import { NextRequest, NextResponse } from 'next/server';
import { onboardingSubmissions, ONBOARDING_FORMS, recordActivity } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  const { formId, submitter, payload } = await req.json();
  const sub = { id: `sub-${Date.now()}`, formId, submitter, payload, submittedAt: new Date().toISOString(), status: 'NEW' };
  onboardingSubmissions.unshift(sub);
  const formLabel = ONBOARDING_FORMS.find(f => f.id === formId)?.label || formId;
  recordActivity({ actorName: submitter || 'Anonymous', actorRole: 'Client', category: 'ONBOARDING', action: 'INTAKE_SUBMITTED', target: formId, details: `${formLabel} intake submitted` });
  return NextResponse.json(sub);
}