import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Upload, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  Edit2,
  X,
  Briefcase,
  Bell,
  Sparkles,
  Plus,
  Video,
  ChevronRight,
  TrendingUp,
  Shield,
  Lightbulb,
  ChevronDown,
  Camera,
  Film,
  Music,
  Image as ImageIcon,
  File,
  Home,
  Globe,
  Phone,
  Building,
  BadgeCheck,
  FolderOpen,
  ClipboardCheck,
  Save,
  Info
} from 'lucide-react';
import AIInsights from './AIInsights';
import OnboardingTutorial from './OnboardingTutorial';
import FeedbackModal from './FeedbackModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'message' | 'case_update';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface ClientDashboardProps {
  user?: any;
  onUpdateUser?: (data: any) => void;
  onBookService?: (service: any) => void;
  refreshTrigger?: number;
}

export default function ClientDashboard({ user, onUpdateUser, onBookService, refreshTrigger }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [localUser, setLocalUser] = useState({
    firstName: user?.firstName || 'Jane',
    lastName: user?.lastName || 'Doe',
    companyName: user?.companyName || 'Acme Corp',
    clientId: user?.clientId || '#88392',
    email: user?.email || 'jane@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    appRole: user?.appRole || 'Client',
    avatar: user?.avatar || null
  });
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(localUser);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    companyName: user?.companyName || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  // Extended profile state
  const [profileData, setProfileData] = useState({
    gender: '',
    dateOfBirth: '',
    nationality: '',
    residentialAddress: '',
    mailingAddress: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    cacNumber: user?.cacNumber || '',
    position: user?.position || '',
  });
  const [idDocs, setIdDocs] = useState<{ type: string; name: string }[]>([]);
  const [idDocType, setIdDocType] = useState<'national_id' | 'passport' | 'drivers_license'>('national_id');
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null);
  const [isSavingFullProfile, setIsSavingFullProfile] = useState(false);

  const computeProfileCompletion = () => {
    let score = 0;
    // 20%: basic identity (name + email always present)
    if (localUser.firstName && localUser.lastName && localUser.email) score += 20;
    // 20%: personal details
    if (profileData.gender && profileData.dateOfBirth && profileData.nationality) score += 20;
    // 20%: contact & address
    if (localUser.phone && profileData.residentialAddress) score += 20;
    // 20%: ID document uploaded
    if (idDocs.length > 0 || localUser.avatar) score += 20;
    // 20%: emergency contact
    if (profileData.emergencyName && profileData.emergencyPhone) score += 20;
    return score;
  };
  const profileCompletion = computeProfileCompletion();

  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/documents?userId=${localUser.clientId || 'client-1'}`);
        if (res.ok) {
          const data = await res.json();
          setUserDocuments(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDocuments();
  }, [localUser.clientId, refreshTrigger, isUploading]);
  const [caseProgress, setCaseProgress] = useState<any>(null);

  const handleDownload = async (doc: any) => {
    if (doc.fileData) {
      const url = URL.createObjectURL(doc.fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
      return;
    }
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      if (res.ok) {
        const { url } = await res.json();
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  useEffect(() => {
    // Check if it's the first time the user is logging in (mocked)
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [closureReason, setClosureReason] = useState('');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [viewingApt, setViewingApt] = useState<any | null>(null);
  const [aptActionMsg, setAptActionMsg] = useState<string | null>(null);

  const cancelAppointment = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        setAptActionMsg('Appointment cancelled successfully.');
        setTimeout(() => setAptActionMsg(null), 4000);
      } else {
        setAptActionMsg('Could not cancel appointment. Please try again.');
        setTimeout(() => setAptActionMsg(null), 4000);
      }
    } catch { setAptActionMsg('Network error. Please retry.'); setTimeout(() => setAptActionMsg(null), 4000); }
    finally { setCancellingId(null); }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const response = await fetch(`/api/appointments?userId=${localUser.clientId || 'client-1'}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    if (activeTab === 'appointments' || activeTab === 'overview') {
      fetchAppointments();
    }
  }, [activeTab, localUser.clientId, refreshTrigger]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoadingCases(true);
        const uid = localUser.clientId || localUser.id || 'client-1';
        const res = await fetch(`/api/cases/client/${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json();
          setActiveCases(Array.isArray(data) ? data : []);
        } else {
          setActiveCases([]);
        }
      } catch {
        setActiveCases([]);
      } finally {
        setIsLoadingCases(false);
      }
    };
    if (activeTab === 'cases' || activeTab === 'overview') {
      fetchCases();
    }
  }, [activeTab, localUser.clientId, localUser.id]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/case-progress/${localUser.clientId || 'client-1'}`);
        const data = await res.json();
        setCaseProgress(data);
      } catch (e) {
        console.error("Error fetching progress", e);
      }
    };
    fetchProgress();
  }, [localUser.clientId, refreshTrigger]);

  // Mock Data
  const companyName = localUser.companyName;
  const clientName = `${localUser.firstName} ${localUser.lastName}`;
  const clientId = localUser.clientId;
  const nextAppointment = appointments.find(a => a.status === 'Upcoming' || a.status === 'Pending') || {
    service_title: "No upcoming appointments",
    appointment_date: "-",
    appointment_time: "-",
  };

  const payments = [
    { id: "INV-2024-001", date: "Oct 12, 2024", amount: "$1,200.00", service: "Corporate Incorporation", status: "Paid" },
    { id: "INV-2024-002", date: "Sep 25, 2024", amount: "$250.00", service: "Initial Consultation", status: "Paid" },
    { id: "INV-2024-003", date: "Oct 20, 2024", amount: "$500.00", service: "Contract Review", status: "Due" },
    { id: "INV-2024-004", date: "Sep 15, 2024", amount: "$750.00", service: "Trademark Filing", status: "Overdue" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'Due':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Due
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
            {status}
          </span>
        );
    }
  };

  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(t)) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (['MP4', 'MOV', 'AVI', 'WMV'].includes(t)) return <Film className="w-5 h-5 text-red-500" />;
    if (['MP3', 'WAV', 'OGG'].includes(t)) return <Music className="w-5 h-5 text-blue-500" />;
    if (t === 'PDF') return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const messages = [
    { id: 1, sender: "Sarah Jenkins", role: "Attorney", time: "2 hours ago", text: "I've reviewed the initial draft of your Articles of Incorporation. Please check the Documents tab for the file." },
    { id: 2, sender: "You", role: "Client", time: "Yesterday", text: "Thank you, Sarah. I will review it shortly." }
  ];

  const [activeCases, setActiveCases] = useState<any[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [expandedCaseTimeline, setExpandedCaseTimeline] = useState<string | null>(null);

  const handleCloseCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setClosureReason('');
    setIsClosureModalOpen(true);
  };

  const confirmClosure = () => {
    if (!closureReason.trim()) return;
    setAptActionMsg("Case closure request transmitted. Pending Super Admin verification by the Compliance Department.");
    
    // Set to pending closure instead of immediate close
    setActiveCases(prev => prev.map(c => 
      c.id === selectedCaseId ? { ...c, status: 'Pending Closure Approval' } : c
    ));

    // Add notification for case closure request
    const closedCase = activeCases.find(c => c.id === selectedCaseId);
    if (closedCase) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'case_update',
        title: 'Closure Under Review',
        message: `Your request to close case ${selectedCaseId} is currently pending Super Admin approval.`,
        time: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    setIsClosureModalOpen(false);
    setSelectedCaseId(null);
    setClosureReason('');
  };

  // Simulate incoming message notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessageNotification: Notification = {
        id: 'msg-' + Date.now(),
        type: 'message',
        title: 'New Message from Sarah',
        message: 'Sarah Jenkins: "I have uploaded the final version of the agreement for your signature."',
        time: 'Just now',
        isRead: false
      };
      setNotifications(prev => [newMessageNotification, ...prev]);
    }, 15000); // Trigger after 15 seconds for demo purposes

    return () => clearTimeout(timer);
  }, []);

  // Poll notifications from server every 30s
  useEffect(() => {
    const uid = localUser.id || localUser.clientId;
    if (!uid) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`/api/notifications/${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.map((n: any) => ({
            ...n,
            time: n.time ? new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          })));
        }
      } catch { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [localUser.id, localUser.clientId]);

  const markAllAsRead = async () => {
    const uid = localUser.id || localUser.clientId;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (uid) {
      try { await fetch(`/api/notifications/${encodeURIComponent(uid)}/mark-read`, { method: 'PATCH' }); } catch { /* silent */ }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = notifications.filter(n => n.type === 'message' && !n.isRead).length;

  // Chart Data
  const billingData = [
    { month: 'Jan', amount: 400 },
    { month: 'Feb', amount: 300 },
    { month: 'Mar', amount: 600 },
    { month: 'Apr', amount: 800 },
    { month: 'May', amount: 500 },
    { month: 'Jun', amount: 900 },
  ];

  const completedCount = caseProgress?.milestones?.filter((m: any) => m.status === 'completed').length || 0;
  const totalCount = caseProgress?.milestones?.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const caseProgressData = [
    { name: 'Completed', value: progressPercent, color: '#0A192F' },
    { name: 'Remaining', value: 100 - progressPercent, color: '#E5E7EB' },
  ];

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    if (isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const file = files[0];

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', localUser.clientId || 'client-1');
      formData.append('role', localUser.appRole || 'Client');
      formData.append('uploaderName', `${localUser.firstName} ${localUser.lastName}`);

      // Simulate progress while uploading
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + Math.floor(Math.random() * 12) + 4, 85);
        setUploadProgress(currentProgress);
      }, 150);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) throw new Error("Upload failed");
      const syncedDoc = await res.json();

      setUploadProgress(100);
      setTimeout(() => {
        setUserDocuments(prev => [syncedDoc, ...prev]);
        setIsUploading(false);
        setUploadProgress(null);
        setAptActionMsg("File uploaded to secure vault. Awaiting Super Admin verification.");
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 800);

    } catch (e) {
      console.error(e);
      setUploadError("Could not upload to legal server. Please try again.");
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Welcome Banner */}
            <div className="bg-navy text-white rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10">
                <h2 className="font-serif text-3xl font-bold mb-2">Welcome back, {clientName}</h2>
                <p className="text-gray-300">Here is what's happening with your legal matters today.</p>
              </div>
            </div>

            {/* AI Insights Section */}
            <AIInsights userData={{ ...localUser, activeCases: activeCases }} />

            {/* Next Appointment Summary (if exists) */}
            {appointments.some(a => a.status === 'Upcoming' || a.status === 'Pending') && (
              <div className="bg-white rounded-2xl shadow-sm border border-gold/30 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Calendar className="w-24 h-24 text-gold" />
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${nextAppointment.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-gold/10 text-gold'}`}>
                    {nextAppointment.status === 'Pending' ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Your Next Appointment</p>
                      {nextAppointment.status === 'Pending' && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded uppercase tracking-tighter">Pending Confirmation</span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg font-bold text-navy truncate">
                      {nextAppointment.service_title}
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gold">{nextAppointment.appointment_date}</span> 
                      <span>at</span>
                      <span className="font-semibold text-gold">{nextAppointment.appointment_time}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <button 
                onClick={() => onBookService?.({ id: 'consultation', title: 'Legal Consultation', price: '$250', duration: '1 Hour' })}
                className="md:col-span-2 bg-navy text-white p-6 rounded-2xl flex flex-col justify-between hover:bg-navy-light transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Calendar className="w-24 h-24" />
                </div>
                <div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Schedule Consultation</h3>
                  <p className="text-white/60 text-sm">Book a 30-min session with your lead attorney.</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gold text-sm font-bold">
                  Book Now <ChevronDown className="w-4 h-4 -rotate-90" />
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('repository')}
                className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-between hover:border-gold transition-all group"
              >
                <div>
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-1">Upload Docs</h3>
                  <p className="text-gray-500 text-xs">Securely send new files to your legal team.</p>
                </div>
                <div className="mt-4 text-navy font-bold text-xs uppercase tracking-wider group-hover:text-gold transition-colors">
                  Quick Upload
                </div>
              </button>

              <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-gold/5 border border-gold/20 p-6 rounded-2xl flex flex-col justify-between hover:bg-gold/10 transition-all group"
              >
                <div>
                  <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-1">Feedback</h3>
                  <p className="text-gray-500 text-xs">Help us improve your experience.</p>
                </div>
                <div className="mt-4 text-gold font-bold text-xs uppercase tracking-wider">
                  Rate Portal
                </div>
              </button>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-navy">Recommended for You</h3>
                <button onClick={() => onBookService?.({ id: 'consultation', title: 'Legal Consultation', price: '$250', duration: '1 Hour' })} className="text-sm font-semibold text-navy hover:text-gold transition-colors">Explore All</button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "2025 Regulatory Outlook",
                    category: "Compliance",
                    readTime: "5 min read",
                    image: "https://picsum.photos/seed/legal1/400/200"
                  },
                  {
                    title: "IP Protection Strategies",
                    category: "Intellectual Property",
                    readTime: "8 min read",
                    image: "https://picsum.photos/seed/legal2/400/200"
                  },
                  {
                    title: "Arbitration vs Litigation",
                    category: "Dispute Resolution",
                    readTime: "6 min read",
                    image: "https://picsum.photos/seed/legal3/400/200"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-navy uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                    <h4 className="font-bold text-navy group-hover:text-gold transition-colors line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.readTime}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy">Billing Overview</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-navy rounded-full"></span>
                    <span className="text-xs text-gray-500 font-medium">Monthly Spend ($)</span>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={billingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="amount" fill="#0A192F" radius={[4, 4, 0, 0]} barSize={40}>
                        {billingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === billingData.length - 1 ? '#C5A059' : '#0A192F'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-navy mb-6">Case Progress</h3>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={caseProgressData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {caseProgressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-navy">{progressPercent}%</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Overall</span>
                  </div>
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-navy"></div>
                        <span className="text-gray-600">Completed Steps</span>
                      </div>
                      <span className="font-bold text-navy">{completedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <span className="text-gray-600">Pending Steps</span>
                      </div>
                      <span className="font-bold text-navy">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy">Case Timeline</h3>
                  <p className="text-sm text-gray-500">Corporate Restructuring & Incorporation</p>
                </div>
                <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Phase 3 of 5
                </span>
              </div>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100"></div>
                
                <div className="relative flex justify-between">
                  {[
                    { label: 'Intake', date: 'Sep 10', status: 'completed' },
                    { label: 'Discovery', date: 'Sep 25', status: 'completed' },
                    { label: 'Drafting', date: 'Oct 15', status: 'active' },
                    { label: 'Review', date: 'Oct 30', status: 'pending' },
                    { label: 'Filing', date: 'Nov 10', status: 'pending' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500 ${
                        step.status === 'completed' ? 'bg-navy text-white' : 
                        step.status === 'active' ? 'bg-gold text-white scale-110 shadow-gold/20' : 
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-xs font-bold uppercase tracking-wider ${step.status === 'active' ? 'text-navy' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity / Messages Preview */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-serif text-xl font-bold text-navy mb-4">Recent Messages</h3>
                 <div className="space-y-4">
                   {messages.map(msg => (
                     <div key={msg.id} className="flex gap-3 items-start">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === 'Attorney' ? 'bg-navy text-white' : 'bg-gray-200 text-gray-700'}`}>
                         {msg.sender[0]}
                       </div>
                       <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none flex-1">
                         <div className="flex justify-between items-baseline mb-1">
                           <span className="font-semibold text-sm text-navy">{msg.sender}</span>
                           <span className="text-xs text-gray-400">{msg.time}</span>
                         </div>
                         <p className="text-sm text-gray-600">{msg.text}</p>
                       </div>
                     </div>
                   ))}
                 </div>
                 <button onClick={() => setActiveTab('messages')} className="w-full mt-4 text-center text-sm font-semibold text-navy hover:text-gold transition-colors">
                   View All Messages
                 </button>
               </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-serif text-xl font-bold text-navy mb-4">Recent Documents</h3>
                  <div className="space-y-3">
                    {userDocuments.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <p className="text-sm font-medium text-navy truncate max-w-[180px]">{doc.name}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                               {doc.status === 'PENDING_ADMIN_APPROVAL' && (
                                 <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-100 flex items-center gap-0.5">
                                   <Clock className="w-2 h-2" /> PENDING
                                 </span>
                               )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="text-gray-400 hover:text-navy transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('repository')} className="w-full mt-4 text-center text-sm font-semibold text-navy hover:text-gold transition-colors">
                    View All Documents
                  </button>
                </div>
            </div>
          </div>
        );
      case 'cases':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">Active Cases</h3>
                <p className="text-sm text-gray-500 mt-1">Track the progress and status of your ongoing legal matters.</p>
              </div>
              {!isLoadingCases && (
                <span className="text-xs font-bold text-navy bg-navy/5 px-3 py-1.5 rounded-full border border-navy/10">
                  {activeCases.length} {activeCases.length === 1 ? 'Matter' : 'Matters'}
                </span>
              )}
            </div>
            {isLoadingCases ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Loading your cases…</p>
              </div>
            ) : activeCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-navy/30" />
                </div>
                <h4 className="text-lg font-bold text-navy mb-2">No Active Cases</h4>
                <p className="text-gray-500 text-sm max-w-sm">You have no active legal matters at this time. Cases opened by your legal team will appear here with real-time status updates.</p>
              </div>
            ) : (
            <div className="divide-y divide-gray-100">
              {activeCases.map(c => (
                <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-navy bg-navy/5 px-2 py-1 rounded-md tracking-wider uppercase">{c.id}</span>
                        <span className="text-xs font-medium text-gold border border-gold/30 px-2 py-1 rounded-md">{c.type}</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-navy mb-1">{c.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> Lead Attorney: <span className="font-medium text-navy">{c.attorney}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                        c.status === 'Closed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status === 'In Progress' && <Clock className="w-4 h-4" />}
                        {c.status === 'Pending Review' && <AlertCircle className="w-4 h-4" />}
                        {c.status === 'Closed' && <CheckCircle2 className="w-4 h-4" />}
                        {c.status}
                      </span>
                      {c.status !== 'Closed' && ['Admin', 'Staff'].includes(localUser.appRole) && (
                        <button 
                          onClick={() => handleCloseCase(c.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors"
                        >
                          Close Case
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Key Step</p>
                            <p className="text-sm font-bold text-navy leading-tight">{c.nextStep}</p>
                            <p className="text-xs text-gray-500 mt-1">Target: <span className="text-gold font-semibold">{c.nextDate}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Opened Date</p>
                          <div className="flex items-center gap-2 text-navy">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-semibold">{c.openedDate}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lead Attorney</p>
                          <div className="flex items-center gap-2 text-navy">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-semibold">{c.attorney}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-navy text-white rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                          <span className="text-lg font-serif font-bold text-gold">{c.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-4">
                          <div 
                            className="bg-gold h-2 rounded-full transition-all duration-1000 ease-out relative" 
                            style={{ width: `${c.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          {c.status === 'Closed' ? 'This matter has been successfully concluded.' : 'Your legal team is actively working on the next milestone.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline toggle */}
                  {c.timeline && c.timeline.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <button
                        onClick={() => setExpandedCaseTimeline(expandedCaseTimeline === c.id ? null : c.id)}
                        className="flex items-center gap-2 text-xs font-bold text-navy hover:text-gold transition-colors uppercase tracking-widest"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {expandedCaseTimeline === c.id ? 'Hide Timeline' : `Case History (${c.timeline.length} entries)`}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCaseTimeline === c.id ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedCaseTimeline === c.id && (
                        <div className="mt-4 relative pl-5">
                          <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full" />
                          {c.timeline.map((entry: any, idx: number) => (
                            <div key={entry.id || idx} className="relative mb-4 last:mb-0">
                              <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full bg-gold border-2 border-white shadow-sm" />
                              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-xs font-bold text-navy">{entry.event}</span>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {entry.detail && <p className="text-xs text-gray-500 leading-relaxed">{entry.detail}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        );
      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">Appointment History</h3>
                <p className="text-sm text-gray-500">Manage your upcoming and past consultations</p>
              </div>
              <button 
                onClick={() => onBookService?.({ id: 'consultation', title: 'Legal Consultation', price: '$250', duration: '1 Hour' })}
                className="bg-gold hover:bg-gold-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit"
              >
                <Plus className="w-4 h-4" /> Book Consultation
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoadingAppointments ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-medium">Retrieving your appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold text-navy mb-2">No Appointments Yet</h4>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8">
                    You haven't booked any legal consultations or services yet.
                  </p>
                  <button 
                    onClick={() => onBookService?.({ id: 'consultation', title: 'Legal Consultation', price: '$250', duration: '1 Hour' })}
                    className="bg-navy text-white px-6 py-2.5 rounded-lg hover:bg-navy-light transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Your First Consultation
                  </button>
                </div>
              ) : appointments.map(apt => (
                <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group/item hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="relative group-hover/item:scale-105 transition-transform">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                        apt.status === 'Upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        (apt.status === 'Pending' || apt.status === 'PENDING_VERIFICATION') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        <Calendar className="w-7 h-7" />
                      </div>
                      {apt.status === 'Upcoming' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-xl group-hover/item:text-gold transition-colors">{apt.service_title || apt.service}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                          <Clock className="w-4 h-4 text-gold" />
                          <span>{apt.appointment_date || apt.date}</span>
                          <span className="text-gray-300">•</span>
                          <span>{apt.appointment_time || apt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{apt.attorney || 'Assigned Attorney'}</span>
                        </div>
                        {apt.tracking_number && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                            ID: {apt.tracking_number}
                          </div>
                        )}
                      </div>
                      
                      {apt.status === 'Upcoming' && (
                        <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Meeting Link</p>
                            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Click here to join meeting at {apt.appointment_time}</a>
                          </div>
                        </div>
                      )}

                      {(apt.status === 'Pending' || apt.status === 'PENDING_VERIFICATION') && (
                        <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">In Review</p>
                            <p className="text-xs font-bold text-amber-600">Administrator is verifying your payment and identity</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Current Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        (apt.status === 'Pending' || apt.status === 'PENDING_VERIFICATION') ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status === 'Upcoming' ? <Clock className="w-3.5 h-3.5" /> : 
                         (apt.status === 'Pending' || apt.status === 'PENDING_VERIFICATION') ? <AlertCircle className="w-3.5 h-3.5" /> :
                         apt.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         <X className="w-3.5 h-3.5" />}
                        {apt.status === 'PENDING_VERIFICATION' ? 'Pending Review' : apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(apt.status === 'Upcoming' || apt.status === 'Pending' || apt.status === 'PENDING_ADMIN_APPROVAL') && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => onBookService?.({ id: 'consultation', title: 'Legal Consultation', price: '$250', duration: '1 Hour' })}
                            className="p-2.5 text-gray-400 hover:text-navy hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-sm flex items-center justify-center" title="Reschedule">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={cancellingId === apt.id}
                            onClick={() => { if (window.confirm('Cancel this appointment?')) cancelAppointment(apt.id); }}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-red-100 transition-all shadow-sm flex items-center justify-center disabled:opacity-50" title="Cancel Appointment">
                            {cancellingId === apt.id ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      <button onClick={() => setViewingApt(apt)} className="bg-navy hover:bg-navy-light text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'verification':
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-serif text-xl font-bold text-navy mb-1">Verification & Review Queue</h3>
              <p className="text-sm text-gray-500">Consultations and matters currently pending review or identity verification by our team.</p>
            </div>
            {isLoadingAppointments ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Retrieving verification items...</p>
              </div>
            ) : appointments.filter(a => a.status === 'PENDING_ADMIN_APPROVAL' || a.status === 'Pending' || a.status === 'PENDING_VERIFICATION').length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="font-bold text-navy text-lg mb-2">All Clear</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">You have no items pending verification. All your consultations have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.filter(a => a.status === 'PENDING_ADMIN_APPROVAL' || a.status === 'Pending' || a.status === 'PENDING_VERIFICATION').map(apt => (
                  <div key={apt.id} className="bg-white rounded-xl border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{apt.service_title || apt.service}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{apt.appointment_date} at {apt.appointment_time}</p>
                        {apt.practice_area && <p className="text-xs text-gold font-semibold mt-1">{apt.practice_area}</p>}
                        {apt.tracking_number && <p className="text-xs font-mono text-gray-400 mt-1">Ref: {apt.tracking_number}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> Under Review
                      </span>
                      <button onClick={() => setViewingApt(apt)} className="text-navy hover:text-gold transition-colors text-sm font-semibold">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-0.5">What happens here?</p>
                <p className="text-xs text-blue-700">Each new consultation booking requires identity and payment verification by our team. You will receive an email notification once your booking is confirmed.</p>
              </div>
            </div>
          </div>
        );
      case 'repository':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">Master Repository</h3>
                <p className="text-sm text-gray-500 mt-0.5">All documents — uploaded by you, or shared by the firm with your case.</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple 
                className="hidden" 
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.mp4,.mp3,.wav,.mov,.avi,.zip"
              />
              <button 
                onClick={handleFileUpload}
                className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
            </div>
            <div className="p-6">
              {uploadError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{uploadError}</p>
                </div>
              )}
              
              <div 
                onClick={handleFileUpload}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-gold/10'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-gold/10'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-gold/10');
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-all cursor-pointer ${
                  isUploading ? 'border-gold bg-gold/5' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isUploading ? (
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm font-medium text-navy mb-2">
                      <span>Uploading document...</span>
                      <span>{Math.min(uploadProgress || 0, 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gold h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${Math.min(uploadProgress || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-navy font-medium">Drag and drop files here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Supports PDF, Photos, Videos, and Audio (Max 50MB)</p>
                  </>
                )}
              </div>

              <h4 className="font-semibold text-navy mb-4">File Library</h4>
              <div className="space-y-2">
                {userDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gold/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-navy shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <p className="font-medium text-navy">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.date} • {doc.size} • {doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-gray-400 hover:text-navy transition-colors group/dl" 
                        title="Download"
                      >
                        <Download className="w-5 h-5 group-hover/dl:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'billing':
        if (!['Admin', 'Staff'].includes(localUser.appRole)) {
          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center animate-in fade-in duration-300">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-navy mb-2">Restricted Access</h3>
              <p className="text-gray-500 max-w-md mx-auto">Only authorized firm personnel can access detailed billing and payment records. Please contact the billing department for assistance.</p>
            </div>
          );
        }
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-serif text-xl font-bold text-navy">Billing & Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-navy">{pay.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pay.service}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pay.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-navy">{pay.amount}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(pay.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button className="text-sm text-navy hover:text-gold font-medium flex items-center gap-1">
                            <FileText className="w-4 h-4" /> Generate
                          </button>
                          <button className="text-sm text-gray-500 hover:text-navy font-medium" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-serif text-xl font-bold text-navy">Attorney Communication</h3>
              <p className="text-sm text-gray-500">Secure, encrypted messaging with your legal team.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'Client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'Client' ? 'bg-navy text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'} p-4 rounded-2xl shadow-sm`}>
                    <div className="flex justify-between items-baseline mb-1 gap-4">
                      <span className={`text-xs font-bold ${msg.role === 'Client' ? 'text-gold' : 'text-navy'}`}>{msg.sender}</span>
                      <span className={`text-xs ${msg.role === 'Client' ? 'text-gray-300' : 'text-gray-400'}`}>{msg.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                />
                <button className="bg-navy hover:bg-navy-light text-white px-6 rounded-lg font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      case 'profile': {
        const completionSteps = [
          { label: 'Basic Identity', done: !!(localUser.firstName && localUser.lastName && localUser.email), pct: 20 },
          { label: 'Personal Details', done: !!(profileData.gender && profileData.dateOfBirth && profileData.nationality), pct: 20 },
          { label: 'Contact & Address', done: !!(localUser.phone && profileData.residentialAddress), pct: 20 },
          { label: 'ID Document', done: idDocs.length > 0 || !!localUser.avatar, pct: 20 },
          { label: 'Emergency Contact', done: !!(profileData.emergencyName && profileData.emergencyPhone), pct: 20 },
        ];
        const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            setIdDocs(prev => {
              const filtered = prev.filter(d => d.type !== idDocType);
              return [...filtered, { type: idDocType, name: file.name }];
            });
          }
          if (idFileInputRef.current) idFileInputRef.current.value = '';
        };
        const saveProfile = async () => {
          setIsSavingFullProfile(true);
          try {
            await new Promise(r => setTimeout(r, 800));
            setProfileSaveMsg('Profile saved successfully. Changes are recorded in your legal file.');
            setTimeout(() => setProfileSaveMsg(null), 5000);
          } finally {
            setIsSavingFullProfile(false);
          }
        };
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {profileSaveMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {profileSaveMsg}
              </div>
            )}

            {/* Profile completion bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy">Profile Completion</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Complete your profile to unlock all client services.</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={profileCompletion === 100 ? '#10B981' : '#C5A059'} strokeWidth="3"
                      strokeDasharray={`${profileCompletion} ${100 - profileCompletion}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-navy">{profileCompletion}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {completionSteps.map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                    </div>
                    <span className={`text-sm flex-1 ${s.done ? 'text-navy font-medium' : 'text-gray-400'}`}>{s.label}</span>
                    <span className={`text-xs font-bold ${s.done ? 'text-emerald-600' : 'text-gray-400'}`}>{s.done ? `+${s.pct}%` : `${s.pct}%`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-navy" /></div>
                <h4 className="font-bold text-navy">Personal Information</h4>
              </div>
              <div className="p-6 space-y-5">
                {/* Passport photo */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Passport Photograph</label>
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative group cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}>
                      {localUser.avatar ? (
                        <img src={localUser.avatar} alt="Passport" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    <div>
                      <p className="text-sm font-semibold text-navy mb-1">Upload passport-style photo</p>
                      <p className="text-xs text-gray-400 mb-3">Clear, front-facing photo. JPG or PNG, max 2MB.</p>
                      <button onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/5 transition-colors">
                        {localUser.avatar ? 'Change Photo' : 'Upload Photo'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                    <input value={localUser.firstName} onChange={e => setLocalUser(u => ({...u, firstName: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                    <input value={localUser.lastName} onChange={e => setLocalUser(u => ({...u, lastName: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
                    <select value={profileData.gender} onChange={e => setProfileData(p => ({...p, gender: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold bg-white">
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                    <input type="date" value={profileData.dateOfBirth} onChange={e => setProfileData(p => ({...p, dateOfBirth: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nationality</label>
                    <input value={profileData.nationality} onChange={e => setProfileData(p => ({...p, nationality: e.target.value}))}
                      placeholder="e.g. Nigerian" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center"><Phone className="w-4 h-4 text-navy" /></div>
                <h4 className="font-bold text-navy">Contact Information</h4>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input value={localUser.phone} onChange={e => setLocalUser(u => ({...u, phone: e.target.value}))}
                      placeholder="+234 800 000 0000" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input value={localUser.email} onChange={e => setLocalUser(u => ({...u, email: e.target.value}))}
                      type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Residential Address</label>
                  <textarea value={profileData.residentialAddress} onChange={e => setProfileData(p => ({...p, residentialAddress: e.target.value}))}
                    placeholder="Full residential address" rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mailing Address <span className="text-gray-400 font-normal normal-case">(if different)</span></label>
                  <textarea value={profileData.mailingAddress} onChange={e => setProfileData(p => ({...p, mailingAddress: e.target.value}))}
                    placeholder="Leave blank if same as residential" rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold resize-none" />
                </div>
              </div>
            </div>

            {/* Section 3: Identification */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center"><BadgeCheck className="w-4 h-4 text-navy" /></div>
                <h4 className="font-bold text-navy">Identification Documents</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500">Upload at least one government-issued ID for KYC verification.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {([
                    { value: 'national_id', label: 'National ID' },
                    { value: 'passport', label: 'Passport' },
                    { value: 'drivers_license', label: "Driver's License" },
                  ] as const).map(t => (
                    <button key={t.value} onClick={() => setIdDocType(t.value)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        idDocType === t.value ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-gold'
                      }`}>{t.label}</button>
                  ))}
                </div>
                <input ref={idFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleIdUpload} />
                <button onClick={() => idFileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-gold hover:bg-gold/5 transition-all flex items-center justify-center gap-3 group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-navy">Upload {idDocType === 'national_id' ? 'National ID' : idDocType === 'passport' ? 'Passport' : "Driver's License"}</p>
                    <p className="text-xs text-gray-400">PDF, JPG or PNG — clear, unobstructed scan</p>
                  </div>
                </button>
                {idDocs.length > 0 && (
                  <div className="space-y-2">
                    {idDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy">{doc.type === 'national_id' ? 'National ID' : doc.type === 'passport' ? 'Passport' : "Driver's License"}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.name}</p>
                        </div>
                        <button onClick={() => setIdDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Emergency Contact */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center"><AlertCircle className="w-4 h-4 text-navy" /></div>
                <h4 className="font-bold text-navy">Emergency Contact</h4>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input value={profileData.emergencyName} onChange={e => setProfileData(p => ({...p, emergencyName: e.target.value}))}
                      placeholder="Contact name" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input value={profileData.emergencyPhone} onChange={e => setProfileData(p => ({...p, emergencyPhone: e.target.value}))}
                      placeholder="+234 800 000 0000" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Relationship</label>
                    <input value={profileData.emergencyRelationship} onChange={e => setProfileData(p => ({...p, emergencyRelationship: e.target.value}))}
                      placeholder="e.g. Spouse, Parent" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Company Information */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center"><Building className="w-4 h-4 text-navy" /></div>
                  <h4 className="font-bold text-navy">Company Information</h4>
                </div>
                <span className="text-xs text-gray-400 font-medium">(Business clients only)</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company Name</label>
                    <input value={localUser.companyName} onChange={e => setLocalUser(u => ({...u, companyName: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CAC Number</label>
                    <input value={profileData.cacNumber} onChange={e => setProfileData(p => ({...p, cacNumber: e.target.value}))}
                      placeholder="RC-000000" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Position / Role</label>
                    <input value={profileData.position} onChange={e => setProfileData(p => ({...p, position: e.target.value}))}
                      placeholder="e.g. CEO, Director" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button onClick={saveProfile} disabled={isSavingFullProfile}
                className="bg-navy hover:bg-navy-light disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg">
                {isSavingFullProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Save className="w-5 h-5" /> Save Profile</>
                )}
              </button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Action toast */}
      {aptActionMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 max-w-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {aptActionMsg}
        </div>
      )}

      {/* Appointment Details Modal */}
      {viewingApt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingApt(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-navy text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gold text-[10px] uppercase tracking-widest font-bold mb-1">Appointment Details</p>
                  <h3 className="font-serif text-xl font-bold">{viewingApt.service_title}</h3>
                </div>
                <button onClick={() => setViewingApt(null)} className="text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Date', value: viewingApt.appointment_date },
                { label: 'Time', value: viewingApt.appointment_time },
                { label: 'Status', value: viewingApt.status === 'PENDING_ADMIN_APPROVAL' ? 'Pending Review' : viewingApt.status },
                { label: 'Tracking No.', value: viewingApt.tracking_number },
                { label: 'Price', value: viewingApt.price },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">{label}</span>
                  <span className="text-sm font-bold text-navy">{value}</span>
                </div>
              ))}
              {(viewingApt.status === 'PENDING_ADMIN_APPROVAL' || viewingApt.status === 'Pending') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  <p className="font-semibold mb-1">Under Review</p>
                  <p className="text-xs">Our team is reviewing your request. You'll receive a confirmation email once approved.</p>
                </div>
              )}
              {viewingApt.status === 'APPROVED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
                  <p className="font-semibold mb-1">✅ Confirmed</p>
                  <p className="text-xs">This appointment has been approved. Please arrive 10 minutes early.</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setViewingApt(null)} className="w-full bg-navy text-white py-3 rounded-xl font-semibold hover:bg-navy-light transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-navy text-white pb-24 pt-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex items-start gap-5">
            {/* Profile completion ring */}
            <div className="relative shrink-0 cursor-pointer" onClick={() => setActiveTab('profile')} title="Complete your profile">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#C5A059" strokeWidth="3"
                  strokeDasharray={`${profileCompletion} ${100 - profileCompletion}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gold leading-none">{profileCompletion}%</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Client Portal</p>
              <h1 className="font-serif text-3xl font-bold">Welcome, {localUser.firstName} {localUser.lastName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-gold font-mono text-sm font-bold">{localUser.clientId}</span>
                {localUser.companyName && <span className="text-gray-300 text-sm">· {localUser.companyName}</span>}
                {profileCompletion < 100 && (
                  <button onClick={() => setActiveTab('profile')} className="text-xs bg-gold/20 hover:bg-gold/30 text-gold px-2 py-0.5 rounded-full font-semibold transition-colors">
                    Complete profile →
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative group"
              title="Notifications"
            >
              <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse text-gold' : 'text-gray-300'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-navy">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-navy">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-gold hover:text-gold-hover transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            onClick={() => {
                              setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
                              if (n.type === 'message') setActiveTab('messages');
                              if (n.type === 'case_update') setActiveTab('cases');
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                n.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-gold/10 text-gold'
                              }`}>
                                {n.type === 'message' ? <MessageSquare className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                  <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-navy' : 'text-gray-600'}`}>{n.title}</p>
                                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{n.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                              </div>
                              {!n.isRead && (
                                <div className="w-2 h-2 bg-gold rounded-full shrink-0 mt-1.5"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-navy hover:text-gold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden" aria-hidden="true">
                    {localUser.avatar ? (
                      <img src={localUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy text-sm truncate">{companyName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true"></div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{localUser.appRole} Access</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setEditFormData(localUser);
                      setIsEditProfileOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-navy transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-navy rounded-lg outline-none"
                    aria-label="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <nav className="p-2" aria-label="Dashboard Navigation">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['All'] },
                  { id: 'cases', label: 'Active Cases', icon: Briefcase, roles: ['All'] },
                  { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['All'] },
                  { id: 'verification', label: 'Verification', icon: ClipboardCheck, roles: ['All'] },
                  { id: 'repository', label: 'Master Repository', icon: FolderOpen, roles: ['All'] },
                  { id: 'billing', label: 'Billing & Payments', icon: CreditCard, roles: ['Admin', 'Staff'] },
                  { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['All'] },
                  { id: 'profile', label: 'My Profile', icon: User, roles: ['All'] },
                ].filter(item => item.roles.includes('All') || item.roles.includes(localUser.appRole)).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === 'messages') {
                        setNotifications(prev => prev.map(n => n.type === 'message' ? { ...n, isRead: true } : n));
                      }
                    }}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset ${
                      activeTab === item.id 
                        ? 'bg-navy text-white' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-gold' : 'text-gray-400'}`} aria-hidden="true" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'messages' && unreadMessagesCount > 0 && (
                      <span className="w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-label={`${unreadMessagesCount} unread messages`}>
                        {unreadMessagesCount}
                      </span>
                    )}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gold/10 hover:text-gold transition-all"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    Give Feedback
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Onboarding Tutorial */}
      {showOnboarding && <OnboardingTutorial onClose={handleCloseOnboarding} />}

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-navy text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              <h3 className="font-serif text-xl font-bold relative z-10">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-300 hover:text-white relative z-10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingProfile(true);
              try {
                const res = await fetch(`/api/users/${user.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editFormData)
                });
                if (res.ok) {
                  const updatedUser = await res.json();
                  setLocalUser(updatedUser);
                  onUpdateUser?.(updatedUser);
                  setIsEditProfileOpen(false);
                  setAptActionMsg("Legal profile updated and synchronized with firm records.");
                  setTimeout(() => setAptActionMsg(null), 4000);
                }
              } catch (error) {
                console.error("Profile update failed:", error);
              } finally {
                setIsSavingProfile(false);
              }
            }} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {editFormData.avatar ? (
                      <img src={editFormData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gold text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-gold-hover transition-colors">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click the camera icon to upload a profile picture</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={editFormData.firstName} 
                    onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold transition-all" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editFormData.lastName} 
                    onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold transition-all" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={editFormData.companyName} 
                  onChange={e => setEditFormData({...editFormData, companyName: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={editFormData.phone} 
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold transition-all" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsEditProfileOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-navy font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Case Closure Confirmation Modal */}
      {isClosureModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-red-600 text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              <h3 className="font-serif text-xl font-bold relative z-10">Confirm Case Closure</h3>
              <button onClick={() => setIsClosureModalOpen(false)} className="text-white/80 hover:text-white relative z-10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Are you sure you want to close this case?</h4>
                  <p className="text-red-700 text-xs mt-1">This action will mark the case as complete. You will still be able to view it in your history.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for closure <span className="text-red-500">*</span></label>
                <textarea 
                  value={closureReason}
                  onChange={e => setClosureReason(e.target.value)}
                  placeholder="Please provide a brief reason for closing this case..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsClosureModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-navy font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmClosure}
                  disabled={!closureReason.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    closureReason.trim() 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Closure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
