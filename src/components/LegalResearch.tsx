import { BookOpen, Search, FileText, Scale, Gavel, Library } from 'lucide-react';

export default function LegalResearch() {
  const resources = [
    {
      category: "Case Law",
      icon: Gavel,
      items: [
        { title: "Supreme Court Rulings 2024", date: "Oct 15, 2024" },
        { title: "Corporate Liability Precedents", date: "Sep 28, 2024" },
        { title: "Intellectual Property Disputes", date: "Aug 12, 2024" }
      ]
    },
    {
      category: "Statutes & Regulations",
      icon: Scale,
      items: [
        { title: "New Corporate Tax Amendment", date: "Nov 01, 2024" },
        { title: "Data Privacy Act Compliance", date: "Oct 05, 2024" },
        { title: "Employment Standards Update", date: "Sep 15, 2024" }
      ]
    },
    {
      category: "Legal Commentary",
      icon: FileText,
      items: [
        { title: "Navigating Mergers & Acquisitions", date: "Oct 22, 2024" },
        { title: "The Future of Smart Contracts", date: "Sep 30, 2024" },
        { title: "Estate Planning Essentials", date: "Aug 25, 2024" }
      ]
    }
  ];

  return (
    <div className="pt-10 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-6">Legal Research Center</h1>
        <p className="text-gray-600 font-sans max-w-2xl mx-auto text-lg">
          Access our comprehensive database of legal precedents, statutes, and expert commentary. Empowering clients with knowledge.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-16 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent shadow-sm text-lg"
          placeholder="Search for cases, statutes, or articles..."
        />
        <button className="absolute inset-y-2 right-2 bg-navy hover:bg-navy-light text-white px-6 rounded-lg font-medium transition-colors">
          Search
        </button>
      </div>

      {/* Resource Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {resources.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy">
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-navy">{section.category}</h2>
            </div>
            <ul className="space-y-4">
              {section.items.map((item, i) => (
                <li key={i} className="group cursor-pointer">
                  <h3 className="text-gray-900 font-medium group-hover:text-gold transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                </li>
              ))}
            </ul>
            <button className="mt-6 text-navy font-semibold text-sm hover:text-gold transition-colors flex items-center gap-1">
              View All <BookOpen className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Featured Article */}
      <div className="mt-16 bg-navy rounded-2xl overflow-hidden shadow-xl text-white relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Library className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Featured Insight</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Understanding the New Digital Assets Framework
            </h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              A deep dive into how recent legislative changes impact cryptocurrency holdings and digital intellectual property rights for businesses.
            </p>
            <button className="bg-gold hover:bg-gold-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors w-fit">
              Read Full Analysis
            </button>
          </div>
          <div className="hidden md:block bg-navy-light/50 h-full min-h-[400px] relative">
             {/* Placeholder for an image or graphic */}
             <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <Scale className="w-32 h-32" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
