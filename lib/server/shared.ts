import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// Session helpers (signed cookie, server-side authoritative identity)
const SESSION_COOKIE = "oga_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

function signCookie(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is required in production");
    }
    return crypto
      .createHmac("sha256", "dev-secret-change-me")
      .update(value)
      .digest("hex");
  }
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionCookie(user: {
  id: string;
  appRole: string;
  email?: string;
}) {
  const payload = JSON.stringify({
    id: user.id,
    role: user.appRole,
    email: user.email || "",
    ts: Date.now(),
  });
  const signature = signCookie(payload);
  return `${Buffer.from(payload).toString("base64")}.${signature}`;
}

export function readSessionCookie(
  req: NextRequest,
): { id: string; role: string; email: string } | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const [b64, sig] = raw.split(".");
    if (!b64 || !sig) return null;
    const payload = Buffer.from(b64, "base64").toString("utf8");
    if (signCookie(payload) !== sig) return null;
    const data = JSON.parse(payload);
    if (Date.now() - (data.ts || 0) > SESSION_TTL_MS) return null;
    return { id: data.id, role: data.role, email: data.email };
  } catch {
    return null;
  }
}

export function setSessionCookie(
  response: NextResponse,
  user: { id: string; appRole: string; email?: string },
) {
  response.cookies.set(SESSION_COOKIE, createSessionCookie(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function loadUserById(id: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          appRole: data.app_role,
          status: data.status,
          permissions: data.permissions || [],
          passwordHash: data.password_hash,
        };
      }
    } catch {
      // Fall through to in-memory fallback if Supabase is unavailable or schema is incomplete.
    }
  }
  return fallbackUsers.find((u) => u.id === id) || null;
}

export async function requireRole(req: NextRequest, allowed: string[]) {
  const session = readSessionCookie(req);
  if (!session) {
    return {
      allowed: false as const,
      response: NextResponse.json({ error: "Access Denied" }, { status: 403 }),
    };
  }
  const user = await loadUserById(session.id);
  if (!user || user.status !== "ACTIVE" || !allowed.includes(user.appRole)) {
    const response = NextResponse.json({ error: "Access Denied" }, { status: 403 });
    clearSessionCookie(response);
    return { allowed: false as const, response };
  }
  return { allowed: true as const, session };
}

// Password helpers (Node built-in crypto — no extra deps)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(derived, "hex"),
      Buffer.from(hash, "hex"),
    );
  } catch {
    return false;
  }
}

// Helper: generate unique OGA-YYYY-NNNNN client ID
let _clientIdSeq = 100 + Math.floor(Math.random() * 200);
export function generateClientId(): string {
  _clientIdSeq++;
  const year = new Date().getFullYear();
  return `OGA-${year}-${String(_clientIdSeq).padStart(5, "0")}`;
}

// Helper: send email via Resend (no-op if unconfigured)
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_123456789") || key === "your_resend_api_key")
    return false;
  try {
    const resend = new Resend(key);
    const recipients = Array.isArray(to) ? to : [to];
    for (const addr of recipients.slice(0, 5)) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: addr,
        subject,
        html,
      });
    }
    return true;
  } catch (e) {
    console.warn("Email send failed:", (e as any)?.message);
    return false;
  }
}

// Helper: find user email by userId or clientId
export async function getUserEmail(
  userId: string,
): Promise<{ email: string; firstName: string; lastName: string } | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .or(`id.eq.${userId},client_id.eq.${userId}`)
        .maybeSingle();
      if (data)
        return {
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
        };
    } catch {
      /* fall through */
    }
  }
  const u = fallbackUsers.find((u) => u.id === userId || u.clientId === userId);
  if (u)
    return { email: u.email, firstName: u.firstName, lastName: u.lastName };
  return null;
}

// Helper: collect all admin/staff notification emails
export function getStaffEmails(): string[] {
  return Array.from(
    new Set(
      [
        ...fallbackUsers
          .filter((u) => u.appRole === "Admin" || u.appRole === "Staff")
          .map((u) => u.email),
        process.env.FIRM_EMAIL || "",
      ].filter(Boolean),
    ),
  );
}

