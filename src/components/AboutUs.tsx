import { Users, Award, Globe, Building2, Quote } from 'lucide-react';
import { useState, useRef } from 'react';

export default function AboutUs() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stats = [
    { label: "Years of Experience", value: "25+" },
    { label: "Successful Cases", value: "1,500+" },
    { label: "Expert Attorneys", value: "40+" },
    { label: "Global Partners", value: "12" }
  ];

  const team = [
    { name: "Sarah Jenkins", role: "Managing Partner", specialization: "Corporate Law" },
    { name: "Michael Ross", role: "Senior Partner", specialization: "Litigation" },
    { name: "David Chen", role: "Partner", specialization: "Intellectual Property" },
    { name: "Elena Rodriguez", role: "Associate", specialization: "Family Law" }
  ];

  const editorialTeam = [
    { name: "Dr. Alistair Thorne", role: "Editor-in-Chief", specialization: "Constitutional Law" },
    { name: "Marianne Vos", role: "Senior Editor", specialization: "Commercial Litigation" },
    { name: "James O'Connell", role: "Legal Researcher", specialization: "Tech Policy" }
  ];

  const testimonials = [
    {
      quote: "O.G. Agidi & Co provided exceptional guidance during our corporate restructuring. Their attention to detail and strategic foresight saved us countless hours and mitigated significant risks.",
      name: "Sarah Jenkins",
      title: "CEO, TechFlow Solutions"
    },
    {
      quote: "The level of professionalism and dedication from the litigation team is unmatched. They handled our complex dispute with precision, securing a highly favorable outcome.",
      name: "Marcus Thorne",
      title: "Director, Global Logistics Inc."
    },
    {
      quote: "Having O.G. Agidi & Co as our legal partner has been invaluable. Their prompt responses and deep understanding of intellectual property law have been crucial to our growth.",
      name: "Elena Rodriguez",
      title: "Founder, InnovateX"
    },
    {
      quote: "Transparent, authoritative, and incredibly effective. They don't just offer legal advice; they provide actionable business strategies backed by legal expertise.",
      name: "David Chen",
      title: "Managing Partner, Chen Capital"
    }
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.scrollWidth / testimonials.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveTestimonial(Math.min(Math.max(newIndex, 0), testimonials.length - 1));
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / testimonials.length;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-10 pb-20">
      {/* Hero Section */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-6">Defending Rights, Defining Excellence.</h1>
          <p className="text-gray-600 font-sans text-lg leading-relaxed">
            Founded on the principles of integrity and unwavering advocacy, O.G. Agidi & Co has grown into a premier law firm serving clients globally. We combine traditional legal expertise with modern efficiency.
          </p>
        </div>
      </div>

      {/* O.G. Agidi & Co Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
               <Building2 className="w-6 h-6 text-gold" />
               <span className="text-sm font-bold text-gold uppercase tracking-wider">The Firm</span>
             </div>
             <h2 className="font-serif text-3xl font-bold text-navy mb-6">O.G. Agidi & Co</h2>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Established with a vision to redefine legal excellence, O.G. Agidi & Co has been at the forefront of corporate and commercial law for over two decades. Our firm is built on a foundation of deep legal expertise, strategic thinking, and an unwavering commitment to our clients' success.
             </p>
             <p className="text-gray-600 leading-relaxed">
               We pride ourselves on our ability to navigate complex legal landscapes and deliver innovative solutions that drive business growth. From high-stakes litigation to intricate corporate structuring, O.G. Agidi & Co is your trusted partner in law.
             </p>
           </div>
           <div className="flex-1 w-full h-80 bg-navy rounded-xl relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="text-center p-8">
                <h3 className="font-serif text-2xl text-white mb-2">Legacy of Trust</h3>
                <p className="text-gray-300">Since 1998</p>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-navy py-16 text-white mb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl md:text-5xl font-serif font-bold text-gold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-gray-300 font-sans uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-navy">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy mb-4">Excellence</h3>
            <p className="text-gray-600">We hold ourselves to the highest standards of legal practice, ensuring every case receives meticulous attention.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-navy">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy mb-4">Client-Centric</h3>
            <p className="text-gray-600">Your goals are our priority. We build lasting relationships based on trust, transparency, and results.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-navy">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy mb-4">Global Reach</h3>
            <p className="text-gray-600">With a network of international partners, we provide seamless legal support across borders and jurisdictions.</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-12 text-center">Our Leadership</h2>
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                   {/* Placeholder for headshot */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                      <Users className="w-16 h-16 opacity-20" />
                   </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-navy mb-1">{member.name}</h3>
                  <p className="text-gold font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.specialization}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Editorial Team Section */}
          <div className="border-t border-gray-200 pt-20">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">Editorial Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The minds behind our legal research and insights, ensuring accuracy and depth in every publication.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {editorialTeam.map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:border-gold/50 transition-colors">
                  <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center text-navy shrink-0">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy">{member.name}</h3>
                    <p className="text-gold text-sm font-medium">{member.role}</p>
                    <p className="text-gray-500 text-xs mt-1">{member.specialization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Testimonials Section */}
          <div className="border-t border-gray-200 pt-20 mt-20">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">Client Testimonials</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from the businesses and individuals who trust O.G. Agidi & Co with their most critical legal matters.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {testimonials.map((testimonial, idx) => (
                  <div 
                    key={idx} 
                    className="w-full min-w-[85vw] md:min-w-[100%] snap-center px-4"
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center relative">
                      <Quote className="w-12 h-12 text-gold/20 absolute top-6 left-6 md:top-8 md:left-8" />
                      <p className="font-serif text-xl md:text-2xl text-navy leading-relaxed mb-8 relative z-10 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold mb-4">
                          {testimonial.name.charAt(0)}
                        </div>
                        <h4 className="font-bold text-navy text-lg">{testimonial.name}</h4>
                        <p className="text-gray-500 text-sm uppercase tracking-wider mt-1">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      activeTestimonial === idx ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
