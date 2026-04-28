import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { X, User, Building, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { sendEmailNotification, emailTemplates } from '../services/emailService';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: any) => void;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    industry: '',
    jobTitle: '',
    appRole: 'Client',
    clientId: ''
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (calculatePasswordStrength(formData.password) < 2) {
      setError("Please choose a stronger password before continuing.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const generatedId = '#' + Math.floor(10000 + Math.random() * 90000);
    setFormData(prev => ({ ...prev, clientId: generatedId }));

    // Simulate API call for registration
    setTimeout(() => {
      // 5% chance of failure for demonstration
      if (Math.random() > 0.95) {
        setError("Registration temporarily unavailable. Please try again in a moment.");
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setStep(3);
        
        // Include status in reported data
        const finalData = { ...formData, status: 'PENDING', clientId: generatedId };
        
        // Send welcome email
        const template = emailTemplates.welcome(formData.firstName);
        sendEmailNotification(formData.email, template.subject, template.html);
      }
    }, 1500);
  };

  const resetAndClose = () => {
    setStep(1);
    setError(null);
    setFormData({
      firstName: '', lastName: '', email: '', password: '',
      companyName: '', industry: '', jobTitle: '', appRole: 'Client', clientId: ''
    });
    onClose();
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess({ ...formData, status: 'PENDING' });
    resetAndClose();
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 5
  };

  const strengthScore = calculatePasswordStrength(formData.password);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && resetAndClose()}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] outline-none"
        tabIndex={-1}
      >
        
        {/* Header */}
        <div className="bg-navy text-white p-6 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10">
            <h2 id="modal-title" className="font-serif text-2xl font-bold">Client Registration</h2>
            <p id="modal-description" className="text-gold font-sans text-sm mt-1">
              {step === 1 && "Step 1 of 2: Personal Information"}
              {step === 2 && "Step 2 of 2: Firm Details"}
              {step === 3 && "Registration Complete"}
            </p>
          </div>
          <button 
            onClick={resetAndClose} 
            className="text-gray-300 hover:text-white transition-colors relative z-10 p-2 focus-visible:ring-2 focus-visible:ring-gold rounded-full outline-none"
            aria-label="Close registration modal"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 bg-gray-100 w-full" role="progressbar" aria-valuenow={step === 1 ? 50 : 100} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-gold transition-all duration-300 ease-out"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleNext} className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                  <User className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">Account Details</h3>
                  <p className="text-sm text-gray-500">Create your secure client portal access.</p>
                </div>
              </div>

              {error && (
                <div 
                  role="alert"
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    ref={firstInputRef}
                    id="firstName"
                    required type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    id="lastName"
                    required type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  id="email"
                  required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="jane@example.com"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  id="password"
                  required type="password" name="password" value={formData.password} onChange={handleChange}
                  aria-invalid={strengthScore > 0 && strengthScore < 2}
                  aria-describedby="password-hint"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="••••••••"
                />
                
                {/* Password Strength Indicator */}
                <div className="mt-2" id="password-hint">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-100" role="presentation">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-full flex-1 transition-colors duration-300 ${
                          strengthScore >= level ? getStrengthColor(strengthScore) : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Must be at least 8 characters with a symbol.
                    </p>
                    {strengthScore > 0 && (
                      <span className={`text-xs font-semibold ${
                        strengthScore <= 2 ? 'text-red-500' : 
                        strengthScore <= 3 ? 'text-yellow-600' : 
                        strengthScore === 4 ? 'text-blue-500' : 'text-green-500'
                      }`} aria-live="polite">
                        {getStrengthLabel(strengthScore)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 outline-none"
                >
                  Continue <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                  <Building className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">Firm / Company Details</h3>
                  <p className="text-sm text-gray-500">Tell us about your organization to tailor our services.</p>
                </div>
              </div>

              {error && (
                <div 
                  role="alert"
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  id="companyName"
                  required type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select 
                    id="industry"
                    required name="industry" value={formData.industry} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input 
                    id="jobTitle"
                    required type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="CEO, Founder, etc."
                  />
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="appRole" className="block text-sm font-medium text-gray-700 mb-1">System Access Role</label>
                <select 
                  id="appRole"
                  required name="appRole" value={formData.appRole} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="Client">Client (Standard Access)</option>
                  <option value="Staff">Staff (Legal Team)</option>
                  <option value="Admin">Administrator (Full Control)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  * Admin and Staff roles require manual verification by the firm.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-navy font-medium px-4 py-2 flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-gray-300 outline-none rounded"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold hover:bg-gold-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[180px] justify-center focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 outline-none"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Registering..."></div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-500" role="status">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-navy mb-4">Welcome to OROELU GODWIN AGIDI & CO</h3>
              <p className="text-gray-600 font-sans max-w-md mx-auto mb-6">
                Your client account has been successfully created for <span className="font-semibold text-navy">{formData.companyName}</span>. You can now access your secure dashboard, book consultations, and upload documents.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-xs mx-auto mb-8">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Your Client ID</p>
                <p className="text-2xl font-serif font-bold text-navy tracking-tight">{formData.clientId}</p>
                <p className="text-[10px] text-gray-500 mt-1 italic">Please save this for your records.</p>
              </div>
              <div>
                <button 
                  onClick={handleSuccess}
                  className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 outline-none"
                >
                  Go to Client Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
