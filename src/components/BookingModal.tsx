import { X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2, AlertCircle, Video, Phone, MapPin, Scale, Building2, Gavel, Heart, Briefcase, Shield, Globe, ShoppingBag, DollarSign, Lightbulb, MoreHorizontal, ChevronRight, Upload, User, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

interface BookingModalProps {
  service: any;
  onClose: () => void;
  isLoggedIn: boolean;
  user?: any;
  onLoginRequired: () => void;
  onSuccess?: () => void;
}

const PRACTICE_AREAS = [
  { id: 'corporate', label: 'Corporate', icon: Building2 },
  { id: 'property', label: 'Property', icon: MapPin },
  { id: 'litigation', label: 'Litigation', icon: Gavel },
  { id: 'family', label: 'Family', icon: Heart },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'criminal', label: 'Criminal', icon: Shield },
  { id: 'immigration', label: 'Immigration', icon: Globe },
  { id: 'commercial', label: 'Commercial', icon: ShoppingBag },
  { id: 'debt-recovery', label: 'Debt Recovery', icon: DollarSign },
  { id: 'intellectual-property', label: 'Intellectual Property', icon: Lightbulb },
  { id: 'others', label: 'Others', icon: MoreHorizontal },
];

const CONSULTATION_TYPES = [
  { id: 'virtual', label: 'Virtual', sub: 'Video call with your attorney', icon: Video },
  { id: 'physical', label: 'Physical', sub: 'In-person at our offices', icon: MapPin },
  { id: 'phone', label: 'Phone Call', sub: 'Audio consultation by phone', icon: Phone },
];

const LAWYERS = [
  'No preference',
  'Sarah Jenkins — Corporate & Commercial',
  'David Chen — Intellectual Property',
  'Amaka Obi — Family & Immigration',
  'Emeka Nwosu — Litigation & Criminal',
  'Fatima Al-Rashid — Property & Debt Recovery',
];

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Area' },
  { num: 3, label: 'Schedule' },
  { num: 4, label: 'Details' },
  { num: 5, label: 'Docs' },
  { num: 6, label: 'Payment' },
];