// Resolve the public base URL for invite links across environments
export function getBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.REPLIT_DEV_DOMAIN)
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return `http://localhost:${process.env.PORT || 5000}`;
}

// Supabase client
let cachedSupabase: any = null;
export function getSupabaseClient() {
  if (cachedSupabase) return cachedSupabase;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  if (
    !(supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
  )
    return null;
  cachedSupabase = createClient(supabaseUrl, supabaseKey);
  return cachedSupabase;
}

export function getSupabaseStorageClient() {
  return getSupabaseClient();
}

export function toShortDateString(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Gemini AI client
let genAI: GoogleGenerativeAI | null = null;
export function getGenAI() {
  if (genAI) return genAI;
  if (!process.env.GEMINI_API_KEY) return null;
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

export function getModel() {
  const ai = getGenAI();
  if (!ai) return null;
  return ai.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export function cleanJsonText(text: string) {
  if (!text) return "";
  if (text.includes("```json")) {
    const parts = text.split("```json");
    const inner = parts[1] || "";
    return inner.split("```")[0].trim();
  }
  if (text.includes("```")) {
    const parts = text.split("```");
    return (parts[1] || "").trim();
  }
  return text.trim();
}

// Fallback in-memory database for preview without keys
export let fallbackAppointments = [
  {
    id: "1",
    user_id: "client-1",
    service_title: "Initial Legal Consultation",
    appointment_date: "Oct 15, 2023",
    appointment_time: "10:00 AM",
    status: "Upcoming",
    price: "$150",
    tracking_number: "TRK-123456",
    created_at: new Date().toISOString(),
  },
];

export let fallbackDocuments = [
  {
    id: "1",
    name: "Articles_of_Incorporation_Draft.pdf",
    user_id: "client-1",
    date: "Oct 10, 2024",
    size: "2.4 MB",
    type: "PDF",
    uploader_role: "CLIENT",
    status: "APPROVED",
  },
  {
    id: "2",
    name: "Client_Intake_Form_Signed.pdf",
    user_id: "client-1",
    date: "Oct 01, 2024",
    size: "1.1 MB",
    type: "PDF",
    uploader_role: "LEGAL",
    status: "APPROVED",
  },
];

export let fallbackCaseProgress = {
  "client-1": {
    milestones: [
      { id: 1, title: "Engagement Letter", status: "completed" },
      { id: 2, title: "Document Collection", status: "active" },
      { id: 3, title: "Internal Review", status: "pending" },
      { id: 4, title: "Case Filing", status: "pending" },
    ],
  },
};

export let fallbackUsers = [
  {
    id: "client-1",
    firstName: "Godwin",
    lastName: "Agidi",
    email: "client@example.com",
    appRole: "Client",
    clientId: "client-1",
    companyName: "Agidi Tech",
    status: "ACTIVE",
    permissions: [],
  },
  {
    id: "legal-1",
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah@firm.com",
    appRole: "Staff",
    clientId: "legal-1",
    status: "ACTIVE",
    permissions: ["VIEW_DOCUMENTS", "MANAGE_APPOINTMENTS"],
    passwordHash:
      "fallback-not-set",
  },
  {
    id: "admin-1",
    firstName: "Admin",
    lastName: "User",
    email: "ogouifemi@gmail.com",
    appRole: "Admin",
    clientId: "admin-1",
    status: "ACTIVE",
    permissions: [
      "VIEW_FINANCIALS",
      "APPROVE_DOCUMENTS",
      "MANAGE_APPOINTMENTS",
      "MANAGE_USERS",
    ],
    passwordHash:
      "5d47e24e0d610e259487fae3921b3ab4:d4cc870441e6c0b853a893f15d9015930ad0400efbefe0e7d27736817e07beb9bc8e468d3a9f0430800f13baaccfe59d2ff5545a13aadb8eac6a6eba83eed638",
  },
];

export let systemLogs: any[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    action: "SYSTEM_BOOT",
    admin: "SYSTEM",
    details: "Law Firm Portal initialized with Super Admin protocol.",
  },
];

export let activityLog: any[] = [
  {
    id: "act-seed-1",
    timestamp: new Date().toISOString(),
    actorId: "SYSTEM",
    actorName: "System",
    actorRole: "System",
    category: "SYSTEM",
    action: "SYSTEM_BOOT",
    target: "-",
    details:
      "AI Center initialized. Activity mirroring enabled across all user types.",
    severity: "info",
  },
];

export const recordActivity = (entry: {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  category: string;
  action: string;
  target?: string;
  details: string;
  severity?: "info" | "warning" | "critical";
}) => {
  activityLog.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorId: entry.actorId || "unknown",
    actorName: entry.actorName || "Unknown",
    actorRole: entry.actorRole || "Client",
    category: entry.category,
    action: entry.action,
    target: entry.target || "-",
    details: entry.details,
    severity: entry.severity || "info",
  });
  if (activityLog.length > 500) activityLog = activityLog.slice(0, 500);
};

export const addLog = (action: string, admin: string, details: string) => {
  systemLogs.unshift({
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    admin,
    details,
  });
  recordActivity({
    actorName: admin,
    actorRole: "Admin",
    category: "ADMIN",
    action,
    details,
    severity:
      action.includes("FINANCIAL") || action.includes("PERMISSIONS")
        ? "warning"
        : "info",
  });
};
// Password reset tokens (in-memory fallback; Supabase table used if configured)
export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: number; // epoch ms
  used: boolean;
}
export let passwordResetTokens: PasswordResetToken[] = [];

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function createPasswordResetToken(
  userId: string,
  email: string,
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("password_reset_tokens").insert({
        token,
        user_id: userId,
        email,
        expires_at: new Date(expiresAt).toISOString(),
        used: false,
      });
      return token;
    } catch {
      /* fall through to in-memory */
    }
  }

  passwordResetTokens.push({ token, userId, email, expiresAt, used: false });
  return token;
}

