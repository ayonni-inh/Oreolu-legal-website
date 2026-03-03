import { Calendar, ChevronRight, Scale, Search, Shield, FileText, Users, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
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
            
            {/* Service Search Bar */}
            <div className="bg-white rounded-lg p-2 flex items-center shadow-lg max-w-md mb-10">
              <Search className="text-gray-400 ml-3 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search practice areas or services..." 
                className="flex-1 bg-transparent border-none outline-none text-gray-800 px-4 py-2 font-sans"
              />
              <button className="bg-gold hover:bg-gold-hover text-white px-6 py-2 rounded-md font-medium transition-colors">
                Find
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
