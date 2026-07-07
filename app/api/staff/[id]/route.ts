import { NextRequest, NextResponse } from 'next/server';
import { cases, lawyers, recordActivity } from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, specialties, capacity, adminName } = await req.json();
  const lw = lawyers.find(l => l.id === id);
  if (!lw) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  if (name) lw.name = name; if (specialties) lw.specialties = specialties; if (capacity !== undefined) lw.capacity = capacity;
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'ADMIN', action: 'STAFF_UPDATED', target: id, details: `Updated ${lw.name}` });
  return NextResponse.json({ success: true, lawyer: lw });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { adminName } = await req.json();
  const idx = lawyers.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  const lw = lawyers[idx]; lawyers.splice(idx, 1); cases.forEach(c => { if (c.assignedLawyerId === id) c.assignedLawyerId = null; });
  recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'ADMIN', action: 'STAFF_REMOVED', target: id, details: `Removed ${lw.name} from legal team` });
  return NextResponse.json({ success: true });
}