export async function consumePasswordResetToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (
        data &&
        !data.used &&
        new Date(data.expires_at).getTime() > Date.now()
      ) {
        await supabase
          .from("password_reset_tokens")
          .update({ used: true })
          .eq("token", token);
        return { userId: data.user_id, email: data.email };
      }
      return null;
    } catch {
      /* fall through */
    }
  }

  const entry = passwordResetTokens.find((t) => t.token === token);
  if (!entry || entry.used || entry.expiresAt < Date.now()) return null;
  entry.used = true;
  return { userId: entry.userId, email: entry.email };
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (data) return data;
    } catch {
      /* fall through */
    }
  }
  return fallbackUsers.find((u) => u.email === email) || null;
}

export async function updateUserPassword(
  userId: string,
  newPasswordHash: string,
) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("users")
        .update({ password_hash: newPasswordHash })
        .eq("id", userId);
      return true;
    } catch {
      /* fall through */
    }
  }
  const u = fallbackUsers.find((u) => u.id === userId) as any;
  if (u) {
    u.passwordHash = newPasswordHash;
    return true;
  }
  return false;
}

// In-app notification store (keyed by userId)
export const notificationsStore: Record<string, any[]> = {};

export function pushNotification(
  userId: string,
  notif: { type: string; title: string; message: string },
) {
  if (!userId) return;
  notificationsStore[userId] = notificationsStore[userId] || [];
  notificationsStore[userId].unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    ...notif,
    time: new Date().toISOString(),
    isRead: false,
  });
  if (notificationsStore[userId].length > 50)
    notificationsStore[userId].length = 50;
}

export function getNotifications(userId: string) {
  return notificationsStore[userId] || [];
}

export function markNotificationsRead(userId: string) {
  const store = notificationsStore[userId];
  if (store)
    store.forEach((n) => {
      n.isRead = true;
    });
  return { success: true };
}

export function deleteNotification(userId: string, notifId: string) {
  if (notificationsStore[userId]) {
    notificationsStore[userId] = notificationsStore[userId].filter(
      (n) => n.id !== notifId,
    );
  }
  return { success: true };
}

