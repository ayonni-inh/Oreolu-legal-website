import { GoogleGenAI } from "@google/genai";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import path from "path";
import { createClient } from '@supabase/supabase-js';

// Gemini AI Setup
let genAI: any = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn('GEMINI_API_KEY is not set. Gemini features will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI client:', error);
}

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
try {
  if (supabaseUrl && supabaseKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else if (supabaseUrl || supabaseKey) {
    console.warn('Supabase URL or Key is invalid. Using in-memory fallback.');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Fallback in-memory database for preview without keys
let fallbackAppointments = [
  {
    id: '1',
    user_id: 'client-1',
    service_title: 'Initial Legal Consultation',
    appointment_date: 'Oct 15, 2023',
    appointment_time: '10:00 AM',
    status: 'Upcoming',
    price: '$150',
    tracking_number: 'TRK-123456',
    created_at: new Date().toISOString()
  }
];

let fallbackDocuments = [
  { id: '1', name: "Articles_of_Incorporation_Draft.pdf", user_id: 'client-1', date: "Oct 10, 2024", size: "2.4 MB", type: "PDF", uploader_role: 'CLIENT', status: 'APPROVED' },
  { id: '2', name: "Client_Intake_Form_Signed.pdf", user_id: 'client-1', date: "Oct 01, 2024", size: "1.1 MB", type: "PDF", uploader_role: 'LEGAL', status: 'APPROVED' }
];

let fallbackCaseProgress = {
  'client-1': {
    milestones: [
      { id: 1, title: 'Engagement Letter', status: 'completed' },
      { id: 2, title: 'Document Collection', status: 'active' },
      { id: 3, title: 'Internal Review', status: 'pending' },
      { id: 4, title: 'Case Filing', status: 'pending' }
    ]
  }
};

let fallbackUsers = [
  { 
    id: 'client-1', 
    firstName: 'Godwin', 
    lastName: 'Agidi', 
    email: 'ogouifemi@gmail.com', 
    appRole: 'Client', 
    clientId: 'client-1', 
    companyName: 'Agidi Tech', 
    status: 'ACTIVE',
    permissions: [] 
  },
  { 
    id: 'legal-1', 
    firstName: 'Sarah', 
    lastName: 'Smith', 
    email: 'sarah@firm.com', 
    appRole: 'Staff', 
    clientId: 'legal-1', 
    status: 'ACTIVE',
    permissions: ['VIEW_DOCUMENTS', 'MANAGE_APPOINTMENTS'] 
  },
  { 
    id: 'admin-1', 
    firstName: 'John', 
    lastName: 'Admin', 
    email: 'admin@firm.com', 
    appRole: 'Admin', 
    clientId: 'admin-1', 
    status: 'ACTIVE',
    permissions: ['VIEW_FINANCIALS', 'APPROVE_DOCUMENTS', 'MANAGE_APPOINTMENTS', 'MANAGE_USERS'] 
  }
];

let systemLogs: any[] = [
  { id: 'log-1', timestamp: new Date().toISOString(), action: 'SYSTEM_BOOT', admin: 'SYSTEM', details: 'Law Firm Portal initialized with Super Admin protocol.' }
];

// Unified activity stream visible to the Admin AI agent
let activityLog: any[] = [
  {
    id: 'act-seed-1',
    timestamp: new Date().toISOString(),
    actorId: 'SYSTEM',
    actorName: 'System',
    actorRole: 'System',
    category: 'SYSTEM',
    action: 'SYSTEM_BOOT',
    target: '-',
    details: 'AI Center initialized. Activity mirroring enabled across all user types.',
    severity: 'info'
  }
];

const recordActivity = (entry: {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  category: string;
  action: string;
  target?: string;
  details: string;
  severity?: 'info' | 'warning' | 'critical';
}) => {
  activityLog.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorId: entry.actorId || 'unknown',
    actorName: entry.actorName || 'Unknown',
    actorRole: entry.actorRole || 'Client',
    category: entry.category,
    action: entry.action,
    target: entry.target || '-',
    details: entry.details,
    severity: entry.severity || 'info'
  });
  if (activityLog.length > 500) activityLog = activityLog.slice(0, 500);
};

const addLog = (action: string, admin: string, details: string) => {
  systemLogs.unshift({
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    admin,
    details
  });
  recordActivity({
    actorName: admin,
    actorRole: 'Admin',
    category: 'ADMIN',
    action,
    details,
    severity: action.includes('FINANCIAL') || action.includes('PERMISSIONS') ? 'warning' : 'info'
  });
};

// In-memory stores for AI Center features
let lawyers = [
  { id: 'lw-1', name: 'Dr. Oroelu G. Agidi', specialties: ['Corporate', 'Litigation', 'Compliance'], activeCases: 3, capacity: 8, rating: 4.9 },
  { id: 'lw-2', name: 'Sarah Smith', specialties: ['Contracts', 'Property'], activeCases: 5, capacity: 10, rating: 4.7 },
  { id: 'lw-3', name: 'Michael Adebayo', specialties: ['Family', 'Litigation'], activeCases: 2, capacity: 8, rating: 4.6 },
  { id: 'lw-4', name: 'Aisha Bello', specialties: ['IP', 'Corporate', 'Trademarks'], activeCases: 4, capacity: 10, rating: 4.8 }
];

let cases = [
  {
    id: 'CASE-1001',
    title: 'Agidi Tech vs. ZenithCorp - Breach of Contract',
    clientId: 'client-1',
    clientName: 'Godwin Agidi',
    category: 'Litigation',
    priority: 'HIGH',
    status: 'ACTIVE',
    assignedLawyerId: 'lw-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    nextAction: 'File Reply to Counter-claim',
    nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'CASE-1002',
    title: 'Trademark Registration - Acme Holdings',
    clientId: 'client-2',
    clientName: 'Acme Holdings',
    category: 'Intellectual Property',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    assignedLawyerId: 'lw-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    nextAction: 'Submit IPO Filing',
    nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: 'CASE-1003',
    title: 'Corporate Restructuring - Lekki Logistics',
    clientId: 'client-3',
    clientName: 'Lekki Logistics Ltd',
    category: 'Corporate',
    priority: 'LOW',
    status: 'INTAKE',
    assignedLawyerId: null as any,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    nextAction: 'Lawyer assignment',
    nextActionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

let caseTimelines: Record<string, any[]> = {
  'CASE-1001': [
    { id: 't-1', date: new Date(Date.now() - 1000*60*60*24*14).toISOString(), event: 'Case Opened', detail: 'Engagement letter executed.' },
    { id: 't-2', date: new Date(Date.now() - 1000*60*60*24*10).toISOString(), event: 'Statement of Claim Filed', detail: 'Filed at Federal High Court, Lagos.' },
    { id: 't-3', date: new Date(Date.now() - 1000*60*60*24*5).toISOString(), event: 'Counter-claim Received', detail: 'Defendant filed counter-claim of $250K.' }
  ],
  'CASE-1002': [
    { id: 't-1', date: new Date(Date.now() - 1000*60*60*24*30).toISOString(), event: 'Trademark Application Drafted', detail: 'Initial Class 35 + 42 application drafted.' }
  ],
  'CASE-1003': [
    { id: 't-1', date: new Date(Date.now() - 1000*60*60*24*2).toISOString(), event: 'Intake Submitted', detail: 'Smart onboarding form completed.' }
  ]
};

let caseNotes: Record<string, any[]> = {
  'CASE-1001': [
    { id: 'n-1', author: 'Dr. Oroelu G. Agidi', role: 'Admin', timestamp: new Date(Date.now()-1000*60*60*24*4).toISOString(), text: 'Counter-claim weak on merits; recommend aggressive reply.' }
  ],
  'CASE-1002': [],
  'CASE-1003': []
};

let reminders: any[] = [
  { id: 'rm-1', caseId: 'CASE-1001', title: 'Filing deadline reply', dueDate: new Date(Date.now()+1000*60*60*24*3).toISOString(), channel: 'email+sms', status: 'SCHEDULED' },
  { id: 'rm-2', caseId: 'CASE-1002', title: 'Pay IPO fee', dueDate: new Date(Date.now()+1000*60*60*24*8).toISOString(), channel: 'email', status: 'SCHEDULED' }
];

let signatureRequests: any[] = [
  { id: 'sig-1', caseId: 'CASE-1001', document: 'Reply Affidavit.pdf', signer: 'Godwin Agidi', email: 'ogouifemi@gmail.com', status: 'PENDING', sentAt: new Date(Date.now()-1000*60*60*24*1).toISOString() },
  { id: 'sig-2', caseId: 'CASE-1002', document: 'Power of Attorney.pdf', signer: 'Acme Holdings Director', email: 'director@acme.com', status: 'SIGNED', sentAt: new Date(Date.now()-1000*60*60*24*4).toISOString() }
];

let consultations: any[] = [
  { id: 'con-1', caseId: 'CASE-1001', clientName: 'Godwin Agidi', scheduledFor: new Date(Date.now()+1000*60*60*24*2).toISOString(), provider: 'Google Meet', joinUrl: 'https://meet.google.com/agidi-demo', status: 'SCHEDULED' },
  { id: 'con-2', caseId: 'CASE-1003', clientName: 'Lekki Logistics Ltd', scheduledFor: new Date(Date.now()+1000*60*60*24*1).toISOString(), provider: 'Zoom', joinUrl: 'https://zoom.us/j/agidi-intake', status: 'SCHEDULED' }
];

let onboardingSubmissions: any[] = [];

const ONBOARDING_FORMS = [
  { id: 'corp', label: 'Corporate Intake', fields: ['Company Name', 'RC Number', 'Industry', 'Annual Revenue', 'Matter Description'] },
  { id: 'lit', label: 'Litigation Intake', fields: ['Plaintiff', 'Defendant', 'Court', 'Claim Amount', 'Summary of Facts'] },
  { id: 'ip', label: 'IP / Trademark Intake', fields: ['Mark / Title', 'Class', 'Owner', 'Territory', 'Goods/Services'] },
  { id: 'family', label: 'Family Law Intake', fields: ['Parties', 'Marriage Date', 'Children', 'Issue', 'Desired Outcome'] }
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Appointments API
  app.get("/api/appointments", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const role = (req.query.role as string)?.toUpperCase(); // 'CLIENT', 'STAFF', 'ADMIN'
      
      if (role === 'ADMIN' || role === 'STAFF' || role === 'LEGAL') {
        if (supabase) {
          const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return res.json(data);
        }
        return res.json(fallbackAppointments);
      }

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return res.json(data);
      } else {
        // Fallback
        const userAppointments = fallbackAppointments.filter(a => a.user_id === userId);
        return res.json(userAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role, adminName } = req.body;
      const upperRole = role?.toUpperCase();

      if (upperRole !== 'ADMIN' && upperRole !== 'STAFF') {
        return res.status(403).json({ error: "Only Admin/Legal Team can update status" });
      }

      addLog('APPOINTMENT_STATUS_UPDATE', adminName || 'Admin', `Changed appointment ${id} status to ${status}`);

      if (supabase) {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', id)
          .select();
        if (error) throw error;
        return res.json(data[0]);
      } else {
        const index = fallbackAppointments.findIndex(a => a.id === id);
        if (index !== -1) {
          fallbackAppointments[index].status = status;
          return res.json(fallbackAppointments[index]);
        }
        return res.status(404).json({ error: "Appointment not found" });
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const { userId, serviceTitle, date, time, price, trackingNumber, status, role, requesterName } = req.body;
      
      if (!userId || !serviceTitle || !date || !time) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Admin logic: Admins can auto-approve their own or others' creations if they choose
      // Clients and Staff/Legal always default to pending admin approval for certain types if not explicitly set
      const defaultStatus = (role === 'Admin') ? (status || 'APPROVED') : 'PENDING_ADMIN_APPROVAL';

      const newAppointment = {
        user_id: userId,
        service_title: serviceTitle,
        appointment_date: date,
        appointment_time: time,
        status: defaultStatus,
        price: price || 'Free',
        tracking_number: trackingNumber || `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        created_at: new Date().toISOString()
      };

      if (defaultStatus === 'PENDING_ADMIN_APPROVAL') {
        addLog('APPOINTMENT_REQUESTED', requesterName || 'System', `New appointment ${newAppointment.tracking_number} entered approval queue.`);
      }
      recordActivity({
        actorId: userId,
        actorName: requesterName || 'Client',
        actorRole: role || 'Client',
        category: 'APPOINTMENT',
        action: 'APPOINTMENT_CREATED',
        target: newAppointment.tracking_number,
        details: `${serviceTitle} booked for ${date} ${time}`
      });

      if (supabase) {
        const { data, error } = await supabase
          .from('appointments')
          .insert([newAppointment])
          .select();
          
        if (error) throw error;
        return res.status(201).json(data[0]);
      } else {
        // Fallback
        const appointmentWithId = {
          ...newAppointment,
          id: Math.random().toString(36).substr(2, 9)
        };
        fallbackAppointments.unshift(appointmentWithId);
        return res.status(201).json(appointmentWithId);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Documents API
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const role = (req.query.role as string)?.toUpperCase();
      
      if (role === 'ADMIN' || role === 'STAFF' || role === 'LEGAL') {
        if (supabase) {
          const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return res.json(data);
        }
        return res.json(fallbackDocuments);
      }

      if (supabase) {
        const { data, error } = await supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      return res.json(fallbackDocuments.filter(d => d.user_id === userId));
    } catch (error) {
      res.status(500).json({ error: "Error fetching documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const { name, userId, size, type, role, uploaderName } = req.body;
      const status = (role === 'Admin') ? 'APPROVED' : 'PENDING_ADMIN_APPROVAL';

      const newDoc = {
        id: `DOC-${Math.random().toString(36).substr(2, 9)}`,
        name,
        user_id: userId,
        size,
        type,
        status,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        uploader_role: (role || 'CLIENT').toUpperCase(),
        created_at: new Date().toISOString()
      };

      addLog('DOCUMENT_UPLOADED', uploaderName || 'System', `New document ${name} uploaded by ${role || 'User'}. Status: ${status}`);

      if (supabase) {
        const { data, error } = await supabase.from('documents').insert([newDoc]).select();
        if (error) throw error;
        return res.json(data[0]);
      }
      
      fallbackDocuments.unshift(newDoc);
      res.json(newDoc);
    } catch (error) {
      res.status(500).json({ error: "Error creating document" });
    }
  });

  app.patch("/api/documents/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role, adminName } = req.body;

      if (role !== 'Admin') {
        return res.status(403).json({ error: "Super Admin authorization required" });
      }

      addLog('DOCUMENT_STATUS_UPDATE', adminName || 'Admin', `Document ${id} status updated to ${status}`);

      if (supabase) {
        const { data, error } = await supabase.from('documents').update({ status }).eq('id', id).select();
        if (error) throw error;
        return res.json(data[0]);
      }

      const index = fallbackDocuments.findIndex(d => d.id === id);
      if (index !== -1) {
        fallbackDocuments[index].status = status;
        return res.json(fallbackDocuments[index]);
      }
      res.status(404).json({ error: "Document not found" });
    } catch (error) {
      res.status(500).json({ error: "Error updating document" });
    }
  });

  // User Management for Admin
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      res.json(fallbackUsers);
    } catch (error) {
      res.status(500).json({ error: "Error fetching system users" });
    }
  });

  app.patch("/api/admin/users/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role, adminName } = req.body;
      
      if (role !== 'Admin') return res.status(403).json({ error: "Access Denied" });

      addLog('USER_STATUS_UPDATE', adminName || 'Admin', `User ${id} status set to ${status}`);

      if (supabase) {
        const { error } = await supabase.from('users').update({ status }).eq('id', id);
        if (error) throw error;
      } else {
        const user = fallbackUsers.find(u => u.id === id);
        if (user) user.status = status;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.post("/api/admin/invite-staff", async (req, res) => {
    try {
      const { email, firstName, lastName, role, adminName } = req.body;
      
      const inviteId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      addLog('STAFF_INVITATION', adminName || 'Admin', `Invited ${email} as ${role}`);

      // In real scenario: Send email via Resend
      res.json({ success: true, inviteId, message: "Invitation sent to legal staff" });
    } catch (error) {
      res.status(500).json({ error: "Error sending invitation" });
    }
  });

  // Financial Oversight
  app.get("/api/admin/payments", (req, res) => {
    // Mocking pending payments for the dashboard
    const pendingPayments = [
      { id: 'pay-1', client: 'John Wick', amount: '$5,000', service: 'Corporate Restructuring', status: 'AWAITING_VERIFICATION', date: '2024-04-20' },
      { id: 'pay-2', client: 'Sara Connor', amount: '$1,200', service: 'Property Dispute', status: 'OVERDUE', date: '2024-04-15' }
    ];
    res.json(pendingPayments);
  });

  // Case Progress API
  app.get("/api/case-progress/:userId", (req, res) => {
    const { userId } = req.params;
    const progress = fallbackCaseProgress[userId as keyof typeof fallbackCaseProgress] || fallbackCaseProgress['client-1'];
    res.json(progress);
  });

  app.patch("/api/case-progress/:userId", (req, res) => {
    const { userId } = req.params;
    const { milestones, role } = req.body;

    if (role !== 'ADMIN' && role !== 'LEGAL') {
      return res.status(403).json({ error: "Forbidden" });
    }

    fallbackCaseProgress[userId as keyof typeof fallbackCaseProgress] = { milestones };
    res.json({ success: true });
  });

  // User Management API
  app.get("/api/users", (req, res) => {
    const role = req.query.role as string;
    // For demo purposes, we allow viewing users if role is Admin or Staff
    if (role !== 'Admin' && role !== 'Staff') {
      return res.status(403).json({ error: "Only Admin can view user list" });
    }
    res.json(fallbackUsers);
  });

  app.patch("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, appRole, companyName, status, adminName, permissions } = req.body;
    
    // In a real app, check authorization here
    
    const index = fallbackUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      const prevRole = fallbackUsers[index].appRole;
      const prevStatus = fallbackUsers[index].status;
      const prevPermissions = fallbackUsers[index].permissions;

      fallbackUsers[index] = { 
        ...fallbackUsers[index], 
        firstName: firstName || fallbackUsers[index].firstName,
        lastName: lastName || fallbackUsers[index].lastName,
        email: email || fallbackUsers[index].email,
        appRole: appRole || fallbackUsers[index].appRole,
        companyName: companyName || fallbackUsers[index].companyName,
        status: status || fallbackUsers[index].status,
        permissions: permissions || fallbackUsers[index].permissions
      };

      if (status && status !== prevStatus) {
        addLog('USER_STATUS_CHANGE', adminName || 'Admin', `Changed user ${id} status from ${prevStatus} to ${status}`);
      }
      if (appRole && appRole !== prevRole) {
        addLog('USER_ROLE_CHANGE', adminName || 'Admin', `Changed user ${id} role from ${prevRole} to ${appRole}`);
      }
      if (permissions && JSON.stringify(permissions) !== JSON.stringify(prevPermissions)) {
        addLog('USER_PERMISSIONS_CHANGE', adminName || 'Admin', `Updated permissions for user ${id}`);
      }

      return res.json(fallbackUsers[index]);
    }
    res.status(404).json({ error: "User not found" });
  });

  // Admin Logs API
  app.get("/api/admin/logs", (req, res) => {
    const role = req.query.role as string;
    if (role !== 'Admin') {
      return res.status(403).json({ error: "Super Admin authorization required" });
    }
    res.json(systemLogs);
  });

  // Financial Oversight API
  app.post("/api/admin/financial-override", (req, res) => {
    const { role, action, targetUser, amount, adminName } = req.body;
    if (role !== 'Admin') {
      return res.status(403).json({ error: "Super Admin authorization required" });
    }

    addLog('FINANCIAL_OVERRIDE', adminName || 'Admin', `${action} of ${amount} for user ${targetUser}`);
    res.json({ success: true, message: `Financial override ${action} completed.` });
  });

  // ===== AI CENTER ENDPOINTS =====

  // Unified activity stream
  app.get("/api/activity", (req, res) => {
    const role = req.query.role as string;
    if (role !== 'Admin') return res.status(403).json({ error: "Admin only" });
    const limit = Number(req.query.limit) || 100;
    res.json(activityLog.slice(0, limit));
  });

  app.post("/api/activity", (req, res) => {
    const { actorId, actorName, actorRole, category, action, target, details, severity } = req.body;
    recordActivity({ actorId, actorName, actorRole, category, action, target, details, severity });
    res.json({ success: true });
  });

  // Cases CRUD
  app.get("/api/cases", (req, res) => {
    const role = req.query.role as string;
    if (role !== 'Admin' && role !== 'Staff') return res.status(403).json({ error: "Forbidden" });
    res.json(cases);
  });

  app.post("/api/cases", (req, res) => {
    const { title, clientId, clientName, category, priority, adminName } = req.body;
    const id = `CASE-${1000 + cases.length + 1}`;
    const newCase = {
      id, title, clientId, clientName,
      category: category || 'General',
      priority: priority || 'MEDIUM',
      status: 'INTAKE',
      assignedLawyerId: null as any,
      createdAt: new Date().toISOString(),
      nextAction: 'Lawyer assignment',
      nextActionDate: new Date(Date.now() + 1000*60*60*24).toISOString()
    };
    cases.push(newCase);
    caseTimelines[id] = [{ id: 't-1', date: new Date().toISOString(), event: 'Case Opened', detail: `Created by ${adminName || 'Admin'}` }];
    caseNotes[id] = [];
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'CASE_CREATED', target: id, details: `New case opened: ${title}` });
    res.json(newCase);
  });

  app.patch("/api/cases/:id", (req, res) => {
    const { id } = req.params;
    const { priority, status, nextAction, nextActionDate, adminName } = req.body;
    const c = cases.find(x => x.id === id);
    if (!c) return res.status(404).json({ error: "Not found" });
    if (priority) c.priority = priority;
    if (status) c.status = status;
    if (nextAction) c.nextAction = nextAction;
    if (nextActionDate) c.nextActionDate = nextActionDate;
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'CASE_UPDATED', target: id, details: `Updated case ${id}` });
    res.json(c);
  });

  // Case timeline
  app.get("/api/cases/:id/timeline", (req, res) => {
    res.json(caseTimelines[req.params.id] || []);
  });
  app.post("/api/cases/:id/timeline", (req, res) => {
    const { id } = req.params;
    const { event, detail, adminName } = req.body;
    const entry = { id: `t-${Date.now()}`, date: new Date().toISOString(), event, detail };
    caseTimelines[id] = caseTimelines[id] || [];
    caseTimelines[id].unshift(entry);
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'TIMELINE_ENTRY', target: id, details: `${event}: ${detail || ''}` });
    res.json(entry);
  });

  // Case notes (internal)
  app.get("/api/cases/:id/notes", (req, res) => {
    res.json(caseNotes[req.params.id] || []);
  });
  app.post("/api/cases/:id/notes", (req, res) => {
    const { id } = req.params;
    const { author, role, text } = req.body;
    const entry = { id: `n-${Date.now()}`, author: author || 'Admin', role: role || 'Admin', timestamp: new Date().toISOString(), text };
    caseNotes[id] = caseNotes[id] || [];
    caseNotes[id].unshift(entry);
    recordActivity({ actorName: author || 'Admin', actorRole: role || 'Admin', category: 'CASE', action: 'NOTE_ADDED', target: id, details: `Note added` });
    res.json(entry);
  });

  // Lawyers + assignment engine
  app.get("/api/lawyers", (req, res) => {
    res.json(lawyers);
  });

  app.post("/api/lawyers/assign", (req, res) => {
    const { caseId, lawyerId, adminName } = req.body;
    const c = cases.find(x => x.id === caseId);
    const lw = lawyers.find(l => l.id === lawyerId);
    if (!c || !lw) return res.status(404).json({ error: "Case or lawyer not found" });
    if (c.assignedLawyerId) {
      const prev = lawyers.find(l => l.id === c.assignedLawyerId);
      if (prev) prev.activeCases = Math.max(0, prev.activeCases - 1);
    }
    c.assignedLawyerId = lw.id;
    c.status = c.status === 'INTAKE' ? 'ACTIVE' : c.status;
    lw.activeCases += 1;
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CASE', action: 'LAWYER_ASSIGNED', target: caseId, details: `Assigned ${lw.name} to ${caseId}` });
    res.json({ success: true, case: c, lawyer: lw });
  });

  app.post("/api/lawyers/recommend", (req, res) => {
    const { caseId } = req.body;
    const c = cases.find(x => x.id === caseId);
    if (!c) return res.status(404).json({ error: "Case not found" });
    const scored = lawyers.map(l => {
      const specialtyMatch = l.specialties.some(s => c.category.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.category.toLowerCase())) ? 40 : 0;
      const capacityScore = Math.max(0, (l.capacity - l.activeCases)) * 5;
      const ratingScore = l.rating * 10;
      return { lawyer: l, score: Math.round(specialtyMatch + capacityScore + ratingScore), reason: `${specialtyMatch ? 'Matches specialty. ' : ''}Capacity ${l.capacity - l.activeCases}/${l.capacity} free. Rating ${l.rating}.` };
    }).sort((a, b) => b.score - a.score);
    res.json(scored);
  });

  // Reminders
  app.get("/api/reminders", (req, res) => res.json(reminders));
  app.post("/api/reminders", (req, res) => {
    const { caseId, title, dueDate, channel, adminName } = req.body;
    const r = { id: `rm-${Date.now()}`, caseId, title, dueDate, channel: channel || 'email', status: 'SCHEDULED' };
    reminders.unshift(r);
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'REMINDER', action: 'REMINDER_CREATED', target: caseId, details: `${title} scheduled for ${dueDate}` });
    res.json(r);
  });
  app.patch("/api/reminders/:id", (req, res) => {
    const r = reminders.find(x => x.id === req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    r.status = req.body.status || r.status;
    res.json(r);
  });

  // E-signature workflow
  app.get("/api/esign", (req, res) => res.json(signatureRequests));
  app.post("/api/esign", (req, res) => {
    const { caseId, document, signer, email, adminName } = req.body;
    const s = { id: `sig-${Date.now()}`, caseId, document, signer, email, status: 'PENDING', sentAt: new Date().toISOString() };
    signatureRequests.unshift(s);
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'ESIGN', action: 'ESIGN_REQUESTED', target: caseId, details: `Sent ${document} to ${signer} (${email})` });
    res.json(s);
  });
  app.patch("/api/esign/:id", (req, res) => {
    const s = signatureRequests.find(x => x.id === req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    s.status = req.body.status || s.status;
    recordActivity({ actorName: 'System', actorRole: 'System', category: 'ESIGN', action: 'ESIGN_STATUS', target: s.caseId, details: `${s.document} marked ${s.status}` });
    res.json(s);
  });

  // Video consultations
  app.get("/api/consultations", (req, res) => res.json(consultations));
  app.post("/api/consultations", (req, res) => {
    const { caseId, clientName, scheduledFor, provider, adminName } = req.body;
    const meetCode = Math.random().toString(36).substr(2, 8);
    const joinUrl = provider === 'Zoom' ? `https://zoom.us/j/${meetCode}` : `https://meet.google.com/${meetCode}`;
    const c = { id: `con-${Date.now()}`, caseId, clientName, scheduledFor, provider: provider || 'Google Meet', joinUrl, status: 'SCHEDULED' };
    consultations.unshift(c);
    recordActivity({ actorName: adminName || 'Admin', actorRole: 'Admin', category: 'CONSULTATION', action: 'CONSULTATION_SCHEDULED', target: caseId, details: `${provider || 'Google Meet'} for ${clientName} on ${scheduledFor}` });
    res.json(c);
  });

  // Onboarding intake forms
  app.get("/api/onboarding/forms", (req, res) => res.json(ONBOARDING_FORMS));
  app.post("/api/onboarding/submit", (req, res) => {
    const { formId, submitter, payload } = req.body;
    const sub = { id: `sub-${Date.now()}`, formId, submitter, payload, submittedAt: new Date().toISOString(), status: 'NEW' };
    onboardingSubmissions.unshift(sub);
    const formLabel = ONBOARDING_FORMS.find(f => f.id === formId)?.label || formId;
    recordActivity({ actorName: submitter || 'Anonymous', actorRole: 'Client', category: 'ONBOARDING', action: 'INTAKE_SUBMITTED', target: formId, details: `${formLabel} intake submitted` });
    res.json(sub);
  });
  app.get("/api/onboarding/submissions", (req, res) => res.json(onboardingSubmissions));

  // Analytics
  app.get("/api/analytics", (req, res) => {
    const totalCases = cases.length;
    const byPriority = cases.reduce((acc: any, c) => { acc[c.priority] = (acc[c.priority] || 0) + 1; return acc; }, {});
    const byStatus = cases.reduce((acc: any, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
    const byCategory = cases.reduce((acc: any, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {});
    const lawyerLoad = lawyers.map(l => ({ name: l.name, active: l.activeCases, capacity: l.capacity, utilization: Math.round((l.activeCases / l.capacity) * 100) }));
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const day = d.toISOString().slice(0, 10);
      const count = activityLog.filter(a => a.timestamp.slice(0, 10) === day).length;
      return { day: day.slice(5), count };
    });
    res.json({
      totalCases,
      byPriority,
      byStatus,
      byCategory,
      lawyerLoad,
      activityTrend: last7,
      pendingSignatures: signatureRequests.filter(s => s.status === 'PENDING').length,
      upcomingReminders: reminders.filter(r => r.status === 'SCHEDULED').length,
      upcomingConsultations: consultations.filter(c => new Date(c.scheduledFor) > new Date()).length,
      onboardingSubmissions: onboardingSubmissions.length
    });
  });

  // Admin AI assistant (knows the activity stream)
  app.post("/api/ai/admin-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const recent = activityLog.slice(0, 25).map(a => `[${a.timestamp.slice(11,16)}] ${a.actorRole} ${a.actorName} - ${a.action}: ${a.details}`).join('\n');
      const summary = `OPEN CASES: ${cases.length} (HIGH=${cases.filter(c=>c.priority==='HIGH').length}, MED=${cases.filter(c=>c.priority==='MEDIUM').length}, LOW=${cases.filter(c=>c.priority==='LOW').length}). LAWYERS: ${lawyers.length}. PENDING ESIGN: ${signatureRequests.filter(s=>s.status==='PENDING').length}. UPCOMING REMINDERS: ${reminders.filter(r=>r.status==='SCHEDULED').length}.`;

      if (!process.env.GEMINI_API_KEY || !genAI) {
        // Deterministic fallback
        const m = (message || '').toLowerCase();
        let reply = `Activity snapshot:\n${summary}\n\nRecent events:\n${recent.split('\n').slice(0,8).join('\n')}`;
        if (m.includes('priority') || m.includes('urgent')) {
          const high = cases.filter(c => c.priority === 'HIGH').map(c => `• ${c.id} - ${c.title} (next: ${c.nextAction})`).join('\n') || 'No HIGH priority cases.';
          reply = `HIGH-priority cases requiring attention:\n${high}`;
        } else if (m.includes('assign') || m.includes('lawyer')) {
          const unassigned = cases.filter(c => !c.assignedLawyerId).map(c => `• ${c.id} - ${c.title} (${c.category})`).join('\n') || 'All cases are assigned.';
          reply = `Unassigned cases:\n${unassigned}\n\nUse the Lawyer Assignment tab — I will recommend the best match by specialty + capacity + rating.`;
        } else if (m.includes('remind')) {
          reply = `${reminders.filter(r=>r.status==='SCHEDULED').length} reminders are scheduled. Open the Reminders tab to add more.`;
        } else if (m.includes('sign') || m.includes('e-sign')) {
          reply = `Pending signatures: ${signatureRequests.filter(s=>s.status==='PENDING').length}. Open the E-Signature tab to chase or send new requests.`;
        }
        return res.json({ text: reply, fallback: true });
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are the Admin AI Agent for OROELU GODWIN AGIDI & CO. You have full read access to the firm's live activity stream and case data. Be concise, action-oriented, and reference IDs (e.g. CASE-1001) when relevant.

Current firm snapshot:
${summary}

Recent activity stream (newest first):
${recent}`
      });

      const result = await model.generateContent({
        contents: [
          ...(history || []).map((h: any) => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ]
      });
      res.json({ text: (await result.response).text() });
    } catch (error) {
      console.error("Admin AI chat error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // AI Insights API
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { userData } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI Service unavailable" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        As an AI Legal Strategist for OROELU GODWIN AGIDI & CO, analyze this client's profile and provide 3 actionable insights or recommendations.
        
        Client Profile:
        - Company: ${userData.companyName}
        - Industry: ${userData.industry || 'General'}
        - Active Cases: ${JSON.stringify(userData.activeCases || [])}
        
        Focus on:
        1. Risk mitigation (e.g., AML/CTF compliance if applicable).
        2. Growth opportunities (e.g., trademarking, restructuring).
        3. Immediate next steps.
        
        Keep descriptions concise (max 15 words).
        Return purely a JSON array of objects with keys: "title", "description", "type" (one of: 'action', 'recommendation', 'risk').
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Basic cleanup if JSON is wrapped in markdown
      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0].trim();
      }

      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("AI Insights Endpoint Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // AI Chat API
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI Service unavailable" });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are a professional AI Legal Assistant for the Nigerian law firm "OROELU GODWIN AGIDI & CO". 
        Your goal is to provide accurate information and guidance on Nigerian law, including corporate law, litigation, property law, family law, and constitutional matters.
        
        About the Founder - Dr. Oroelu Godwin Agidi:
        - Role: Esteemed Founder and Lead Partner of OROELU GODWIN AGIDI & CO.
        - Key Achievement: Recipient of the prestigious **African Impact Award 2025**, recognizing his profound influence and dedication to excellence across the continent.
        - Academic Distinction: Called to the Nigerian Bar in 1995. Holds a Master’s degree in Diplomacy and Negotiation, and a Doctorate in both Law and Diplomacy.
        - Specialized Expertise: Widely recognized authority in **Regulatory Compliance**, with deep knowledge of Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) protocols.
        - Legal Practice: Over 30 years of active legal practice specializing in high-stakes litigation, property law, corporate restructuring, and commercial law.
        - Multidisciplinary Leadership: Leads a firm that excels in law, arbitration, alternative dispute resolution (ADR), and comprehensive loan and risk management services.
        
        Firm Specializations:
        1. **Corporate Law**: Incorporation, compliance, and complex restructuring.
        2. **Litigation**: High-stakes dispute resolution and appellate advocacy.
        3. **Risk Management**: Comprehensive loan and risk management services.
        4. **Arbitration & ADR**: Expert mediation and arbitration services.

        Guidelines:
        1. Always mention that responses are for informational purposes.
        2. Use Nigerian legal terminology correctly.
        3. Keep responses concise but thorough.
        4. Address: SUITE C20/C21, CHERUB MALL, Lekki, Lagos. Phone: +234 803 320 1909.`
      });

      // Fix for possible chat vs sendMessage issue in some SDK versions
      const result = await model.generateContent({
        contents: [
          ...(history || []).map((h: any) => ({
            role: h.role,
            parts: h.parts
          })),
          { role: 'user', parts: [{ text: message }] }
        ]
      });
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error) {
      console.error("AI Chat Endpoint Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      
      console.log("Sending email to:", to);
      console.log("Subject:", subject);

      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Ensure 'to' is an array of trimmed strings
      const toArray = (Array.isArray(to) ? to : [to]).map(email => email.trim()).filter(email => email.length > 0);

      if (toArray.length === 0) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Basic email regex validation to prevent Resend "pattern mismatch" errors
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = toArray.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        console.warn("Invalid email format detected:", invalidEmails);
        return res.status(400).json({ error: `Invalid email format: ${invalidEmails.join(', ')}` });
      }

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey || resendKey.startsWith("re_123456789") || resendKey === "your_resend_api_key") {
        console.warn("RESEND_API_KEY is not set or is a placeholder. Simulating email send.");
        return res.json({ success: true, message: "Simulated email send." });
      }

      const resend = new Resend(resendKey);
      
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: toArray,
        subject,
        html,
      });

      if (error) {
        console.error("Resend API error:", error);
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || email.trim() === "") {
        return res.status(400).json({ error: "Email is required" });
      }

      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey || resendKey.startsWith("re_123456789") || resendKey === "your_resend_api_key") {
        console.warn("RESEND_API_KEY is not set or is a placeholder. Simulating email send.");
        return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
      }

      const resend = new Resend(resendKey);
      
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [trimmedEmail],
        subject: "Password Reset Request",
        html: `<p>You requested a password reset. Click <a href="#">here</a> to reset your password.</p>`,
      });

      if (error) {
        console.error("Resend API error:", error);
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
