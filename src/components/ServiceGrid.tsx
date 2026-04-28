import { Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface ServiceGridProps {
  onBookService: (service: any) => void;
}

const services = [
  {
    id: 'litigation',
    title: 'Litigation Services',
    price: 'Retainer',
    duration: 'Case-by-Case',
    description: 'Expert representation in court and dispute resolution across various legal domains.',
    features: [
      'Appellate advocacy',
      'Civil litigation',
      'Contracts & agreements litigation',
      'Corporate litigation',
      'Criminal defense litigation',
      'Criminal litigation',
      'Divorce litigation',
      'Employment litigation',
      'Real estate litigation'
    ],
    highlighted: true
  },
  {
    id: 'business-property',
    title: 'Business & Property',
    price: 'Consultation',
    duration: 'From $250',
    description: 'Comprehensive legal support for your business transactions and property matters.',
    features: [
      'Bankruptcy representation',
      'Business transactions',
      'Real estate title services',
      'Legal settlements'
    ],
    highlighted: false
  },
  {
    id: 'advisory-personal',
    title: 'Advisory & Personal',
    price: 'Flat Fee',
    duration: 'Varies',
    description: 'Personalized legal guidance, estate planning, and alternative dispute resolution.',
    features: [
      'Case assessments',
      'Legal advice',
      'Mediation',
      'Power of attorney',
      'Pro bono representation',
      'Will writing'
    ],
    highlighted: false
  }
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
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-gray-50 px-6 lg:px-8" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-navy mb-4">Legal Service Plans</h2>
          <p className="text-gray-600 font-sans max-w-2xl mx-auto">
            Transparent pricing for our most requested services. Select a plan to book your appointment and secure our representation instantly.
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
                className={`rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-8 flex flex-col min-w-[85vw] sm:min-w-[350px] md:min-w-0 snap-center ${
                  service.highlighted 
                    ? 'bg-navy border-navy shadow-lg text-white relative' 
                    : 'bg-white border-gray-200 shadow-sm text-navy'
                }`}
              >
              {service.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className={`font-serif text-3xl font-bold mb-3 leading-tight ${service.highlighted ? 'text-white' : 'text-navy'}`}>
                  {service.title}
                </h3>
                <p className={`text-sm font-sans leading-relaxed min-h-[60px] ${service.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                  {service.description}
                </p>
              </div>
              
              <div className={`mb-8 pb-8 border-b ${service.highlighted ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold tracking-tight ${service.highlighted ? 'text-white' : 'text-navy'}`}>
                    {service.price}
                  </span>
                  <span className={`font-sans text-xs font-semibold uppercase tracking-wider ${service.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                    / {service.duration}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className={`font-sans text-sm leading-relaxed ${service.highlighted ? 'text-gray-200' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onBookService(service)}
                className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-200 ${
                  service.highlighted 
                    ? 'bg-gold hover:bg-gold-hover text-white shadow-md hover:shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200 text-navy'
                }`}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
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
