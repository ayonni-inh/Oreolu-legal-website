import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Shield, Compass, Users } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: any;
  color: string;
}

export default function WelcomeTour({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Welcome to the Team! 👋",
      description: "We're thrilled to have you here at OROELU GODWIN AGIDI & CO. We've designed this platform to make your legal journey as smooth as possible. Let's take a quick tour!",
      icon: Users,
      color: "text-gold"
    },
    {
      title: "Explore Our Services",
      description: "Use our interactive service grid to easily find the legal help you need. From corporate law to litigation, everything is just a click away.",
      icon: Compass,
      color: "text-blue-600"
    },
    {
      title: "Your Secure Portal",
      description: "Once registered, you'll get access to a secure dashboard to track your cases, message your legal team, and receive AI-powered strategic insights.",
      icon: Shield,
      color: "text-navy"
    },
    {
      title: "Ready to Begin?",
      description: "Sign up now to create your personalized legal dashboard and start working with our expert attorneys.",
      icon: Sparkles,
      color: "text-green-600"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-navy transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 text-center">
          <div className={`w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-8 shadow-inner`}>
            <step.icon className={`w-10 h-10 ${step.color}`} />
          </div>

          <h3 className="font-serif text-3xl font-bold text-navy mb-4">{step.title}</h3>
          <p className="text-gray-600 leading-relaxed mb-10">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-8 bg-gold' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handleBack}
                  className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-navy/20"
              >
                {currentStep === steps.length - 1 ? "Sign Up Now" : "Next"} 
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Step {currentStep + 1} of {steps.length} • OROELU GODWIN AGIDI & CO
          </p>
        </div>
      </div>
    </div>
  );
}
