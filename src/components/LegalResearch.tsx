import { useState, useMemo } from 'react';
import { BookOpen, Search, FileText, Scale, Gavel, Library, Bot, Filter, ChevronDown, Calendar, SortAsc } from 'lucide-react';

export default function LegalResearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  const allResources = useMemo(() => [
    {
      id: 1,
      title: "Supreme Court Rulings 2024",
      date: "2024-10-15",
      category: "Case Law",
      icon: Gavel,
      relevance: 95,
      description: "A comprehensive review of the most impactful Supreme Court decisions of the current year."
    },
    {
      id: 2,
      title: "Corporate Liability Precedents",
      date: "2024-09-28",
      category: "Case Law",
      icon: Gavel,
      relevance: 88,
      description: "Analyzing key cases that have shaped corporate responsibility and liability in the modern era."
    },
    {
      id: 3,
      title: "Intellectual Property Disputes",
      date: "2024-08-12",
      category: "Case Law",
      icon: Gavel,
      relevance: 82,
      description: "Recent developments in patent and trademark litigation across various industries."
    },
    {
      id: 4,
      title: "New Corporate Tax Amendment",
      date: "2024-11-01",
      category: "Statutes & Regulations",
      icon: Scale,
      relevance: 98,
      description: "Critical updates to the corporate tax code and their implications for business operations."
    },
    {
      id: 5,
      title: "Data Privacy Act Compliance",
      date: "2024-10-05",
      category: "Statutes & Regulations",
      icon: Scale,
      relevance: 92,
      description: "A guide to meeting the requirements of the latest data protection and privacy legislation."
    },
    {
      id: 6,
      title: "Employment Standards Update",
      date: "2023-09-15",
      category: "Statutes & Regulations",
      icon: Scale,
      relevance: 75,
      description: "Reviewing changes to labor laws and workplace standards implemented in late 2023."
    },
    {
      id: 7,
      title: "Navigating Mergers & Acquisitions",
      date: "2024-10-22",
      category: "Legal Commentary",
      icon: FileText,
      relevance: 90,
      description: "Expert insights into the legal hurdles and strategies for successful M&A transactions."
    },
    {
      id: 8,
      title: "The Future of Smart Contracts",
      date: "2024-09-30",
      category: "Legal Commentary",
      icon: FileText,
      relevance: 85,
      description: "Exploring the legal landscape of blockchain-based agreements and their enforceability."
    },
    {
      id: 9,
      title: "Estate Planning Essentials",
      date: "2023-08-25",
      category: "Legal Commentary",
      icon: FileText,
      relevance: 70,
      description: "Foundational principles and recent trends in effective estate and wealth management."
    }
  ], []);

  const filteredResources = useMemo(() => {
    return allResources
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesYear = selectedYear === 'All' || item.date.startsWith(selectedYear);
        return matchesSearch && matchesCategory && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        return b.relevance - a.relevance;
      });
  }, [searchQuery, selectedCategory, selectedYear, sortBy, allResources]);

  const categories = ['All', 'Case Law', 'Statutes & Regulations', 'Legal Commentary'];
  const years = ['All', '2024', '2023'];

  return (
    <div className="pt-10 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-6 tracking-tight">Legal Research Center</h1>
        <p className="text-gray-600 font-sans max-w-2xl mx-auto text-lg leading-relaxed">
          Access our comprehensive database of legal precedents, statutes, and expert commentary. Empowering clients with knowledge.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <label htmlFor="legal-search-input" className="sr-only">Search for cases, statutes, or articles</label>
            <input
              id="legal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all outline-none"
              placeholder="Search for cases, statutes, or articles..."
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4" role="group" aria-label="Search filters">
            <div className="relative min-w-[160px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gold text-sm font-medium text-navy cursor-pointer outline-none"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
            </div>

            <div className="relative min-w-[120px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <label htmlFor="year-filter" className="sr-only">Filter by year</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gold text-sm font-medium text-navy cursor-pointer outline-none"
              >
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
            </div>

            <div className="relative min-w-[140px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SortAsc className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <label htmlFor="sort-by" className="sr-only">Sort by</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gold text-sm font-medium text-navy cursor-pointer outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium" aria-live="polite">
          Showing <span className="text-navy font-bold">{filteredResources.length}</span> resources
        </p>
        {(searchQuery || selectedCategory !== 'All' || selectedYear !== 'All') && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedYear('All');
              setSortBy('relevance');
            }}
            className="text-xs font-bold text-gold hover:text-navy transition-colors uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-gold rounded outline-none"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Resource Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-gold/30 transition-all duration-300 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-navy mb-3 group-hover:text-gold transition-colors leading-tight">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <button className="text-navy font-bold text-xs hover:text-gold transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                  Read More <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* AI Assistant CTA */}
      <div className="mt-20 bg-navy rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
              <Bot className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-serif text-3xl font-bold text-white mb-2">Need Instant Legal Guidance?</h3>
              <p className="text-gray-400 text-lg max-w-xl leading-relaxed">Our AI Legal Assistant is trained on Nigerian statutes and case law to provide immediate answers.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const chatBtn = document.querySelector('button[title="Notifications"]')?.parentElement?.parentElement?.querySelector('button.fixed');
              if (chatBtn instanceof HTMLButtonElement) chatBtn.click();
            }}
            className="bg-gold hover:bg-gold-hover text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-gold/20 hover:-translate-y-1 whitespace-nowrap"
          >
            Start AI Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
