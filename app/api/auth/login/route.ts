import { NextRequest, NextResponse } from 'next/server';
import { fallbackUsers, getSupabaseClient, recordActivity, setSessionCookie, verifyPassword } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    let user: any = null;
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (data) user = { id: data.id, firstName: data.first_name, lastName: data.last_name, email: data.email, passwordHash: data.password_hash, appRole: data.app_role, companyName: data.company_name, industry: data.industry, jobTitle: data.job_title, clientId: data.client_id, status: data.status, permissions: data.permissions || [] };
    }
    if (!user) user = fallbackUsers.find(u => u.email === email);
    if (!user) return NextResponse.json({ error: 'No account found with this email address' }, { status: 401 });
    if (user.status === 'PENDING') return NextResponse.json({ error: 'PENDING', message: 'Your account is pending approval' }, { status: 403 });
    if (user.status === 'BLOCKED') return NextResponse.json({ error: 'BLOCKED', message: 'This account has been suspended' }, { status: 403 });
    const storedHash = user.passwordHash || user.password_hash;
    if (storedHash && !verifyPassword(password, storedHash)) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    recordActivity({ actorId: user.id, actorName: `${user.firstName} ${user.lastName}`, actorRole: user.appRole, category: 'AUTH', action: 'USER_LOGIN', target: user.email, details: `${user.appRole} logged in` });
    const { passwordHash: _h, password_hash: _p, ...safeUser } = user;
    const response = NextResponse.json({ success: true, user: safeUser });
    setSessionCookie(response, safeUser as any);
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}