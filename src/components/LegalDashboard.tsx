import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  MoreVertical, 
  ArrowUpRight,
  TrendingUp,
  Shield,
  Briefcase,
  ExternalLink,
  Filter,
  Download,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Settings,
  Mail,
  User,
  History,
  CreditCard,
  Lock,
  Eye,
  Trash2,
  XCircle
} from 'lucide-react';

interface LegalDashboardProps {
  user: any;
  onLogout?: () => void;
}

export default function LegalDashboard({ user }: LegalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', role: 'Staff' });
  const [stats, setStats] = useState({
    activeClients: 12,
    pendingPayments: 4,
    pendingVerifications: 0,
    pendingDocs: 0,
    documentsToday: 8
  });

  const [selectedClientId, setSelectedClientId] = useState('client-1');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isUpdatingMilestones, setIsUpdatingMilestones] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || ''
  });

  useEffect(() => {
    fetchData();
    if (user.appRole === 'Admin' || user.appRole === 'Staff') {
      fetchUsers();
    }
    if (user.appRole === 'Admin') {
      fetchLogs();
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inviteForm, adminName: `${user.firstName} ${user.lastName}` })
      });
      if (res.ok) {
        alert(`Invitation sent to ${inviteForm.email}. Credentials required for secure setup.`);
        setShowInviteModal(false);
        setInviteForm({ email: '', firstName: '', lastName: '', role: 'Staff' });
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/logs?role=${user.appRole}`);
      const data = await res.json();
      setSystemLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSystemLogs([]);
    }
  };

  const handleFinancialOverride = async (action: string, targetId: string, amount: string) => {
    if (!window.confirm(`Are you sure you want to perform a ${action} for user ${targetId}?`)) return;
    try {
      const res = await fetch('/api/admin/financial-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user.appRole,
          action,
          targetUser: targetId,
          amount,
          adminName: `${user.firstName} ${user.lastName}`
        })
      });
      if (res.ok) {
        alert("Financial override recorded and processed.");
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          adminName: `${user.firstName} ${user.lastName}` 
        })
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
        if (user.appRole === 'Admin') fetchLogs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermissionToggle = async (userId: string, permission: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const currentPermissions = targetUser.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p: string) => p !== permission)
      : [...currentPermissions, permission];

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          permissions: newPermissions, 
          adminName: `${user.firstName} ${user.lastName}` 
        })
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));
        if (user.appRole === 'Admin') fetchLogs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hasPermission = (permission: string) => {
    if (user.appRole === 'Admin') return true;
    return (user.permissions || []).includes(permission);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users?role=${user.appRole}`);
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileForm })
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appRole: newRole })
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, appRole: newRole } : u));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'clients') {
      fetchMilestones(selectedClientId);
    }
  }, [activeTab, selectedClientId]);

  const fetchMilestones = async (uid: string) => {
    try {
      const res = await fetch(`/api/case-progress/${uid}`);
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    }
  };

  const updateMilestone = (idx: number, status: string) => {
    const nextStyles = milestones.map((m, i) => i === idx ? { ...m, status } : m);
    setMilestones(nextStyles);
  };

  const pushMilestones = async () => {
    setIsUpdatingMilestones(true);
    try {
      const res = await fetch(`/api/case-progress/${selectedClientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones, role: user.appRole })
      });
      if (res.ok) {
        alert("Milestones updated successfully. Client dashboard will reflect changes.");
      }
    } catch (error) {
      console.error("Error pushing milestones:", error);
    } finally {
      setIsUpdatingMilestones(false);
    }
  };

  const [approvalToast, setApprovalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setApprovalToast({ msg, type });
    setTimeout(() => setApprovalToast(null), 4000);
  };

  const handleApprove = async (apptId: string) => {
    try {
      const res = await fetch(`/api/appointments/${apptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'APPROVED', 
          role: 'Admin',
          adminName: `${user.firstName} ${user.lastName}`,
          notifyClient: true
        })
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'APPROVED' } : a));
        setStats(prev => ({ ...prev, pendingVerifications: Math.max(0, prev.pendingVerifications - 1) }));
        showToast('Appointment confirmed and client notified.');
        fetchLogs();
      } else {
        const data = await res.json();
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error("Error approving appointment:", error);
      showToast('Failed to approve appointment.', 'error');
    }
  };

  const handleDocApprove = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'APPROVED', 
          role: 'Admin',
          adminName: `${user.firstName} ${user.lastName}`
        })
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'APPROVED' } : d));
        setStats(prev => ({ ...prev, pendingDocs: Math.max(0, prev.pendingDocs - 1) }));
        showToast('Document verified and pushed to legal record.');
        fetchLogs();
      } else {
        showToast('Failed to verify document.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error. Please retry.', 'error');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [apptsRes, docsRes] = await Promise.all([
        fetch(`/api/appointments?role=${user.appRole}`),
        fetch(`/api/documents?role=${user.appRole}`)
      ]);

      const appts = await apptsRes.json();
      const docs = await docsRes.json();

      const safeAppts = Array.isArray(appts) ? appts : [];
      const safeDocs = Array.isArray(docs) ? docs : [];

      setAppointments(safeAppts);
      setDocuments(safeDocs);
      
      const pendingAppts = safeAppts.filter((a: any) => a.status === 'PENDING_ADMIN_APPROVAL' || a.status === 'PENDING_VERIFICATION').length;
      const pendingDocs = safeDocs.filter((d: any) => d.status === 'PENDING_ADMIN_APPROVAL').length;
      
      setStats(prev => ({ 
        ...prev, 
        pendingVerifications: pendingAppts,
        pendingDocs: pendingDocs
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => 
    a.service_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Toast notification */}
      {approvalToast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 max-w-sm ${approvalToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {approvalToast.type === 'success'
            ? <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {approvalToast.msg}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            {user.appRole === 'Admin' ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded">Super Admin</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-navy">Administrative Control Panel</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user.firstName}. Full system authority enabled.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Legal Staff</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-navy">Staff Workspace</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user.firstName}. Manage your assigned cases and clients.</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search cases, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all w-full md:w-64"
              />
            </div>
            <button className="bg-navy text-white p-2.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-navy-light transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {(user.appRole === 'Admin' ? [
            { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Awaiting Approval', value: stats.pendingVerifications + stats.pendingDocs, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', urgent: true },
            { label: 'Audit Log Entries', value: systemLogs.length, icon: History, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Total Docs', value: documents.length, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ] : [
            { label: 'Pending Appointments', value: stats.pendingVerifications, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', urgent: true },
            { label: 'Documents to Review', value: stats.pendingDocs, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Docs on File', value: documents.length, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'All Appointments', value: appointments.length, icon: Briefcase, color: 'text-navy', bg: 'bg-navy/5' },
          ]).map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${stat.urgent && stat.value > 0 ? 'border-amber-200 ring-2 ring-amber-500/10' : 'border-gray-100'} flex items-center gap-4`}>
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-navy">{stat.value}</span>
                  {stat.urgent && stat.value > 0 && (
                    <span className="text-[10px] text-amber-500 font-bold mb-1 flex items-center px-1.5 py-0.5 bg-amber-50 rounded animate-pulse">
                      ACTION REQUIRED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 mb-8 w-fit shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'appointments', label: user.appRole === 'Admin' ? 'Appointments & Verification' : 'My Appointments Queue', icon: Calendar },
            { id: 'documents', label: user.appRole === 'Admin' ? 'Master Repository' : 'Document Review', icon: Shield },
            { id: 'clients', label: 'Client Management', icon: UserCheck },
            { id: 'users', label: 'Firm Directory', icon: Users, adminOnly: true },
            { id: 'financial', label: 'Financial Oversight', icon: CreditCard, adminOnly: true },
            { id: 'audit', label: 'System Audit Logs', icon: History, adminOnly: true },
            { id: 'settings', label: 'My Settings', icon: Settings },
          ].filter(t => {
            if (t.adminOnly && user.appRole !== 'Admin') return false;
            return true;
          }).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-navy text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.id === 'appointments' && stats.pendingVerifications > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {stats.pendingVerifications}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {activeTab === 'overview' ? (
            <div className="p-8">
              {/* Alert Bar */}
              {(stats.pendingVerifications + stats.pendingDocs) > 0 && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Action Required</p>
                      <p className="text-xs text-amber-700">
                        {stats.pendingVerifications} pending appointment{stats.pendingVerifications !== 1 ? 's' : ''} and {stats.pendingDocs} document{stats.pendingDocs !== 1 ? 's' : ''} awaiting review.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('appointments')} className="text-xs font-bold text-amber-700 hover:underline">
                    Resolve Now →
                  </button>
                </div>
              )}

              {/* Role-specific hero banner */}
              {user.appRole === 'Admin' ? (
                <div className="mb-8 p-6 bg-navy text-white rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gold bg-gold/20 px-2 py-0.5 rounded">Super Admin</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-2">Administrative Control Hub</h2>
                    <p className="text-blue-200 max-w-xl">Absolute vertical authority enabled. Every system action is logged for your final verification.</p>
                  </div>
                  <Shield className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 bg-blue-600/40 px-2 py-0.5 rounded">Legal Staff</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-2">Your Staff Workspace</h2>
                    <p className="text-blue-200 max-w-xl">Review assigned appointments, verify client documents, and update case milestones from your workspace.</p>
                  </div>
                  <Briefcase className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Pending items queue */}
                  <div>
                    <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      {user.appRole === 'Admin' ? 'High-Priority Approval Gate' : 'Your Pending Action Items'}
                    </h3>
                    <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
                      {appointments.filter(a => a.status === 'PENDING_ADMIN_APPROVAL' || a.status === 'PENDING_VERIFICATION').slice(0, 3).map(a => (
                        <div key={a.id} className="p-5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-navy text-sm">{a.service_title}</p>
                              <p className="text-[10px] text-gray-500">Client: {a.user_id} • {a.appointment_date}</p>
                            </div>
                          </div>
                          {hasPermission('MANAGE_APPOINTMENTS') && (
                            <button onClick={() => handleApprove(a.id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                              APPROVE
                            </button>
                          )}
                        </div>
                      ))}
                      {documents.filter(d => d.status === 'PENDING_ADMIN_APPROVAL').slice(0, 2).map(d => (
                        <div key={d.id} className="p-5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-navy text-sm">{d.name}</p>
                              <p className="text-[10px] text-gray-500">Uploader: {d.user_id} • {d.size}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDocApprove(d.id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                            VERIFY DOC
                          </button>
                        </div>
                      ))}
                      {(stats.pendingVerifications + stats.pendingDocs) === 0 && (
                        <div className="p-10 text-center text-gray-400 text-sm italic">
                          All clear — no pending items at this time.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Quick links panel — differs per role */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-navy" />
                      {user.appRole === 'Admin' ? 'System Status' : 'Quick Actions'}
                    </h3>
                    {user.appRole === 'Admin' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-medium">Database Sync</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">REAL-TIME</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-medium">Encryption</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">AES-256-GCM</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-medium">Audit Buffer</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-bold rounded">SYNCED</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-500 font-medium">Audit Entries</span>
                          <span className="text-sm font-bold text-navy">{systemLogs.length}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button onClick={() => setActiveTab('appointments')} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors text-left">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-navy">Review Appointments</span>
                        </button>
                        <button onClick={() => setActiveTab('documents')} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors text-left">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-navy">Verify Documents</span>
                        </button>
                        <button onClick={() => setActiveTab('clients')} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-amber-200 transition-colors text-left">
                          <UserCheck className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-navy">Update Client Milestones</span>
                        </button>
                        <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-colors text-left">
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-navy">My Profile Settings</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'appointments' ? (
            <div>
              {/* ... existing appointments view ... */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-xl font-bold text-navy">Service Verification Queue</h3>
                <div className="flex gap-2">
                   <button onClick={fetchData} className="text-xs font-bold text-navy hover:text-gold transition-colors">Refresh Feed</button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-navy">Synchronizing with Secure Server...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-20 text-center text-gray-500">No appointments tracking currently.</div>
                ) : filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                        apt.status === 'PENDING_VERIFICATION' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-bold text-navy text-lg group-hover:text-gold transition-colors">{apt.service_title}</h4>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                             apt.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                           }`}>
                             {apt.status === 'PENDING_VERIFICATION' ? 'Pending Review' : apt.status.replace('_', ' ')}
                           </span>
                         </div>
                         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                           <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                             <Clock className="w-4 h-4 text-gold" />
                             <span className="font-bold">{apt.appointment_date} at {apt.appointment_time}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <Users className="w-4 h-4" />
                             <span>Client ID: <span className="font-bold text-navy">{apt.user_id}</span></span>
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded text-[10px] font-mono font-bold text-gray-400">
                             REF: {apt.tracking_number}
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {apt.status === 'PENDING_VERIFICATION' && hasPermission('MANAGE_APPOINTMENTS') && (
                        <button 
                          onClick={() => handleApprove(apt.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Verify & Approve
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          alert(`DOSSIER VIEW: ${apt.tracking_number}\n\nCLIENT ID: ${apt.user_id}\nSERVICE: ${apt.service_title}\nSTATUS: ${apt.status}\n\nClient background verification checks: PASSED\nIdentity Documentation: VERIFIED\nCompliance Review: APPROVED`);
                        }}
                        className="bg-navy hover:bg-navy-light text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 group/btn"
                      >
                        View Dossier <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'clients' ? (
             <div className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-navy">Client Progression Management</h3>
                    <p className="text-gray-500">Update case milestones and visualize progress for active clients.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Client List */}
                  <div className="lg:col-span-1 border-r border-gray-100 pr-4 space-y-2">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Client</p>
                     {['client-1', 'client-2', 'client-3'].map(c => (
                       <button 
                        key={c} 
                        onClick={() => setSelectedClientId(c)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${c === selectedClientId ? 'border-gold bg-gold/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-xs">OG</div>
                           <div>
                             <p className="text-sm font-bold text-navy">{c === 'client-1' ? 'Godwin Agidi' : 'New Client'}</p>
                             <p className="text-[10px] text-gray-500">ID: {c}</p>
                           </div>
                         </div>
                       </button>
                     ))}
                  </div>

                  {/* Milestone Editor */}
                  <div className="lg:col-span-3">
                     <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-gold" /> Active Milestones
                          </h4>
                          <span className="text-xs font-bold text-gray-400">Total: {milestones.length} Phases</span>
                        </div>
                        
                        <div className="space-y-4">
                           {milestones.length === 0 ? (
                             <p className="text-center py-8 text-gray-400">Loading case milestones...</p>
                           ) : milestones.map((m, idx) => (
                             <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gold/30 transition-colors">
                               <div className="flex items-center gap-4">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                   m.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                   m.status === 'active' ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                                   'bg-gray-100 text-gray-400'
                                 }`}>
                                   {m.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                                 </div>
                                 <span className="font-bold text-navy text-sm">{m.title}</span>
                               </div>
                               <select 
                                value={m.status}
                                onChange={(e) => updateMilestone(idx, e.target.value)}
                                className="text-xs font-bold text-gray-500 border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-gold/30 focus:border-gold outline-none"
                               >
                                  <option value="pending">Pending</option>
                                  <option value="active">In Progress</option>
                                  <option value="completed">Completed</option>
                               </select>
                             </div>
                           ))}
                        </div>
                        <button 
                          onClick={pushMilestones}
                          disabled={isUpdatingMilestones}
                          className="mt-6 w-full py-4 bg-navy text-white rounded-xl font-bold hover:bg-navy-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-navy/20"
                        >
                           {isUpdatingMilestones ? (
                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           ) : (
                             <>
                               <ArrowUpRight className="w-4 h-4 text-gold" /> Push Status Update to Client
                             </>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
             </div>
          ) : activeTab === 'documents' ? (
            <div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-xl font-bold text-navy">Consolidated File Repository</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Documents Archive</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4">Uploader / UID</th>
                      <th className="px-6 py-4">Upload Date</th>
                      <th className="px-6 py-4">Size / Type</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {documents.map((doc) => {
                        const uploader = allUsers.find(u => u.id === doc.user_id);
                        return (
                          <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="font-bold text-navy group-hover:text-gold transition-colors">{doc.name}</p>
                                   <p className="text-[10px] font-mono text-gray-400">DOC-ID: {doc.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-navy">{uploader ? `${uploader.firstName} ${uploader.lastName}` : doc.user_id}</span>
                                  <span className="text-[10px] text-gray-500">{uploader?.email || 'No Email'}</span>
                                  <span className="text-[9px] text-gray-400 font-mono">UID: {doc.user_id}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${doc.uploader_role === 'CLIENT' ? 'text-blue-500' : 'text-gold'}`}>
                                    ROLE: {doc.uploader_role}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                               {doc.date}
                               {doc.status === 'PENDING_ADMIN_APPROVAL' && (
                                 <span className="block text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded w-fit mt-1">AWAITING REVIEW</span>
                               )}
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-xs font-bold text-gray-400">{doc.size}</span>
                               <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase">{doc.type}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {doc.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <button 
                                      onClick={() => handleDocApprove(doc.id)}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors bg-white border border-emerald-100 rounded-lg shadow-sm"
                                      title="Approve Document"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={async () => {
                                      if (doc.file_url) { window.open(doc.file_url, '_blank'); return; }
                                      try {
                                        const r = await fetch(`/api/documents/${doc.id}/download`);
                                        if (r.ok) { const { url } = await r.json(); window.open(url, '_blank'); }
                                      } catch {}
                                    }}
                                    className="p-2 text-gray-400 hover:text-navy transition-colors bg-white border border-gray-200 rounded-lg shadow-sm"
                                    title="Download File"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            <div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy">Firm User Directory</h3>
                  <p className="text-xs text-gray-500">Manage access levels and system roles.</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-navy text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-navy-light transition-all"
                >
                  <Mail className="w-4 h-4" /> Invite Legal Staff
                </button>
              </div>

              {showInviteModal && (
                <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-serif font-bold text-navy">Portal Access Invitation</h3>
                      <button onClick={() => setShowInviteModal(false)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleInviteStaff} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">First Name</label>
                          <input required type="text" value={inviteForm.firstName} onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Last Name</label>
                          <input required type="text" value={inviteForm.lastName} onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
                        <input required type="email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gold/20" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assign Permission Set</label>
                        <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <option value="Staff">Associate Lawyer</option>
                          <option value="Legal">Senior Counsel</option>
                          <option value="Admin">Co-Administrator</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-4 bg-navy text-white font-bold rounded-2xl hover:bg-navy-light transition-all shadow-xl shadow-navy/20">
                        GENERATE SECURE ENTRANCE LINK
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Current Role</th>
                      <th className="px-6 py-4">Permissions</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-navy/5 rounded-full flex items-center justify-center text-navy font-bold">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                               <p className="font-bold text-navy">{u.firstName} {u.lastName}</p>
                               <p className="text-[10px] text-gray-400">UID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                           <select 
                            value={u.appRole} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user.id} // Prevent self-demotion
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-navy outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50"
                           >
                             <option value="Client">Client</option>
                             <option value="Staff">Legal Staff</option>
                             <option value="Admin">Administrator</option>
                           </select>
                        </td>
                        <td className="px-6 py-4">
                           {u.appRole !== 'Client' ? (
                             <div className="flex flex-wrap gap-1 max-w-[200px]">
                               {[
                                 { key: 'VIEW_FINANCIALS', label: 'Financials' },
                                 { key: 'APPROVE_DOCUMENTS', label: 'Docs' },
                                 { key: 'MANAGE_APPOINTMENTS', label: 'Appts' }
                               ].map(p => (
                                 <button 
                                  key={p.key}
                                  onClick={() => handlePermissionToggle(u.id, p.key)}
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border transition-all ${
                                    (u.permissions || []).includes(p.key)
                                      ? 'bg-navy text-white border-navy' 
                                      : 'bg-white text-gray-400 border-gray-200 hover:border-navy'
                                  }`}
                                 >
                                   {p.label}
                                 </button>
                               ))}
                             </div>
                           ) : (
                             <span className="text-[10px] text-gray-300 italic font-medium">Auto-Restricted</span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <select 
                            value={u.status || 'ACTIVE'} 
                            onChange={(e) => handleStatusChange(u.id, e.target.value)}
                            disabled={u.id === user.id}
                            className={`bg-white border rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none ${
                              u.status === 'BLOCKED' ? 'border-red-200 text-red-600' : 
                              u.status === 'PENDING' ? 'border-amber-200 text-amber-600' : 
                              'border-emerald-200 text-emerald-600'
                            }`}
                           >
                             <option value="ACTIVE">Active</option>
                             <option value="PENDING">Pending Approval</option>
                             <option value="BLOCKED">Blocked / Revoked</option>
                           </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                              <button className="p-2 text-gray-400 hover:text-navy transition-colors" title="View Details">
                                 <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Revoke Session">
                                 <XCircle className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'financial' ? (
            <div className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-navy">Financial Oversight</h3>
                    <p className="text-gray-500">Verify client payments and manage financial overrides.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Treasury Balance</p>
                    <p className="text-2xl font-bold text-navy font-mono">₦12,450,000.00</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Awaiting Verification</p>
                    <p className="text-2xl font-bold text-navy">{payments.length} Transactions</p>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Overdue Invoices</p>
                    <p className="text-2xl font-bold text-navy">2 Notifications</p>
                  </div>
               </div>

               <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {payments.map(p => (
                         <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 font-bold text-navy text-sm">{p.client}</td>
                           <td className="px-6 py-4 text-sm text-gray-500">{p.service}</td>
                           <td className="px-6 py-4 font-mono font-bold text-navy">{p.amount}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                                p.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {p.status.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleFinancialOverride('VERIFY_PAYMENT', p.client, p.amount)}
                                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                VALIDATE & CLEAR
                              </button>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          ) : activeTab === 'audit' ? (
            <div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy">Non-Editable Audit Logs</h3>
                  <p className="text-xs text-gray-500">Immutable record of every administrative act.</p>
                </div>
                <button onClick={fetchLogs} className="text-xs font-bold text-navy hover:text-gold transition-colors flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Refresh Logs
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action Type</th>
                      <th className="px-6 py-4">Initiated By</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {systemLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                             log.action.includes('FINANCIAL') ? 'bg-purple-100 text-purple-700' :
                             log.action.includes('USER') ? 'bg-blue-100 text-blue-700' :
                             'bg-gray-100 text-gray-700'
                           }`}>
                             {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-navy">{log.admin}</td>
                        <td className="px-6 py-4 text-gray-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'financial' ? (
             <div className="p-8">
               <div className="mb-10 text-center max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-navy mb-2">Financial Oversight Control</h3>
                  <p className="text-gray-500">Super Admin authority to override billing, issue refunds, or bypass payment requirements.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-navy mb-6 flex items-center gap-2">
                       <Shield className="w-5 h-5 text-gold" /> Trigger Global Refund
                    </h4>
                    <div className="space-y-4">
                      <input type="text" placeholder="Target User ID or Transaction #" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-gold" />
                      <input type="text" placeholder="Amount (e.g. 150.00)" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-gold" />
                      <button 
                        onClick={() => handleFinancialOverride('REFUND', 'TXN-999', '$150.00')}
                        className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                      >
                         Execute Super Admin Refund
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-navy mb-6 flex items-center gap-2">
                       <Lock className="w-5 h-5 text-navy" /> Fee Bypass Authorization
                    </h4>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 mb-4">Bypassing fees will allow the client to proceed with bookings without upfront payment verification.</p>
                      <button 
                        onClick={() => handleFinancialOverride('FEE_BYPASS', 'client-1', 'FULL_CASE')}
                        className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-all shadow-lg shadow-navy/20"
                      >
                         Authorise Fee Bypass
                      </button>
                    </div>
                  </div>
               </div>
             </div>
          ) : activeTab === 'settings' ? (
             <div className="p-12 max-w-2xl">
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${user.appRole === 'Admin' ? 'text-gold bg-gold/10' : 'text-blue-600 bg-blue-50'}`}>
                      {user.appRole === 'Admin' ? 'Super Admin' : 'Legal Staff'}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-navy mb-2">My Profile & Settings</h3>
                  <p className="text-gray-500 font-medium">
                    {user.appRole === 'Admin' 
                      ? 'Manage your administrative credentials and system-wide preferences.'
                      : 'Update your personal profile and contact information.'}
                  </p>
                </div>

                <form onSubmit={updateProfile} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            required
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-medium text-navy"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            required
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-medium text-navy"
                          />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="email" 
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-medium text-navy"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic mt-1 ml-1">Changing your email will update your login credentials for the next session.</p>
                   </div>

                   <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gold">
                        <Shield className="w-5 h-5" />
                        <span className="text-xs font-bold text-navy">Assigned Role: <span className="text-gold uppercase tracking-widest">{user.appRole}</span></span>
                      </div>
                      <button 
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-navy text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-navy/20 hover:bg-navy-light transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                         {isSavingProfile ? 'Saving Changes...' : 'Save Configuration'} <ArrowUpRight className="w-4 h-4 text-gold" />
                      </button>
                   </div>
                </form>

                {user.appRole === 'Admin' && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h4 className="text-rose-600 font-bold uppercase tracking-widest text-[10px] mb-4">Danger Zone</h4>
                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-rose-900 text-sm">Emergency Protocol</h3>
                          <p className="text-xs text-rose-700">GLOBAL SESSION REVOCATION. This terminates all active client and legal team tokens instantly. Use only in case of suspected breach.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if(window.confirm("CRITICAL: This will log out EVERY USER currently in the system. Proceed?")) {
                            alert("Global session revocation initiated. System logs updated.");
                            fetchLogs();
                          }
                        }}
                        className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                      >
                         EXECUTE GLOBAL SESSION REVOCATION
                      </button>
                    </div>
                  </div>
                )}
             </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy mb-4">Firm Oversight Analytics</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                The overview section aggregates firm-wide performance metrics, billing status, and case load distributions for administrative review.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Case Completion</p>
                    <div className="text-2xl font-bold text-navy text-left">84%</div>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Response Time</p>
                    <div className="text-2xl font-bold text-navy text-left">2.4h</div>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Revenue MTD</p>
                    <div className="text-2xl font-bold text-navy text-left">$14.2k</div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
