import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Activity, ClipboardList, GitBranch, FolderLock, UserCog,
  Bell, FileSignature, Video, NotebookPen, Flag, BarChart3, Send,
  Search, RefreshCw, Plus, ShieldAlert, CheckCircle2, Clock, ExternalLink,
  Bot, Zap, Users, Pencil, Trash2, UserPlus
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

interface Props { user: any }

type TabId =
  | 'overview' | 'activity' | 'onboarding' | 'cases' | 'vault'
  | 'assignment' | 'staffManagement' | 'reminders' | 'esign' | 'consult' | 'notes' | 'analytics';

const TABS: { id: TabId; label: string; icon: any; }[] = [
  { id: 'overview', label: 'AI Overview', icon: Sparkles },
  { id: 'activity', label: 'Activity Stream', icon: Activity },
  { id: 'onboarding', label: 'Smart Onboarding', icon: ClipboardList },
  { id: 'cases', label: 'Case Timeline', icon: GitBranch },
  { id: 'vault', label: 'Document Vault', icon: FolderLock },
  { id: 'assignment', label: 'Lawyer Assignment', icon: UserCog },
  { id: 'staffManagement', label: 'Staff Management', icon: Users },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'esign', label: 'E-Signatures', icon: FileSignature },
  { id: 'consult', label: 'Video Consults', icon: Video },
  { id: 'notes', label: 'Internal Notes', icon: NotebookPen },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-rose-100 text-rose-700 border-rose-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const PIE_COLORS = ['#0a2540', '#c9a14a', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function AdminAIPanel({ user }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Shared data
  const [activity, setActivity] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [consults, setConsults] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  // AI chat
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; fallback?: boolean }[]>([
    { role: 'model', text: `Hello ${user.firstName}. I'm your Admin AI Agent. I have full visibility of every action across clients, staff, and the firm. Ask me anything — try "what's my highest priority case?" or "summarize today's activity".` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const adminName = `${user.firstName} ${user.lastName}`.trim() || 'Admin';

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [a, c, lw, rm, sg, co, fm, sb, doc, an] = await Promise.all([
        fetch(`/api/activity?role=Admin&limit=200`).then(r => r.json()),
        fetch(`/api/cases?role=Admin`).then(r => r.json()),
        fetch(`/api/lawyers`).then(r => r.json()),
        fetch(`/api/reminders`).then(r => r.json()),
        fetch(`/api/esign`).then(r => r.json()),
        fetch(`/api/consultations`).then(r => r.json()),
        fetch(`/api/onboarding/forms`).then(r => r.json()),
        fetch(`/api/onboarding/submissions`).then(r => r.json()),
        fetch(`/api/documents?role=Admin`).then(r => r.json()),
        fetch(`/api/analytics`).then(r => r.json())
      ]);
      setActivity(Array.isArray(a) ? a : []);
      setCases(Array.isArray(c) ? c : []);
      setLawyers(Array.isArray(lw) ? lw : []);
      setReminders(Array.isArray(rm) ? rm : []);
      setSignatures(Array.isArray(sg) ? sg : []);
      setConsults(Array.isArray(co) ? co : []);
      setForms(Array.isArray(fm) ? fm : []);
      setSubmissions(Array.isArray(sb) ? sb : []);
      setDocuments(Array.isArray(doc) ? doc : []);
      setAnalytics(an && !an.error ? an : null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAll(); }, []);
  useEffect(() => {
    const id = setInterval(() => { fetch(`/api/activity?role=Admin&limit=50`).then(r => r.json()).then(d => Array.isArray(d) && setActivity(prev => mergeActivity(prev, d))).catch(() => {}); }, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, chatBusy]);

  function mergeActivity(prev: any[], next: any[]) {
    const ids = new Set(prev.map(p => p.id));
    const incoming = next.filter(n => !ids.has(n.id));
    return [...incoming, ...prev].slice(0, 200);
  }

  const filteredActivity = useMemo(() => activity.filter(a => {
    if (activityFilter !== 'ALL' && a.category !== activityFilter) return false;
    if (!activitySearch) return true;
    const q = activitySearch.toLowerCase();
    return [a.actorName, a.action, a.details, a.target].some((v: any) => String(v || '').toLowerCase().includes(q));
  }), [activity, activitySearch, activityFilter]);

  const lawyerById = useMemo(() => Object.fromEntries(lawyers.map(l => [l.id, l])), [lawyers]);

  // ----- AI Chat -----
  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatBusy) return;
    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setChatInput('');
    setChatBusy(true);
    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const res = await fetch('/api/ai/admin-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'model', text: data.text || 'No response.', fallback: data.fallback }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'model', text: 'Sorry — I could not reach the AI service.' }]);
    } finally { setChatBusy(false); }
  };

  // ----- Onboarding submit -----
  const [obFormId, setObFormId] = useState<string>('');
  const [obFields, setObFields] = useState<Record<string, string>>({});
  const submitOnboarding = async () => {
    if (!obFormId) return;
    await fetch('/api/onboarding/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: obFormId, submitter: adminName, payload: obFields })
    });
    setObFields({}); setObFormId('');
    refreshAll();
  };

  // ----- Case actions -----
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [caseNotes, setCaseNotes] = useState<any[]>([]);
  const [newTimelineEvent, setNewTimelineEvent] = useState({ event: '', detail: '' });
  const [newNote, setNewNote] = useState('');
  useEffect(() => {
    if (!selectedCaseId) { setTimeline([]); setCaseNotes([]); return; }
    fetch(`/api/cases/${selectedCaseId}/timeline`).then(r => r.json()).then(setTimeline);
    fetch(`/api/cases/${selectedCaseId}/notes`).then(r => r.json()).then(setCaseNotes);
  }, [selectedCaseId]);
  useEffect(() => { if (!selectedCaseId && cases[0]) setSelectedCaseId(cases[0].id); }, [cases, selectedCaseId]);

  const addTimelineEvent = async () => {
    if (!selectedCaseId || !newTimelineEvent.event) return;
    await fetch(`/api/cases/${selectedCaseId}/timeline`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTimelineEvent, adminName })
    });
    setNewTimelineEvent({ event: '', detail: '' });
    fetch(`/api/cases/${selectedCaseId}/timeline`).then(r => r.json()).then(setTimeline);
    refreshAll();
  };

  const addNote = async () => {
    if (!selectedCaseId || !newNote.trim()) return;
    await fetch(`/api/cases/${selectedCaseId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: adminName, role: 'Admin', text: newNote })
    });
    setNewNote('');
    fetch(`/api/cases/${selectedCaseId}/notes`).then(r => r.json()).then(setCaseNotes);
    refreshAll();
  };

  const setPriority = async (id: string, priority: string) => {
    await fetch(`/api/cases/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority, adminName })
    });
    setCases(prev => prev.map(c => c.id === id ? { ...c, priority } : c));
    refreshAll();
  };

  // ----- Lawyer assignment -----
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recCaseId, setRecCaseId] = useState('');
  const recommend = async (caseId: string) => {
    setRecCaseId(caseId);
    const r = await fetch('/api/lawyers/recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId })
    }).then(r => r.json());
    setRecommendations(Array.isArray(r) ? r : []);
  };
  const assignLawyer = async (caseId: string, lawyerId: string) => {
    await fetch('/api/lawyers/assign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId, lawyerId, adminName })
    });
    refreshAll();
    setRecommendations([]); setRecCaseId('');
  };

  // ----- Staff Management -----
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', specialties: '', capacity: '8' });
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffMsg, setStaffMsg] = useState('');

  const addStaff = async () => {
    if (!staffForm.firstName || !staffForm.email) return;
    setStaffSaving(true);
    try {
      await fetch('/api/staff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffForm,
          specialties: staffForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
          capacity: parseInt(staffForm.capacity) || 8,
          adminName
        })
      });
      setStaffMsg('Staff member added successfully.');
      setStaffForm({ firstName: '', lastName: '', email: '', specialties: '', capacity: '8' });
      refreshAll();
    } finally {
      setStaffSaving(false);
      setTimeout(() => setStaffMsg(''), 3000);
    }
  };

  const updateStaff = async (id: string) => {
    const name = `${editForm.firstName} ${editForm.lastName}`.trim();
    const specialties = typeof editForm.specialties === 'string'
      ? editForm.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      : editForm.specialties;
    await fetch(`/api/staff/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialties, capacity: parseInt(editForm.capacity) || 8, adminName })
    });
    setEditingStaff(null);
    refreshAll();
  };

  const removeStaff = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the legal team?`)) return;
    await fetch(`/api/staff/${id}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName })
    });
    refreshAll();
  };

  // ----- Reminders -----
  const [newReminder, setNewReminder] = useState({ caseId: '', title: '', dueDate: '', channel: 'email' });
  const addReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) return;
    await fetch('/api/reminders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newReminder, adminName })
    });
    setNewReminder({ caseId: '', title: '', dueDate: '', channel: 'email' });
    refreshAll();
  };

  // ----- E-Sign -----
  const [newSig, setNewSig] = useState({ caseId: '', document: '', signer: '', email: '' });
  const sendSig = async () => {
    if (!newSig.document || !newSig.email) return;
    await fetch('/api/esign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSig, adminName })
    });
    setNewSig({ caseId: '', document: '', signer: '', email: '' });
    refreshAll();
  };
  const markSigned = async (id: string) => {
    await fetch(`/api/esign/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SIGNED' })
    });
    refreshAll();
  };

  // ----- Consultations -----
  const [newConsult, setNewConsult] = useState({ caseId: '', clientName: '', scheduledFor: '', provider: 'Google Meet' });
  const addConsult = async () => {
    if (!newConsult.clientName || !newConsult.scheduledFor) return;
    await fetch('/api/consultations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newConsult, adminName })
    });
    setNewConsult({ caseId: '', clientName: '', scheduledFor: '', provider: 'Google Meet' });
    refreshAll();
  };

  // ----- Render helpers -----
  const SeverityDot = ({ s }: { s: string }) => (
    <span className={`inline-block w-2 h-2 rounded-full ${s === 'critical' ? 'bg-rose-500' : s === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
  );

  const categoryFilters = ['ALL', ...Array.from(new Set(activity.map(a => a.category)))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-navy via-navy to-[#0a3a6a] text-white rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">Admin AI Center</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Welcome back, {user.firstName}</h1>
              <p className="text-blue-100 max-w-xl text-sm">Your AI legal intake assistant is mirroring every action across clients, staff, and the firm in real time. Manage cases, run the assignment engine, and act on AI insights — all from one cockpit.</p>
            </div>
            <button onClick={refreshAll} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Live Data
            </button>
          </div>
          <Bot className="absolute -right-10 -bottom-10 w-72 h-72 text-white/5 rotate-12" />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Open Cases', value: cases.length, icon: GitBranch, color: 'text-navy', bg: 'bg-navy/10' },
            { label: 'Activity / 24h', value: activity.filter(a => Date.now() - new Date(a.timestamp).getTime() < 86400000).length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending E-Sign', value: signatures.filter(s => s.status === 'PENDING').length, icon: FileSignature, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Reminders', value: reminders.filter(r => r.status === 'SCHEDULED').length, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Upcoming Consults', value: consults.filter(c => new Date(c.scheduledFor) > new Date()).length, icon: Video, color: 'text-rose-600', bg: 'bg-rose-50' }
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 ${k.bg} ${k.color} rounded-xl flex items-center justify-center`}>
                <k.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{k.label}</p>
                <p className="text-2xl font-bold text-navy">{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 mb-6 shadow-sm">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id ? 'bg-navy text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {/* OVERVIEW + AI ASSISTANT */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-gold to-amber-400 rounded-xl flex items-center justify-center text-white shadow">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-navy">Admin AI Agent</h2>
                    <p className="text-xs text-gray-500">Knows every action, every user, every case.</p>
                  </div>
                </div>
                <div ref={chatBoxRef} className="h-[420px] overflow-y-auto bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                        m.role === 'user' ? 'bg-navy text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none text-gray-800'
                      }`}>
                        {m.text}
                        {m.fallback && <div className="mt-2 text-[10px] opacity-60 uppercase tracking-widest">offline mode — connect Gemini key for full reasoning</div>}
                      </div>
                    </div>
                  ))}
                  {chatBusy && <div className="text-xs text-gray-400 italic">Agent is thinking…</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder='Try: "what needs my attention today?"'
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm" />
                  <button onClick={sendChat} disabled={chatBusy || !chatInput.trim()}
                    className="bg-navy hover:bg-navy-light text-white px-5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "What's my highest priority case?",
                    "Summarize today's activity",
                    "Which cases are unassigned?",
                    "Any pending signatures?"
                  ].map(s => (
                    <button key={s} onClick={() => setChatInput(s)} className="text-[11px] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: live priorities + activity */}
              <div className="lg:col-span-2 p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-rose-500" /> Priority Queue</h3>
                  <div className="space-y-2">
                    {cases.filter(c => c.priority === 'HIGH').slice(0, 3).map(c => (
                      <div key={c.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="text-xs font-mono text-rose-700">{c.id}</p>
                        <p className="text-sm font-bold text-navy line-clamp-1">{c.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Next: {c.nextAction}</p>
                      </div>
                    ))}
                    {cases.filter(c => c.priority === 'HIGH').length === 0 && <p className="text-xs text-gray-400 italic">No HIGH priority cases.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> Live Activity</h3>
                  <div className="space-y-1 max-h-[260px] overflow-y-auto pr-2">
                    {activity.slice(0, 8).map(a => (
                      <div key={a.id} className="p-2 border-b border-gray-50 text-xs flex items-start gap-2">
                        <SeverityDot s={a.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-navy">{a.action} <span className="font-normal text-gray-400">· {a.actorName}</span></p>
                          <p className="text-gray-500 line-clamp-2">{a.details}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY STREAM */}
          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy">Unified Activity Stream</h2>
                  <p className="text-sm text-gray-500">Every action from clients, staff, and admins is mirrored here for AI analysis.</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={activitySearch} onChange={e => setActivitySearch(e.target.value)} placeholder="Search activity..."
                      className="pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
                  </div>
                  <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    {categoryFilters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-[10px] uppercase tracking-widest text-gray-500">
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivity.map(a => (
                      <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><SeverityDot s={a.severity} /> <span className="font-bold text-navy">{a.actorName}</span> <span className="text-[10px] text-gray-400">{a.actorRole}</span></div></td>
                        <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 bg-gray-100 rounded font-bold">{a.category}</span></td>
                        <td className="px-4 py-3 text-xs font-mono text-navy">{a.action}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{a.target}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{a.details}</td>
                      </tr>
                    ))}
                    {filteredActivity.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400 italic">No activity matches your filter.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SMART ONBOARDING */}
          {activeTab === 'onboarding' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Smart Intake Forms</h2>
                <p className="text-sm text-gray-500 mb-4">AI-routed intake based on matter type. Submissions auto-stream into Activity & Cases.</p>
                <div className="space-y-2 mb-4">
                  {forms.map(f => (
                    <button key={f.id} onClick={() => { setObFormId(f.id); setObFields({}); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${obFormId === f.id ? 'border-gold bg-gold/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <p className="font-bold text-navy">{f.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{f.fields.length} smart fields</p>
                    </button>
                  ))}
                </div>
                {obFormId && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                    <p className="text-xs font-bold text-navy">Fill {forms.find(f => f.id === obFormId)?.label}</p>
                    {forms.find(f => f.id === obFormId)?.fields.map((field: string) => (
                      <input key={field} placeholder={field} value={obFields[field] || ''}
                        onChange={e => setObFields(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    ))}
                    <button onClick={submitOnboarding} className="bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Submit Intake
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-navy mb-3">Recent Submissions</h3>
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
                  {submissions.length === 0 && <p className="text-xs text-gray-400 italic">No intakes yet. Submit one on the left to see the AI route it.</p>}
                  {submissions.map(s => (
                    <div key={s.id} className="p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-navy">{forms.find(f => f.id === s.formId)?.label || s.formId}</p>
                        <span className="text-[10px] text-gray-400">{new Date(s.submittedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">By {s.submitter}</p>
                      <pre className="mt-2 text-[10px] bg-gray-50 p-2 rounded text-gray-700 overflow-x-auto">{JSON.stringify(s.payload, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CASES + TIMELINE + PRIORITY */}
          {activeTab === 'cases' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2">
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">Cases</h2>
                {cases.map(c => (
                  <button key={c.id} onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left p-4 rounded-xl border ${selectedCaseId === c.id ? 'border-gold bg-gold/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-400">{c.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    </div>
                    <p className="text-sm font-bold text-navy line-clamp-2">{c.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{c.clientName} · {c.category}</p>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2 space-y-6">
                {selectedCaseId && (() => {
                  const c = cases.find(x => x.id === selectedCaseId);
                  if (!c) return null;
                  return (
                    <>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-[10px] font-mono text-gray-400">{c.id}</p>
                            <h3 className="font-serif text-xl font-bold text-navy">{c.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{c.clientName} · {c.category} · Status {c.status}</p>
                            <p className="text-xs text-navy mt-1">Next: <span className="font-bold">{c.nextAction}</span> by {new Date(c.nextActionDate).toLocaleDateString()}</p>
                            {c.assignedLawyerId && <p className="text-xs text-emerald-600 mt-1">Assigned: {lawyerById[c.assignedLawyerId]?.name}</p>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Priority</p>
                            <div className="flex gap-1">
                              {['LOW','MEDIUM','HIGH'].map(p => (
                                <button key={p} onClick={() => setPriority(c.id, p)}
                                  className={`text-[10px] px-2 py-1 rounded font-bold border ${c.priority === p ? PRIORITY_COLORS[p] : 'bg-white text-gray-500 border-gray-200'}`}>{p}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-navy mb-3 flex items-center gap-2"><GitBranch className="w-4 h-4 text-gold" /> Timeline Visualization</h4>
                        <div className="relative pl-6 border-l-2 border-gold/30 space-y-4">
                          {timeline.map(t => (
                            <div key={t.id} className="relative">
                              <span className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-gold border-2 border-white shadow"></span>
                              <p className="text-xs text-gray-400">{new Date(t.date).toLocaleString()}</p>
                              <p className="font-bold text-navy text-sm">{t.event}</p>
                              {t.detail && <p className="text-xs text-gray-600">{t.detail}</p>}
                            </div>
                          ))}
                          {timeline.length === 0 && <p className="text-xs text-gray-400 italic">No events yet.</p>}
                        </div>
                        <div className="mt-4 flex flex-col md:flex-row gap-2">
                          <input placeholder="Event (e.g. Hearing scheduled)" value={newTimelineEvent.event}
                            onChange={e => setNewTimelineEvent(p => ({ ...p, event: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                          <input placeholder="Detail (optional)" value={newTimelineEvent.detail}
                            onChange={e => setNewTimelineEvent(p => ({ ...p, detail: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                          <button onClick={addTimelineEvent} className="bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg">Log Event</button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* DOCUMENT VAULT */}
          {activeTab === 'vault' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy">Secure Document Vault</h2>
                  <p className="text-sm text-gray-500">AES-256-GCM encrypted at rest. Every download is recorded in the activity stream.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-600">Vault Healthy</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {documents.map(d => (
                  <div key={d.id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FolderLock className="w-5 h-5" /></div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
                    </div>
                    <p className="font-bold text-navy text-sm line-clamp-2">{d.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{d.user_id} · {d.size} · {d.date}</p>
                  </div>
                ))}
                {documents.length === 0 && <p className="text-xs text-gray-400 italic col-span-full">No documents yet.</p>}
              </div>
            </div>
          )}

          {/* LAWYER ASSIGNMENT ENGINE */}
          {activeTab === 'assignment' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Lawyer Assignment Engine</h2>
                <p className="text-sm text-gray-500 mb-4">AI scores each lawyer by specialty match, capacity, and rating.</p>
                <div className="space-y-2">
                  {cases.map(c => (
                    <div key={c.id} className="p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-mono text-gray-400">{c.id}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                      </div>
                      <p className="text-sm font-bold text-navy line-clamp-1">{c.title}</p>
                      <p className="text-[10px] text-gray-500 mb-2">Currently: {c.assignedLawyerId ? lawyerById[c.assignedLawyerId]?.name : 'Unassigned'}</p>
                      <button onClick={() => recommend(c.id)} className="text-[10px] font-bold text-navy bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-lg">Recommend Lawyer</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy mb-3">{recCaseId ? `AI Recommendations for ${recCaseId}` : 'Firm Bench'}</h3>
                <div className="space-y-2">
                  {(recommendations.length ? recommendations : lawyers.map(l => ({ lawyer: l, score: null, reason: `${l.activeCases}/${l.capacity} active cases · Rating ${l.rating}` }))).map((r, i) => (
                    <div key={r.lawyer.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {r.score !== null && <span className="text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded">#{i + 1} · {r.score}pt</span>}
                          <p className="font-bold text-navy text-sm">{r.lawyer.name}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{r.lawyer.specialties.join(' · ')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{r.reason}</p>
                      </div>
                      {recCaseId && (
                        <button onClick={() => assignLawyer(recCaseId, r.lawyer.id)} className="bg-navy text-white text-[10px] font-bold px-3 py-2 rounded-lg">Assign</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Automated Reminders</h2>
                <p className="text-sm text-gray-500 mb-4">Schedule deadlines and the AI will dispatch them via email/SMS.</p>
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                  <select value={newReminder.caseId} onChange={e => setNewReminder(p => ({ ...p, caseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Link to case (optional)</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
                  </select>
                  <input placeholder="Reminder title" value={newReminder.title}
                    onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="datetime-local" value={newReminder.dueDate}
                    onChange={e => setNewReminder(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={newReminder.channel} onChange={e => setNewReminder(p => ({ ...p, channel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="email+sms">Email + SMS</option>
                  </select>
                  <button onClick={addReminder} className="w-full bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg">Schedule Reminder</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy mb-3">Scheduled</h3>
                <div className="space-y-2">
                  {reminders.map(r => (
                    <div key={r.id} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-navy">{r.title}</p>
                        <p className="text-[10px] text-gray-500">{r.caseId || '—'} · {new Date(r.dueDate).toLocaleString()} · via {r.channel}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{r.status}</span>
                    </div>
                  ))}
                  {reminders.length === 0 && <p className="text-xs text-gray-400 italic">No reminders scheduled.</p>}
                </div>
              </div>
            </div>
          )}

          {/* E-SIGNATURES */}
          {activeTab === 'esign' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">E-Signature Workflows</h2>
                <p className="text-sm text-gray-500 mb-4">Send a document for signature. Status updates flow back into the activity stream.</p>
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                  <select value={newSig.caseId} onChange={e => setNewSig(p => ({ ...p, caseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Link to case (optional)</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                  <input placeholder="Document name" value={newSig.document}
                    onChange={e => setNewSig(p => ({ ...p, document: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input placeholder="Signer name" value={newSig.signer}
                    onChange={e => setNewSig(p => ({ ...p, signer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input placeholder="Signer email" value={newSig.email}
                    onChange={e => setNewSig(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <button onClick={sendSig} className="w-full bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg">Send for Signature</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy mb-3">Pipeline</h3>
                <div className="space-y-2">
                  {signatures.map(s => (
                    <div key={s.id} className="p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-navy">{s.document}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{s.signer} · {s.email}</p>
                      <p className="text-[10px] text-gray-400">{s.caseId} · sent {new Date(s.sentAt).toLocaleString()}</p>
                      {s.status === 'PENDING' && (
                        <button onClick={() => markSigned(s.id)} className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mark Signed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONSULTATIONS */}
          {activeTab === 'consult' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Video Consultations</h2>
                <p className="text-sm text-gray-500 mb-4">Generate Google Meet or Zoom links and notify the client.</p>
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                  <select value={newConsult.caseId} onChange={e => setNewConsult(p => ({ ...p, caseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Link to case (optional)</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                  <input placeholder="Client name" value={newConsult.clientName}
                    onChange={e => setNewConsult(p => ({ ...p, clientName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="datetime-local" value={newConsult.scheduledFor}
                    onChange={e => setNewConsult(p => ({ ...p, scheduledFor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={newConsult.provider} onChange={e => setNewConsult(p => ({ ...p, provider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                  <button onClick={addConsult} className="w-full bg-navy text-white text-sm font-bold px-4 py-2 rounded-lg">Schedule Consult</button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-navy mb-3">Upcoming</h3>
                <div className="space-y-2">
                  {consults.map(c => (
                    <div key={c.id} className="p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-navy">{c.clientName}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{c.provider}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{c.caseId} · <Clock className="inline w-3 h-3" /> {new Date(c.scheduledFor).toLocaleString()}</p>
                      <a href={c.joinUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-navy bg-gold/10 hover:bg-gold/20 px-3 py-1 rounded-lg">
                        Join <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2">
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">Internal Legal Notes</h2>
                <p className="text-xs text-gray-500 mb-2">Pick a case to view & add private firm notes.</p>
                {cases.map(c => (
                  <button key={c.id} onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border ${selectedCaseId === c.id ? 'border-gold bg-gold/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <p className="text-[10px] font-mono text-gray-400">{c.id}</p>
                    <p className="text-sm font-bold text-navy line-clamp-1">{c.title}</p>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-3 mb-4">
                  {caseNotes.map(n => (
                    <div key={n.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-navy">{n.author} <span className="text-[10px] text-gray-400 font-normal">· {n.role}</span></p>
                        <span className="text-[10px] text-gray-400">{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.text}</p>
                    </div>
                  ))}
                  {caseNotes.length === 0 && <p className="text-xs text-gray-400 italic">No notes on this case yet.</p>}
                </div>
                <div className="flex gap-2">
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a private firm-only note..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
                  <button onClick={addNote} className="bg-navy text-white text-sm font-bold px-4 rounded-lg">Save</button>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">Legal Analytics Dashboard</h2>
                <p className="text-sm text-gray-500">Real-time metrics across cases, lawyers, and firm activity.</p>
              </div>
              {analytics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-navy mb-3 text-sm">Activity (Last 7 Days)</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.activityTrend}>
                          <defs>
                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c9a14a" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#c9a14a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                          <YAxis stroke="#9ca3af" fontSize={11} />
                          <Tooltip />
                          <Area type="monotone" dataKey="count" stroke="#c9a14a" fill="url(#g1)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-navy mb-3 text-sm">Lawyer Utilization</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.lawyerLoad}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                          <YAxis stroke="#9ca3af" fontSize={11} />
                          <Tooltip />
                          <Bar dataKey="utilization" fill="#0a2540" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-navy mb-3 text-sm">Cases by Priority</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={Object.entries(analytics.byPriority).map(([k, v]) => ({ name: k, value: v }))}
                            cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {Object.entries(analytics.byPriority).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-navy mb-3 text-sm">Cases by Category</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={Object.entries(analytics.byCategory).map(([k, v]) => ({ name: k, value: v }))}
                            cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {Object.entries(analytics.byCategory).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Cases', value: analytics.totalCases },
                      { label: 'Pending Signatures', value: analytics.pendingSignatures },
                      { label: 'Upcoming Reminders', value: analytics.upcomingReminders },
                      { label: 'Onboarding Submissions', value: analytics.onboardingSubmissions }
                    ].map((s, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{s.label}</p>
                        <p className="text-3xl font-bold text-navy mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Loading analytics...</p>
              )}
            </div>
          )}
        </div>

          {/* STAFF MANAGEMENT */}
          {activeTab === 'staffManagement' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: staff list */}
              <div className="lg:col-span-2">
                <h2 className="font-serif text-2xl font-bold text-navy mb-1">Legal Team</h2>
                <p className="text-sm text-gray-500 mb-4">Manage staff members, specialties, and case capacity. Staff listed here are also available in the Lawyer Assignment engine.</p>
                <div className="space-y-3">
                  {lawyers.map(lw => {
                    const assignedCases = cases.filter(c => c.assignedLawyerId === lw.id);
                    return (
                      <div key={lw.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        {editingStaff === lw.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editForm.firstName} onChange={e => setEditForm((p: any) => ({ ...p, firstName: e.target.value }))}
                                placeholder="First name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                              <input value={editForm.lastName} onChange={e => setEditForm((p: any) => ({ ...p, lastName: e.target.value }))}
                                placeholder="Last name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <input value={typeof editForm.specialties === 'string' ? editForm.specialties : editForm.specialties?.join(', ')}
                              onChange={e => setEditForm((p: any) => ({ ...p, specialties: e.target.value }))}
                              placeholder="Specialties (comma-separated, e.g. Litigation, Corporate)"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-500">Max cases:</label>
                              <input type="number" min="1" max="20" value={editForm.capacity}
                                onChange={e => setEditForm((p: any) => ({ ...p, capacity: e.target.value }))}
                                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => updateStaff(lw.id)} className="bg-navy text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-navy/90">Save Changes</button>
                              <button onClick={() => setEditingStaff(null)} className="bg-gray-100 text-gray-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {lw.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-navy text-sm">{lw.name}</p>
                                  <p className="text-[10px] text-gray-500 mt-0.5">{lw.specialties.length ? lw.specialties.join(' · ') : 'No specialties set'}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] text-gray-400">{lw.activeCases}/{lw.capacity} cases</span>
                                    <span className="text-[10px] text-amber-500">★ {lw.rating}</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${lw.capacity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                      {lw.capacity > 0 ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="hidden md:flex flex-col items-end gap-1 mr-2">
                                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">Capacity</span>
                                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${lw.capacity === 0 ? 'bg-gray-300' : lw.activeCases / lw.capacity > 0.8 ? 'bg-rose-400' : lw.activeCases / lw.capacity > 0.5 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                      style={{ width: `${lw.capacity > 0 ? Math.min(100, (lw.activeCases / lw.capacity) * 100) : 0}%` }}
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const parts = lw.name.split(' ');
                                    setEditingStaff(lw.id);
                                    setEditForm({ firstName: parts[0], lastName: parts.slice(1).join(' '), specialties: lw.specialties.join(', '), capacity: String(lw.capacity) });
                                  }}
                                  className="p-2 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors" title="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => removeStaff(lw.id, lw.name)}
                                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Remove">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {assignedCases.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-50">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Assigned Cases</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {assignedCases.map(c => (
                                    <span key={c.id} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[c.priority]}`}>
                                      {c.id} · {c.title.slice(0, 30)}{c.title.length > 30 ? '…' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {lawyers.length === 0 && (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No staff added yet.</p>
                      <p className="text-xs mt-1">Use the form to add your first team member.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Add form + stats */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gold" /> Add Staff Member
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="First name *" value={staffForm.firstName}
                        onChange={e => setStaffForm(p => ({ ...p, firstName: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                      <input placeholder="Last name" value={staffForm.lastName}
                        onChange={e => setStaffForm(p => ({ ...p, lastName: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    </div>
                    <input type="email" placeholder="Email address *" value={staffForm.email}
                      onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    <input placeholder="Specialties (e.g. Litigation, Corporate, IP)" value={staffForm.specialties}
                      onChange={e => setStaffForm(p => ({ ...p, specialties: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" max="20" placeholder="8" value={staffForm.capacity}
                        onChange={e => setStaffForm(p => ({ ...p, capacity: e.target.value }))}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
                      <span className="text-xs text-gray-400">max concurrent cases</span>
                    </div>
                    <button
                      onClick={addStaff}
                      disabled={staffSaving || !staffForm.firstName || !staffForm.email}
                      className="w-full bg-navy text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-navy/90 transition-colors">
                      <UserPlus className="w-4 h-4" />
                      {staffSaving ? 'Adding…' : 'Add to Legal Team'}
                    </button>
                    {staffMsg && <p className="text-xs text-emerald-600 font-medium text-center">{staffMsg}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Team Overview</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Members', value: lawyers.length, color: 'text-navy' },
                      { label: 'Available', value: lawyers.filter(l => l.activeCases < l.capacity && l.capacity > 0).length, color: 'text-emerald-600' },
                      { label: 'Active Cases', value: lawyers.reduce((s, l) => s + l.activeCases, 0), color: 'text-gold' },
                      { label: 'Avg Rating', value: lawyers.length ? (lawyers.reduce((s, l) => s + l.rating, 0) / lawyers.length).toFixed(1) : '—', color: 'text-navy' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

      </div>
    </div>
  );
}
