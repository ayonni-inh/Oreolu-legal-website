import { Calendar, ChevronRight, Scale, Search, Shield, FileText, Users, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <section className="bg-navy text-white pt-24 pb-16 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Authoritative Legal Counsel, <span className="text-gold italic">Accessible Instantly.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 font-sans max-w-xl leading-relaxed">
              Access our comprehensive suite of legal services. Register your account, book expert consultations, and manage your legal affairs through our secure client portal.
            </p>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={onGetStarted}
                className="bg-gold hover:bg-gold-hover text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Briefcase, title: 'Corporate Law', desc: 'Incorporation & Compliance' },
              { icon: Scale, title: 'Litigation', desc: 'Dispute Resolution' },
              { icon: FileText, title: 'Contracts', desc: 'Drafting & Review' },
              { icon: Shield, title: 'Intellectual Property', desc: 'Trademarks & Patents' }
            ].map((area, idx) => (
              <div key={idx} className="bg-navy-light/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-navy-light hover:border-gold/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                <area.icon className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-serif text-xl font-bold tracking-tight mb-2 text-white">{area.title}</h3>
                <p className="text-sm text-gray-400 font-sans leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
