import { useState, ChangeEvent, FormEvent } from 'react';
import { X, User, Building, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

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
    role: '',
    clientId: ''
  });

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
      }
    }, 1500);
  };

  const resetAndClose = () => {
    setStep(1);
    setError(null);
    setFormData({
      firstName: '', lastName: '', email: '', password: '',
      companyName: '', industry: '', role: '', clientId: ''
    });
    onClose();
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess(formData);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-navy text-white p-6 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold">Client Registration</h2>
            <p className="text-gold font-sans text-sm mt-1">
              {step === 1 && "Step 1 of 2: Personal Information"}
              {step === 2 && "Step 2 of 2: Firm Details"}
              {step === 3 && "Registration Complete"}
            </p>
          </div>
          <button onClick={resetAndClose} className="text-gray-300 hover:text-white transition-colors relative z-10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div className="h-1 bg-gray-100 w-full">
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
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">Account Details</h3>
                  <p className="text-sm text-gray-500">Create your secure client portal access.</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    required type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    required type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="jane@example.com"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  required type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="••••••••"
                />
                
                {/* Password Strength Indicator */}
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-100">
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
                      <ShieldCheck className="w-3 h-3" /> Must be at least 8 characters with a symbol.
                    </p>
                    {strengthScore > 0 && (
                      <span className={`text-xs font-semibold ${
                        strengthScore <= 2 ? 'text-red-500' : 
                        strengthScore <= 3 ? 'text-yellow-600' : 
                        strengthScore === 4 ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {getStrengthLabel(strengthScore)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">Firm / Company Details</h3>
                  <p className="text-sm text-gray-500">Tell us about your organization to tailor our services.</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  required type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select 
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                  <input 
                    required type="text" name="role" value={formData.role} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                    placeholder="CEO, Founder, etc."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-navy font-medium px-4 py-2 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold hover:bg-gold-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[180px] justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-navy mb-4">Welcome to O.G. Agidi & Co</h3>
              <p className="text-gray-600 font-sans max-w-md mx-auto mb-8">
                Your client account has been successfully created for <span className="font-semibold text-navy">{formData.companyName}</span>. Your unique Client ID is <span className="font-semibold text-navy">{formData.clientId}</span>. You can now access your secure dashboard, book consultations, and upload documents.
              </p>
              <div>
                <button 
                  onClick={handleSuccess}
                  className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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
