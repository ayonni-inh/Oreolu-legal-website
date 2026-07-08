import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackUsers, requireRole } from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  const isAdmin = auth.session.role === 'Admin';
  const { id } = await params;
  const { firstName, lastName, email, appRole, companyName, status, adminName, permissions } = await req.json();

  if (!isAdmin && (appRole || permissions)) {
    return NextResponse.json({ error: 'Only Admin can change role or permissions' }, { status: 403 });
  }

  const index = fallbackUsers.findIndex(u => u.id === id);
  if (index === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const prevRole = fallbackUsers[index].appRole, prevStatus = fallbackUsers[index].status, prevPermissions = fallbackUsers[index].permissions;
  fallbackUsers[index] = { ...fallbackUsers[index], firstName: firstName || fallbackUsers[index].firstName, lastName: lastName || fallbackUsers[index].lastName, email: email || fallbackUsers[index].email, appRole: appRole || fallbackUsers[index].appRole, companyName: companyName || fallbackUsers[index].companyName, status: status || fallbackUsers[index].status, permissions: permissions || fallbackUsers[index].permissions };
  if (status && status !== prevStatus) addLog('USER_STATUS_CHANGE', adminName || auth.session.id, `Changed user ${id} status from ${prevStatus} to ${status}`);
  if (appRole && appRole !== prevRole) addLog('USER_ROLE_CHANGE', adminName || auth.session.id, `Changed user ${id} role from ${prevRole} to ${appRole}`);
  if (permissions && JSON.stringify(permissions) !== JSON.stringify(prevPermissions)) addLog('USER_PERMISSIONS_CHANGE', adminName || auth.session.id, `Updated permissions for user ${id}`);
  return NextResponse.json(fallbackUsers[index]);
}
