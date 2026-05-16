import { ChevronRight, Briefcase, Scale, FileText, Shield, MapPin } from 'lucide-react';

export default function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <section className="bg-navy text-white pt-16 pb-14 md:pt-24 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Copy */}
          <div className="max-w-2xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-gold uppercase">
              <MapPin className="w-3 h-3" />
              Lagos, Nigeria · Advocates &amp; Solicitors
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
              Authoritative<br />
              Legal Counsel,{' '}
              <span className="text-gold italic">Accessible Instantly.</span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 mb-8 font-sans max-w-xl leading-relaxed">
              Register your account, book expert consultations, and manage your legal affairs through our secure client portal — from anywhere.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={onGetStarted}
                className="bg-gold hover:bg-gold-hover text-white px-7 py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:-translate-y-0.5"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="#services"
                className="border border-white/20 hover:border-white/40 text-white px-7 py-3.5 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2 hover:bg-white/5"
              >
                View Services
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { value: '20+', label: 'Years Experience' },
                { value: '500+', label: 'Cases Won' },
                { value: '98%', label: 'Client Satisfaction' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-gold">{s.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Service Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { icon: Briefcase, title: 'Corporate Law', desc: 'Incorporation & Compliance' },
              { icon: Scale, title: 'Mediation / Arbitration', desc: 'Dispute Resolution' },
              { icon: FileText, title: 'Contracts', desc: 'Drafting & Review' },
              { icon: Shield, title: 'Intellectual Property', desc: 'Trademarks & Patents' },
            ].map((area, idx) => (
              <div
                key={idx}
                className="bg-white/6 backdrop-blur-sm border border-white/10 p-5 md:p-6 rounded-2xl hover:bg-white/10 hover:border-gold/30 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center mb-4 group-hover:bg-gold/25 transition-colors">
                  <area.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-sm md:text-base text-white mb-1 leading-tight">{area.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