export default function BookingModal({ service: initialService, onClose, isLoggedIn, user, onLoginRequired, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState<string | null>(null);
  const [practiceArea, setPracticeArea] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [preferredLawyer, setPreferredLawyer] = useState('No preference');
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{ trackingNumber: string; invoiceId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-navy">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy mb-4">Account Required</h3>
          <p className="text-gray-600 mb-8">Please log in or register to book a consultation and manage your legal matters.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { onClose(); onLoginRequired(); }} className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Log In / Register
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-navy font-medium py-2">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const dates = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let d = new Date(today); d.setDate(d.getDate() + 1);
    while (results.length < 7) {
      const dow = d.getDay();
      if (dow !== 0) {
        const isSat = dow === 6;
        results.push({
          day: days[dow], date: `${months[d.getMonth()]} ${d.getDate()}`,
          fullDate: d.toISOString().slice(0, 10),
          slots: isSat ? 2 : [4, 2, 5, 3, 4][results.length % 5] || 3
        });
      }
      d = new Date(d); d.setDate(d.getDate() + 1);
    }
    return results;
  })();

  const times = ['09:00 AM', '10:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const added = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...added].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (i: number) => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const trackingNumber = 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?.clientId || 'client-1',
          serviceTitle: `${practiceArea ? PRACTICE_AREAS.find(p => p.id === practiceArea)?.label + ' — ' : ''}Legal Consultation`,
          date: selectedDate,
          time: selectedTime,
          price: '$0',
          trackingNumber,
          requesterName: user ? `${user.firstName} ${user.lastName}` : 'Guest Client',
          consultationType,
          practiceArea,
          description,
          preferredLawyer: preferredLawyer !== 'No preference' ? preferredLawyer : null,
          attachedDocCount: attachedFiles.length,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save appointment');
      }

      setBookingDetails({ trackingNumber, invoiceId });
      setStep(7);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!consultationType;
    if (step === 2) return !!practiceArea;
    if (step === 3) return !!selectedDate && !!selectedTime;
    if (step === 4) return description.trim().length >= 10;
    if (step === 5) return true;
    if (step === 6) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="bg-navy text-white px-6 pt-6 pb-4 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10 flex justify-between items-start mb-5">
            <div>
              <h2 className="font-serif text-2xl font-bold">Book Consultation</h2>
              <p className="text-gold text-sm mt-0.5">Agidi & Co — Expert Legal Counsel</p>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Step progress */}
          {step < 7 && (
            <div className="relative z-10 flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.num ? 'bg-gold text-white' : step === s.num ? 'bg-white text-navy' : 'bg-white/20 text-white/50'
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 hidden sm:block ${step === s.num ? 'text-gold' : 'text-white/40'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all ${step > s.num ? 'bg-gold' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* STEP 1: Consultation Type */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 1</span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2">Choose Consultation Type</h3>
                <p className="text-sm text-gray-500">How would you like to meet with your attorney?</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {CONSULTATION_TYPES.map(ct => {
                  const Icon = ct.icon;
                  const selected = consultationType === ct.id;
                  return (
                    <button key={ct.id} onClick={() => setConsultationType(ct.id)}
                      className={`flex items-center gap-5 p-5 rounded-xl border-2 text-left transition-all group ${
                        selected ? 'border-navy bg-navy text-white shadow-lg scale-[1.01]' : 'border-gray-200 hover:border-gold hover:shadow-md bg-white'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        selected ? 'bg-gold/20' : 'bg-gray-100 group-hover:bg-gold/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${selected ? 'text-gold' : 'text-gray-500 group-hover:text-gold'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg ${selected ? 'text-white' : 'text-navy'}`}>{ct.label}</p>
                        <p className={`text-sm ${selected ? 'text-white/70' : 'text-gray-500'}`}>{ct.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-gold bg-gold' : 'border-gray-300'
                      }`}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Practice Area */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 2</span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2">Choose Practice Area</h3>
                <p className="text-sm text-gray-500">Select the area of law that best describes your matter.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRACTICE_AREAS.map(pa => {
                  const Icon = pa.icon;
                  const selected = practiceArea === pa.id;
                  return (
                    <button key={pa.id} onClick={() => setPracticeArea(pa.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group ${
                        selected ? 'border-navy bg-navy text-white shadow-lg' : 'border-gray-200 hover:border-gold bg-white hover:shadow-sm'
                      }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        selected ? 'bg-gold/20' : 'bg-gray-100 group-hover:bg-gold/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? 'text-gold' : 'text-gray-500 group-hover:text-gold'}`} />
                      </div>
                      <span className={`text-sm font-semibold text-center leading-tight ${selected ? 'text-white' : 'text-navy'}`}>{pa.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Date / Time / Lawyer */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 3</span>
                  <h3 className="font-serif text-2xl font-bold text-navy mb-2">Pick a Date & Time</h3>
                  <p className="text-sm text-gray-500">Select your preferred appointment slot.</p>
                </div>

                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Available Dates</label>
                <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
                  {dates.map(item => (
                    <button key={item.fullDate} disabled={item.slots === 0}
                      onClick={() => { setSelectedDate(item.date); setSelectedTime(null); }}
                      className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border-2 transition-all snap-center shrink-0 ${
                        selectedDate === item.date ? 'border-navy bg-navy text-white shadow-lg scale-105' :
                        item.slots === 0 ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' :
                        'border-gray-200 hover:border-gold hover:shadow-md bg-white text-gray-600'
                      }`}>
                      <span className={`text-[10px] font-bold uppercase mb-1 ${selectedDate === item.date ? 'text-gold' : 'text-gray-400'}`}>{item.day}</span>
                      <span className="text-lg font-bold">{item.date.split(' ')[1]}</span>
                      <span className="text-[10px]">{item.date.split(' ')[0]}</span>
                      <span className={`text-[9px] mt-1.5 px-1.5 py-0.5 rounded-full font-bold ${
                        selectedDate === item.date ? 'bg-white/20 text-white' : item.slots === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'
                      }`}>{item.slots > 0 ? `${item.slots} slots` : 'Full'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Times for <span className="text-gold">{selectedDate}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {times.map(time => (
                      <button key={time} onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          selectedTime === time ? 'border-gold bg-gold text-white shadow-md' : 'border-gray-200 hover:border-navy text-gray-600 bg-white'
                        }`}>
                        <Clock className={`w-3.5 h-3.5 ${selectedTime === time ? 'text-white' : 'text-gray-400'}`} />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Lawyer <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                <select value={preferredLawyer} onChange={e => setPreferredLawyer(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white text-navy">
                  {LAWYERS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Description */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 4</span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2">Describe Your Matter</h3>
                <p className="text-sm text-gray-500">Give us a brief overview so your attorney can prepare effectively.</p>
              </div>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us about your issue — e.g., I need advice on incorporating a new company in Lagos and understanding my tax obligations..."
                  rows={8}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-0 focus:border-gold resize-none transition-colors leading-relaxed"
                />
                <div className={`absolute bottom-3 right-3 text-xs font-bold ${description.length >= 10 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {description.length} chars {description.length < 10 ? `(min 10)` : '✓'}
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Your description is encrypted and only shared with your assigned attorney. Please do not include passwords or other sensitive credentials.</p>
              </div>
            </div>
          )}

          {/* STEP 5: Documents */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 5</span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2">Supporting Documents</h3>
                <p className="text-sm text-gray-500">Upload relevant files to help your attorney understand your case. <span className="font-semibold text-gold">Optional.</span></p>
                <p className="text-xs text-gray-400 mt-1">Accepted: PDF, Images (JPG/PNG), Word (.docx), ZIP — max 5 files</p>
              </div>

              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.zip"
                onChange={handleFileAdd} />

              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group mb-4">
                <Upload className="w-10 h-10 text-gray-300 group-hover:text-gold mx-auto mb-3 transition-colors" />
                <p className="font-semibold text-navy mb-1">Click to browse files</p>
                <p className="text-xs text-gray-400">PDF • Images • Word • ZIP</p>
              </div>

              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached</p>
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                        <FileText className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.size > 1024 * 1024 ? (f.size / (1024 * 1024)).toFixed(1) + ' MB' : (f.size / 1024).toFixed(0) + ' KB'}</p>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {attachedFiles.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400">
                  No documents attached — you can always upload files from your dashboard later.
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Payment / Confirmation */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3">Step 6</span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2">Review & Confirm</h3>
                <p className="text-sm text-gray-500">Please review your consultation details before submitting.</p>
              </div>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200 space-y-3">
                {[
                  { label: 'Consultation Type', value: CONSULTATION_TYPES.find(c => c.id === consultationType)?.label },
                  { label: 'Practice Area', value: PRACTICE_AREAS.find(p => p.id === practiceArea)?.label },
                  { label: 'Date & Time', value: selectedDate && selectedTime ? `${selectedDate} at ${selectedTime}` : null },
                  { label: 'Preferred Lawyer', value: preferredLawyer !== 'No preference' ? preferredLawyer : 'No preference (auto-assigned)' },
                  { label: 'Documents', value: attachedFiles.length > 0 ? `${attachedFiles.length} file(s) attached` : 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-3 py-2 border-b border-gray-200 last:border-0">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide shrink-0">{label}</span>
                    <span className="text-sm font-bold text-navy text-right">{value || '—'}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Description</span>
                  <span className="text-sm text-navy text-right max-w-[60%] line-clamp-2">{description || '—'}</span>
                </div>
              </div>

              {/* Payment note */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-0.5">Payment Information</p>
                  <p className="text-xs text-amber-700">Your initial consultation fee (if applicable) will be calculated based on the practice area and lawyer selected. Our team will contact you with payment instructions after confirming availability.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button onClick={() => setStep(5)} className="text-gray-500 hover:text-navy font-medium px-4 py-2">Back</button>
                <button onClick={handleConfirm} disabled={isProcessing}
                  className="bg-gold hover:bg-gold-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[180px] justify-center shadow-lg">
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm Booking <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Confirmation */}
          {step === 7 && (
            <div className="text-center py-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-navy mb-3">Consultation Scheduled</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                Your consultation request has been submitted. It will appear in your <span className="font-bold text-navy">Appointments</span> and <span className="font-bold text-navy">Verification</span> tabs while under review.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8 border border-gray-200 text-left space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Tracking No.</span>
                  <span className="font-mono font-bold text-navy">{bookingDetails?.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Practice Area</span>
                  <span className="font-bold text-navy">{PRACTICE_AREAS.find(p => p.id === practiceArea)?.label}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Appointment</span>
                  <span className="font-bold text-navy text-right">{selectedDate}<br/>{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                </div>
              </div>

              <button onClick={onClose} className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Footer navigation — steps 1–5 */}
        {step >= 1 && step <= 5 && (
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="text-gray-500 hover:text-navy font-medium px-4 py-2 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="text-xs text-gray-400 font-medium">Step {step} of 6</div>
            <button
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              className="bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md disabled:shadow-none"
            >
              {step === 5 ? 'Review & Pay' : 'Continue'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