// In-memory stores for AI Center features
export let lawyers = [
  {
    id: "lw-1",
    name: "Dr. Oroelu G. Agidi",
    specialties: ["Corporate", "Litigation", "Compliance"],
    activeCases: 3,
    capacity: 8,
    rating: 4.9,
  },
  {
    id: "lw-2",
    name: "Sarah Smith",
    specialties: ["Contracts", "Property"],
    activeCases: 5,
    capacity: 10,
    rating: 4.7,
  },
  {
    id: "lw-3",
    name: "Michael Adebayo",
    specialties: ["Family", "Litigation"],
    activeCases: 2,
    capacity: 8,
    rating: 4.6,
  },
  {
    id: "lw-4",
    name: "Aisha Bello",
    specialties: ["IP", "Corporate", "Trademarks"],
    activeCases: 4,
    capacity: 10,
    rating: 4.8,
  },
];

export let cases = [
  {
    id: "CASE-1001",
    title: "Agidi Tech vs. ZenithCorp - Breach of Contract",
    clientId: "client-1",
    clientName: "Godwin Agidi",
    category: "Litigation",
    priority: "HIGH",
    status: "ACTIVE",
    assignedLawyerId: "lw-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    nextAction: "File Reply to Counter-claim",
    nextActionDate: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 5,
    ).toISOString(),
  },
  {
    id: "CASE-1002",
    title: "Trademark Registration - Acme Holdings",
    clientId: "client-2",
    clientName: "Acme Holdings",
    category: "Intellectual Property",
    priority: "MEDIUM",
    status: "ACTIVE",
    assignedLawyerId: "lw-4",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    nextAction: "Submit IPO Filing",
    nextActionDate: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 12,
    ).toISOString(),
  },
  {
    id: "CASE-1003",
    title: "Corporate Restructuring - Lekki Logistics",
    clientId: "client-3",
    clientName: "Lekki Logistics Ltd",
    category: "Corporate",
    priority: "LOW",
    status: "INTAKE",
    assignedLawyerId: null as any,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    nextAction: "Lawyer assignment",
    nextActionDate: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 1,
    ).toISOString(),
  },
];

export let caseTimelines: Record<string, any[]> = {
  "CASE-1001": [
    {
      id: "t-1",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      event: "Case Opened",
      detail: "Engagement letter executed.",
    },
    {
      id: "t-2",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      event: "Statement of Claim Filed",
      detail: "Filed at Federal High Court, Lagos.",
    },
    {
      id: "t-3",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      event: "Counter-claim Received",
      detail: "Defendant filed counter-claim of $250K.",
    },
  ],
  "CASE-1002": [
    {
      id: "t-1",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      event: "Trademark Application Drafted",
      detail: "Initial Class 35 + 42 application drafted.",
    },
  ],
  "CASE-1003": [
    {
      id: "t-1",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      event: "Intake Submitted",
      detail: "Smart onboarding form completed.",
    },
  ],
};

export let caseNotes: Record<string, any[]> = {
  "CASE-1001": [
    {
      id: "n-1",
      author: "Dr. Oroelu G. Agidi",
      role: "Admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      text: "Counter-claim weak on merits; recommend aggressive reply.",
    },
  ],
  "CASE-1002": [],
  "CASE-1003": [],
};

export let reminders: any[] = [
  {
    id: "rm-1",
    caseId: "CASE-1001",
    title: "Filing deadline reply",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    channel: "email+sms",
    status: "SCHEDULED",
  },
  {
    id: "rm-2",
    caseId: "CASE-1002",
    title: "Pay IPO fee",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
    channel: "email",
    status: "SCHEDULED",
  },
];

