import { NextRequest, NextResponse } from 'next/server';
import { cases, caseTimelines, getCaseClientShape, lawyers } from '@/lib/server/shared';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const clientCases = cases
    .filter(c => c.clientId === userId)
    .map(c => {
      const lawyer = lawyers.find(l => l.id === c.assignedLawyerId);
      const timeline = (caseTimelines[c.id] || []).slice(0, 8);
      const nextDateFormatted = c.nextActionDate
        ? new Date(c.nextActionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBD';
      const openedFormatted = c.createdAt
        ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown';
      return getCaseClientShape({
        ...c,
        attorney: lawyer?.name || 'Awaiting Assignment',
        nextDate: nextDateFormatted,
        openedDate: openedFormatted,
        timeline
      });
    });
  return NextResponse.json(clientCases);
}
