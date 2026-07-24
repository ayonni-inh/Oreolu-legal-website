import { Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface ServiceGridProps {
  onBookService: (service: any) => void;
}

const services = [
  {
    id: 'litigation',
    title: 'Litigation Services',
    badge: 'Most Popular',
    pricingLabel: 'Retainer',
    pricingNote: 'Case-by-Case',
    description: 'Representation in Trial, Appellate Court and Tribunals.',
    features: [
      'Appellate advocacy',
      'Civil litigation',
      'Contracts & agreements litigation',
      'Corporate litigation',
      'Criminal defense litigation',
      'Criminal litigation',
      'Divorce litigation',
      'Employment litigation',
      'Real estate litigation',
      'Chieftancy Cases',
      'Land/Property Cases',
      'Corporate/Commercial Cases',
      'Criminal Cases',
      'Employment Cases',
      'Intellectual Property Cases',
      'Blockchain/Cyber/ICT Cases',
      'Due diligence investigation & advisory',
    ],
    highlighted: true,
  },
  {
    id: 'business-property',
    title: 'Business & Property',
    badge: null,
    pricingLabel: 'Consultation',
    pricingNote: 'From ₦250,000',
    description: 'Comprehensive legal support for your business transactions and property matters.',
    features: [
      'Bankruptcy representation',
      'Liquidation',
      'Winding up',
      'Company registration',
      'Intellectual property registration',
      'Land documentation',
      'Will writing',
      'Business transactions',
      'Real estate title services',
      'Legal settlements',
    ],
    highlighted: false,
  },
  {
    id: 'advisory-personal',
    title: 'Arbitration & Alternative Dispute Resolution',
    badge: null,
    pricingLabel: '',
    pricingNote: 'Varies',
    description: 'Expert neutral services for resolving disputes outside the courtroom efficiently and confidentially.',
    features: [
      'Arbitrators',
      'Mediators',
      'Negotiators',
      'Case assessment',
      'Legal advice',
      'Power of attorney',
      'Pro bono representation',
    ],
    highlighted: false,
  },
];

export default function ServiceGrid({ onBookService }: ServiceGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.scrollWidth / services.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), services.length - 1));
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / services.length;
      scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gray-50 px-6 lg:px-8" id="services">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-navy mb-4">Legal Service Plans</h2>
          <p className="text-gray-500 font-sans text-base max-w-2xl mx-auto leading-relaxed">
            Transparent pricing for our most requested services. Select a plan to book your
            appointment and secure our representation instantly.
          </p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto pt-6 pb-8 -mx-6 px-6 md:mx-auto md:px-0 md:pt-8 md:pb-0 md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {services.map((service) => (
              <div
                key={service.id}
                className={`rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col min-w-[85vw] sm:min-w-[350px] md:min-w-0 snap-center overflow-hidden ${
                  service.highlighted
                    ? 'bg-navy border-navy shadow-lg text-white relative'
                    : 'bg-white border-gray-200 shadow-sm text-navy'
                }`}
              >
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-md z-10">
                    {service.badge}
                  </div>
                )}

                {/* Pricing band */}
                <div
                  className={`px-7 pt-8 pb-6 border-b ${
                    service.highlighted ? 'border-white/10' : 'border-gray-100'
                  }`}
                >
                  {service.pricingLabel ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block font-semibold tracking-wide text-sm uppercase px-3 py-1 rounded-full ${
                          service.highlighted
                            ? 'bg-white/10 text-gold'
                            : 'bg-navy/5 text-navy'
                        }`}
                      >
                        {service.pricingLabel}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          service.highlighted ? 'text-gray-400' : 'text-gray-400'
                        }`}
                      >
                        · {service.pricingNote}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        service.highlighted ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    >
                      {service.pricingNote}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="px-7 pt-6 pb-7 flex flex-col flex-1">
                  {/* Title */}
                  <h3
                    className={`font-serif font-bold leading-snug mb-3 ${
                      service.highlighted ? 'text-white' : 'text-navy'
                    } ${service.title.length > 24 ? 'text-xl' : 'text-2xl'}`}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm font-sans leading-relaxed mb-6 ${
                      service.highlighted ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            service.highlighted ? 'bg-gold/20' : 'bg-navy/8'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 text-gold" />
                        </span>
                        <span
                          className={`font-sans text-sm leading-relaxed ${
                            service.highlighted ? 'text-gray-200' : 'text-gray-600'
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => onBookService(service)}
                    className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                      service.highlighted
                        ? 'bg-gold hover:bg-gold-hover text-white shadow-md hover:shadow-lg'
                        : 'bg-navy text-white hover:bg-navy/90'
                    }`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile dots */}
          <div className="flex justify-center gap-2 mt-5 md:hidden">
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === idx ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
