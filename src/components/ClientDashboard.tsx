import { useState } from 'react';
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
  Briefcase
} from 'lucide-react';

interface ClientDashboardProps {
  user?: any;
}

export default function ClientDashboard({ user }: ClientDashboardProps) {
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
    phone: user?.phone || '+1 (555) 123-4567'
  });
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(localUser);

  // Mock Data
  const companyName = localUser.companyName;
  const clientName = `${localUser.firstName} ${localUser.lastName}`;
  const clientId = localUser.clientId;
  const nextAppointment = {
    service: "Corporate Incorporation",
    date: "Oct 15, 2024",
    time: "10:30 AM",
    attorney: "Sarah Jenkins"
  };

  const appointments = [
    { id: 1, service: "Corporate Incorporation", date: "Oct 15, 2024", time: "10:30 AM", status: "Upcoming", attorney: "Sarah Jenkins" },
    { id: 2, service: "Initial Consultation", date: "Sep 28, 2024", time: "02:00 PM", status: "Completed", attorney: "Michael Ross" }
  ];

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

  const documents = [
    { id: 1, name: "Articles_of_Incorporation_Draft.pdf", date: "Oct 10, 2024", size: "2.4 MB", type: "PDF" },
    { id: 2, name: "Client_Intake_Form_Signed.pdf", date: "Oct 01, 2024", size: "1.1 MB", type: "PDF" },
    { id: 3, name: "Retainer_Agreement.docx", date: "Sep 28, 2024", size: "850 KB", type: "DOCX" }
  ];

  const messages = [
    { id: 1, sender: "Sarah Jenkins", role: "Attorney", time: "2 hours ago", text: "I've reviewed the initial draft of your Articles of Incorporation. Please check the Documents tab for the file." },
    { id: 2, sender: "You", role: "Client", time: "Yesterday", text: "Thank you, Sarah. I will review it shortly." }
  ];

  const activeCases = [
    {
      id: "CASE-2024-089",
      title: "Corporate Restructuring & Incorporation",
      type: "Corporate Law",
      status: "In Progress",
      progress: 65,
      attorney: "Sarah Jenkins",
      nextStep: "Review and sign Articles of Incorporation",
      nextDate: "Oct 15, 2024",
      openedDate: "Sep 10, 2024"
    },
    {
      id: "CASE-2024-112",
      title: "Trademark Registration: 'AcmeFlow'",
      type: "Intellectual Property",
      status: "Pending Review",
      progress: 25,
      attorney: "David Chen",
      nextStep: "Awaiting USPTO initial examination",
      nextDate: "Nov 01, 2024",
      openedDate: "Oct 02, 2024"
    }
  ];

  const handleFileUpload = () => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        
        // Simulate random upload failure (5% chance after 50% progress)
        if (prev > 50 && Math.random() > 0.95) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(null);
          setUploadError("Upload failed: Connection lost. Please try again.");
          return null;
        }

        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(null);
          }, 1000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
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

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-navy">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Next Appointment</p>
                    <p className="font-bold text-navy">{nextAppointment.date}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
                  {nextAppointment.time} with {nextAppointment.attorney}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center text-gold">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Action Required</p>
                    <p className="font-bold text-navy">1 Document</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
                  Please sign: Retainer Agreement
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Billed</p>
                    <p className="font-bold text-navy">$1,450.00</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
                  All invoices paid
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
                   {documents.slice(0, 3).map(doc => (
                     <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                       <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-gray-400" />
                         <div>
                           <p className="text-sm font-medium text-navy truncate max-w-[180px]">{doc.name}</p>
                           <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                         </div>
                       </div>
                       <button className="text-gray-400 hover:text-navy">
                         <Download className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
                 <button onClick={() => setActiveTab('documents')} className="w-full mt-4 text-center text-sm font-semibold text-navy hover:text-gold transition-colors">
                   Manage Documents
                 </button>
               </div>
            </div>
          </div>
        );
      case 'cases':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-serif text-xl font-bold text-navy">Active Cases</h3>
              <p className="text-sm text-gray-500 mt-1">Track the progress and status of your ongoing legal matters.</p>
            </div>
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
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status === 'In Progress' && <Clock className="w-4 h-4" />}
                        {c.status === 'Pending Review' && <AlertCircle className="w-4 h-4" />}
                        {c.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">Opened: {c.openedDate}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Key Step</p>
                        <p className="text-sm font-medium text-navy">{c.nextStep}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Date</p>
                        <p className="text-sm font-bold text-gold">{c.nextDate}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                        <span>Overall Progress</span>
                        <span>{c.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-navy h-2 rounded-full transition-all duration-1000 ease-out relative" 
                          style={{ width: `${c.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-navy">My Appointments</h3>
              <button className="bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Book New Service
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {appointments.map(apt => (
                <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy">{apt.service}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" /> {apt.date} at {apt.time}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">with {apt.attorney}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status === 'Upcoming' && (
                      <button className="text-sm text-navy font-medium hover:underline">Reschedule</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-navy">Secure Documents</h3>
              <button className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-colors cursor-pointer ${
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
                    <p className="text-sm text-gray-500 mt-1">Supports PDF, DOCX, JPG (Max 10MB)</p>
                  </>
                )}
              </div>

              <h4 className="font-semibold text-navy mb-4">File Library</h4>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-navy shadow-sm border border-gray-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-navy">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.date} • {doc.size} • {doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-navy transition-colors" title="Download">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'billing':
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-navy text-white pb-24 pt-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage your legal affairs securely.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy text-sm truncate">{companyName}</p>
                    <p className="text-xs text-gray-500 truncate">Client ID: {clientId}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditFormData(localUser);
                      setIsEditProfileOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-navy transition-colors shrink-0"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <nav className="p-2">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'cases', label: 'Case Status', icon: Briefcase },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
                  { id: 'messages', label: 'Messages', icon: MessageSquare },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id 
                        ? 'bg-navy text-white' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-gold' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

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
            <form onSubmit={(e) => {
              e.preventDefault();
              setLocalUser(editFormData);
              setIsEditProfileOpen(false);
            }} className="p-6 space-y-4">
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
    </div>
  );
}