export let signatureRequests: any[] = [
  {
    id: "sig-1",
    caseId: "CASE-1001",
    document: "Reply Affidavit.pdf",
    signer: "Godwin Agidi",
    email: "ogouifemi@gmail.com",
    status: "PENDING",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "sig-2",
    caseId: "CASE-1002",
    document: "Power of Attorney.pdf",
    signer: "Acme Holdings Director",
    email: "director@acme.com",
    status: "SIGNED",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export let consultations: any[] = [
  {
    id: "con-1",
    caseId: "CASE-1001",
    clientName: "Godwin Agidi",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    provider: "Google Meet",
    joinUrl: "https://meet.google.com/agidi-demo",
    status: "SCHEDULED",
  },
  {
    id: "con-2",
    caseId: "CASE-1003",
    clientName: "Lekki Logistics Ltd",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    provider: "Zoom",
    joinUrl: "https://zoom.us/j/agidi-intake",
    status: "SCHEDULED",
  },
];

export interface Invitation {
  id: string;
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  invitedBy: string;
  inviteUrl: string;
  createdAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
}

export let invitations: Invitation[] = [];

export let onboardingSubmissions: any[] = [];

export const ONBOARDING_FORMS = [
  {
    id: "corp",
    label: "Corporate Intake",
    fields: [
      "Company Name",
      "RC Number",
      "Industry",
      "Annual Revenue",
      "Matter Description",
    ],
  },
  {
    id: "lit",
    label: "Litigation Intake",
    fields: [
      "Plaintiff",
      "Defendant",
      "Court",
      "Claim Amount",
      "Summary of Facts",
    ],
  },
  {
    id: "ip",
    label: "IP / Trademark Intake",
    fields: ["Mark / Title", "Class", "Owner", "Territory", "Goods/Services"],
  },
  {
    id: "family",
    label: "Family Law Intake",
    fields: [
      "Parties",
      "Marriage Date",
      "Children",
      "Issue",
      "Desired Outcome",
    ],
  },
];

export const fallbackBlogPosts = [
  {
    id: "1",
    title: "New Pan-African Trade Agreement Reshapes Corporate Law",
    excerpt:
      "The recently ratified trade agreement introduces new compliance requirements for businesses operating across African borders.",
    content:
      "The landscape of corporate law in Africa is undergoing a massive shift...",
    date: "March 25, 2026",
    readTime: "6 min read",
    category: "Corporate Law",
    imageUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Nigeria's Data Protection Act: What Tech Startups Need to Know",
    excerpt: "Strict new data privacy regulations are now in effect...",
    content: "In a move to align with global data privacy standards...",
    date: "March 22, 2026",
    readTime: "4 min read",
    category: "Tech Regulation",
    imageUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Navigating Immigration Law Changes for African Students in the UK",
    excerpt:
      "Recent policy updates have altered the visa application process...",
    content: "African students planning to study in the United Kingdom...",
    date: "March 20, 2026",
    readTime: "5 min read",
    category: "Immigration Law",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
  },
];

export function toUserShape(data: any) {
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name || data.firstName,
    lastName: data.last_name || data.lastName,
    companyName: data.company_name || data.companyName,
    clientId: data.client_id || data.clientId,
    appRole: data.app_role || data.appRole,
    status: data.status,
    permissions: data.permissions || [],
  };
}

export function toInvitationShape(data: any): Invitation {
  return {
    id: data.id,
    token: data.token,
    userId: data.user_id || data.userId,
    email: data.email,
    firstName: data.first_name || data.firstName,
    lastName: data.last_name || data.lastName,
    role: data.role,
    status: data.status,
    invitedBy: data.invited_by || data.invitedBy,
    inviteUrl: data.invite_url || data.inviteUrl,
    createdAt: data.created_at ? new Date(data.created_at) : data.createdAt,
    acceptedAt: data.accepted_at ? new Date(data.accepted_at) : data.acceptedAt,
    expiresAt: data.expires_at ? new Date(data.expires_at) : data.expiresAt,
  };
}

export function getCaseClientShape(c: any) {
  const statusProgress: Record<string, number> = {
    INTAKE: 5,
    REVIEW: 20,
    DISCOVERY: 35,
    ACTIVE: 55,
    HEARING_SCHEDULED: 70,
    JUDGMENT: 85,
    CLOSED: 100,
  };
  const statusLabel =
    c.status === "ACTIVE"
      ? "In Progress"
      : c.status === "HEARING_SCHEDULED"
        ? "Hearing Scheduled"
        : c.status === "CLOSED"
          ? "Closed"
          : c.status === "INTAKE"
            ? "Intake"
            : c.status === "JUDGMENT"
              ? "Judgment"
              : "Pending Review";

  return {
    id: c.id,
    title: c.title,
    type: c.category,
    status: statusLabel,
    rawStatus: c.status,
    progress: statusProgress[c.status] || 10,
    priority: c.priority,
    attorney: c.attorney || "Awaiting Assignment",
    nextStep: c.nextAction || "Awaiting next step",
    nextDate: c.nextDate || "TBD",
    openedDate: c.openedDate || "Unknown",
    timeline: c.timeline || [],
  };
}
