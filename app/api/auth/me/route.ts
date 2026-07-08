import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, loadUserById, readSessionCookie } from '@/lib/server/shared';

/**
 * Return the currently authenticated user based on the signed session cookie.
 * This is used by the frontend to restore login state after a page reload.
 * Stale or revoked sessions are rejected and cleared.
 */
export async function GET(req: NextRequest) {
  const session = readSessionCookie(req);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await loadUserById(session.id);
  if (!user || user.status !== 'ACTIVE') {
    const response = NextResponse.json({ error: 'Session revoked' }, { status: 403 });
    clearSessionCookie(response);
    return response;
  }

  // Ensure the stored role matches the cookie role to detect tampering.
  if (user.appRole !== session.role) {
    const response = NextResponse.json({ error: 'Session invalid' }, { status: 403 });
    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json({ user });
}
