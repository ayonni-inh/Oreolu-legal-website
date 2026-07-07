import { NextRequest, NextResponse } from 'next/server';
import { cases, lawyers, signatureRequests, reminders, consultations } from '@/lib/server/shared';

export async function GET(_req: NextRequest) {
  const totalCases = cases.length;
  const byPriority = cases.reduce((acc: any, c) => { acc[c.priority] = (acc[c.priority] || 0) + 1; return acc; }, {});
  const byStatus = cases.reduce((acc: any, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
  const byCategory = cases.reduce((acc: any, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {});
  const lawyerLoad = lawyers.map(l => ({ name: l.name, active: l.activeCases, capacity: l.capacity, utilization: Math.round((l.activeCases / l.capacity) * 100) }));
  return NextResponse.json({ totalCases, byPriority, byStatus, byCategory, lawyerLoad, pendingSignatures: signatureRequests.filter(s => s.status === 'PENDING').length, upcomingReminders: reminders.filter(r => r.status === 'SCHEDULED').length, upcomingConsultations: consultations.filter(c => new Date(c.scheduledFor) > new Date()).length });
}