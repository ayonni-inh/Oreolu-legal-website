import { NextRequest, NextResponse } from 'next/server';
import { fallbackUsers, generateClientId, getBaseUrl, getSupabaseClient, hashPassword, recordActivity, sendEmail } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, companyName, industry, jobTitle, position, appRole } = await req.json();
    if (!firstName || !lastName || !email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const existingMem = fallbackUsers.find(u => u.email === email);
    if (existingMem) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    const id = `client-${Date.now()}`;
    const clientId = generateClientId();
    const passwordHash = hashPassword(password);
    const role = 'Client';
    const status = 'ACTIVE';
    const resolvedPosition = position || jobTitle || '';
    const newUser: any = { id, firstName, lastName, email, phone: phone || '', passwordHash, appRole: role, companyName: companyName || '', industry: industry || '', jobTitle: resolvedPosition, clientId, status, permissions: [] };
    fallbackUsers.push(newUser);
    if (supabase) {
      await supabase.from('users').insert([{ id, first_name: firstName, last_name: lastName, email, phone: phone || '', password_hash: passwordHash, app_role: role, company_name: companyName || '', industry: industry || '', job_title: resolvedPosition, client_id: clientId, status, permissions: [] }]);
    }
    const baseUrl = getBaseUrl();
    const welcomeHtml = `<div>Welcome, ${firstName}! <a href="${baseUrl}">Access Your Client Dashboard</a></div>`;
    await sendEmail(email, `Welcome to OROELU GODWIN AGIDI & CO — Your Client ID: ${clientId}`, welcomeHtml);
    recordActivity({ actorId: id, actorName: `${firstName} ${lastName}`, actorRole: role, category: 'AUTH', action: 'USER_REGISTERED', target: clientId, details: `New ${role} registered: ${email}` });
    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}