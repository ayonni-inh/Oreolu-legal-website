import { Users, Award, Globe, Building2, Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const awards = [
  { img: '/award-cilrm-fellow.png', title: 'Fellow of the Institute', body: 'Chartered Institute of Loan & Risk Management of Nigeria', year: '2015' },
  { img: '/award-nba-honour.png', title: 'Certificate of Honour', body: 'Nigerian Bar Association — Badagry Branch (Heritage Bar)', year: '2022' },
  { img: '/award-ila-merit.png', title: 'Certificate of Merit — International Law Advocacy Award', body: 'International Law Association', year: '2024' },
  { img: '/award-geda-adviser.png', title: 'Best Legal Adviser Award', body: 'General Electric Dealers Association of Nigeria', year: '2017' },
  { img: '/award-icar-fellow.png', title: 'Fellow of the Institute', body: 'Institute of Chartered Administrators and Researchers of Nigeria', year: '2019' },
  { img: '/award-nba-life-member.png', title: 'Honorary Life Membership Award', body: 'Nigerian Bar Association — Badagry Branch (Heritage Bar)', year: '2021' },
  { img: '/award-voice-achievers.png', title: 'The Voice Achievers Award — African Impact Award', body: 'African Impact Organisation', year: '2024' },
  { img: '/award-cilrm-honorary.png', title: 'Honorary Fellowship Award', body: 'Chartered Institute of Loan & Risk Management of Nigeria', year: '2026' },
  { img: '/award-heritage-bar.png', title: 'Heritage Bar Personality of the Year', body: 'Nigerian Bar Association — Heritage Bar', year: '2025' },
];

export default function AboutUs() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeAward, setActiveAward] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prevAward = useCallback(() => setActiveAward(i => (i - 1 + awards.length) % awards.length), []);
  const nextAward = useCallback(() => setActiveAward(i => (i + 1) % awards.length), []);

  useEffect(() => {
    const timer = setInterval(nextAward, 4000);
    return () => clearInterval(timer);
  }, [nextAward]);

  const stats = [
    { label: "Years of Experience", value: "25+" },
    { label: "Successful Cases", value: "1,500+" },
    { label: "Expert Attorneys", value: "10" },
    { label: "Global Partners", value: "2" }
  ];

  const team = [
    { name: "Dr. Oroelu Godwin Agidi", role: "Founder & Lead Partner", specialization: "Law, Arbitration & Risk Management" },
    { name: "Sarah Jenkins", role: "Managing Partner", specialization: "Corporate Law" },
    { name: "Michael Ross", role: "Senior Partner", specialization: "Litigation" },
    { name: "David Chen", role: "Partner", specialization: "Intellectual Property" }
  ];

  const editorialTeam = [
    { name: "Dr. Alistair Thorne", role: "Editor-in-Chief", specialization: "Constitutional Law" },
    { name: "Marianne Vos", role: "Senior Editor", specialization: "Commercial Litigation" },
    { name: "James O'Connell", role: "Legal Researcher", specialization: "Tech Policy" }
  ];

  const testimonials = [
    {
      quote: "Thanks a lot. We not let you down.",
      name: "John Chibueze Nwosu",
      title: "Local Guide · 5 stars",
      rating: 5
    },
    {
      quote: "It nice",
      name: "peace oretayo",
      title: "Local Guide · 2 stars",
      rating: 2
    },
    {
      quote: "A top notch service delivery that is second to none.",
      name: "patrick ossai",
      title: "1 review · 5 stars",
      rating: 5
    },
    {
      quote: "This is a law firm where you can see legal luminaries with the finest minds",
      name: "Ukablaia Sunday",
      title: "1 review · 5 stars",
      rating: 5
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
            Founded on the principles of integrity and unwavering advocacy, OROELU GODWIN AGIDI & CO has grown into a premier law firm serving clients globally. We combine traditional legal expertise with modern efficiency.
          </p>
        </div>
      </div>

      {/* OROELU GODWIN AGIDI & CO Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
               <Building2 className="w-6 h-6 text-gold" />
               <span className="text-sm font-bold text-gold uppercase tracking-wider">The Firm</span>
             </div>
             <h2 className="font-bold text-navy mb-6 text-xl sm:text-2xl md:text-3xl text-center leading-tight">
               OROELU GODWIN AGIDI<br/>& CO
             </h2>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Established with a vision to redefine legal excellence, OROELU GODWIN AGIDI & CO has been at the forefront of corporate and commercial law for over two decades. Our firm is built on a foundation of deep legal expertise, strategic thinking, and an unwavering commitment to our clients' success.
             </p>
             <p className="text-gray-600 leading-relaxed">
               We pride ourselves on our ability to navigate complex legal landscapes and deliver innovative solutions that drive business growth. From high-stakes litigation to intricate corporate structuring, OROELU GODWIN AGIDI & CO is your trusted partner in law.
             </p>
           </div>
           <div className="flex-1 w-full h-80 bg-navy rounded-xl relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="text-center p-8">
                <h3 className="font-serif text-2xl text-white mb-2">Legacy of Trust</h3>
                <p className="text-gray-300">Since 1995</p>
              </div>
           </div>
        </div>
      </div>

      {/* Founder Profile Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="bg-navy text-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/3 bg-gray-100 relative min-h-[400px]">
            {/* Placeholder for Founder Photo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-navy/20 p-8 text-center">
              <Users className="w-24 h-24 mb-4 opacity-10" />
              <p className="font-serif text-xl font-bold opacity-30">Dr. Oroelu Godwin Agidi</p>
              <p className="text-sm opacity-30 mt-2">Founder & Lead Partner</p>
            </div>
            {/* Award Badge Overlay */}
            <div className="absolute top-6 left-6 bg-gold text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">African Impact Award 2025</span>
            </div>
          </div>
          <div className="lg:w-2/3 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold"></div>
              <span className="text-gold font-bold uppercase tracking-widest text-sm">Founder's Profile</span>
            </div>
            <h2 className="font-serif text-4xl font-bold mb-2 leading-tight">Dr. Oroelu Godwin Agidi</h2>
            <p className="text-gold/80 text-sm font-medium tracking-wide mb-8">BL, MCArb, CFIAR, DICRMP, HCILRM</p>
            
            <div className="space-y-6 text-gray-300 leading-relaxed font-sans">
              <p className="text-white text-lg font-medium italic border-l-4 border-gold pl-6">
                "Oroelu Godwin Agidi stands as the esteemed founder and lead partner of OROELU GODWIN AGIDI & CO. This multidisciplinary firm boasts specializations across several crucial areas, including law, arbitration, alternative dispute resolution (ADR), and comprehensive loan and risk management services."
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-wider text-xs mb-4">Academic Excellence</h3>
                  <p className="text-sm">
                    His academic journey is extensive and impressive, beginning with his call to the Nigerian Bar in 1995. Agidi pursued advanced studies, culminating in a Master’s degree in Diplomacy and Negotiation, and ultimately, a Doctorate in both Law and Diplomacy.
                  </p>
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-wider text-xs mb-4">Regulatory Expertise</h3>
                  <p className="text-sm">
                    A prominent area of his professional expertise lies in regulatory compliance, where he is widely recognized for his deep knowledge of anti-money laundering (AML) and counter-terrorism financing (CTF) protocols.
                  </p>
                </div>
              </div>

              <p className="text-sm">
                Agidi’s contributions and advocacy in the field of international law have been honored with the prestigious International Law Association’s Award for International Law Advocacy, a testament to his influence and respect among his peers.
              </p>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold" /> Professional Affiliations
                </h3>
                <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-400">
                  <li>• Nigerian Institute of Chartered Arbitrators</li>
                  <li>• Institute of Chartered Administrators and Researchers of Nigeria</li>
                  <li>• Chartered Institute of Loan and Risk Management of Nigeria</li>
                  <li>• International Certified Risk Management Professionals (UK)</li>
                  <li>• Nigerian Bar Association (NBA)</li>
                  <li>• International Law Association (Nigerian Branch)</li>
                </ul>
              </div>

              <p className="text-sm">
                With over three decades of active legal practice, Agidi possesses a wealth of experience in high-stakes litigation, property, corporate, and commercial law. His extensive courtroom experience includes representing clients effectively in appellate courts.
              </p>

              <div className="pt-6 border-t border-white/10 mt-8">
                <h3 className="text-white font-bold text-sm mb-4">Beyond the Courtroom</h3>
                <p className="text-sm italic">
                  Dr. Agidi serves as a West African Youth Council Peace Ambassador and holds vital board and advisory roles. He is deeply committed to legal scholarship, mentoring young lawyers, and supporting the less privileged and widows in his community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards & Certifications Carousel */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-gold"></div>
            <span className="text-gold font-bold uppercase tracking-widest text-sm">Recognition</span>
            <div className="h-px w-12 bg-gold"></div>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy">Awards &amp; Certifications</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Slide */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-center bg-gray-50 p-6 min-h-[340px]">
              <img
                key={activeAward}
                src={awards[activeAward].img}
                alt={awards[activeAward].title}
                className="max-h-72 w-auto object-contain drop-shadow-lg transition-opacity duration-500"
              />
            </div>
            <div className="px-8 py-6 text-center border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">{awards[activeAward].year}</p>
              <h3 className="font-serif text-lg font-bold text-navy mb-1">{awards[activeAward].title}</h3>
              <p className="text-gray-500 text-sm">{awards[activeAward].body}</p>
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={prevAward}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
            aria-label="Previous award"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextAward}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-colors"
            aria-label="Next award"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {awards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAward(idx)}
                className={`transition-all duration-300 rounded-full ${activeAward === idx ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to award ${idx + 1}`}
              />
            ))}
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

          {/* Editorial Team Section - hidden at client request */}
          {false && (
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
          )}

          {/* Client Testimonials Section */}
          <div className="border-t border-gray-200 pt-20 mt-20">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">Client Testimonials</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from the businesses and individuals who trust OROELU GODWIN AGIDI & CO with their most critical legal matters.
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
                      <p className="font-serif text-xl md:text-2xl text-navy leading-relaxed mb-6 relative z-10 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex justify-center gap-1 mb-6">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-5 h-5 ${
                              starIdx < (testimonial.rating || 5)
                                ? 'fill-gold text-gold'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold mb-4">
                          {testimonial.name.charAt(0).toUpperCase()}
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
