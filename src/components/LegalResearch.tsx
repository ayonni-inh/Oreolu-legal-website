import { useState } from 'react';
import { BookOpen, Search, FileText, Scale, Gavel, Library, Bot, ExternalLink, Loader2, AlertCircle, Quote, Database } from 'lucide-react';

const DATABASES = [
  {
    name: "NigeriaLII",
    description: "Nigeria Legal Information Institute — free access to Nigerian legislation, case law & treaties.",
    url: "https://nigerialii.org",
    badge: "Free",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700"
  },
  {
    name: "LawPavilion",
    description: "Nigeria's largest electronic law library with over 200,000 case reports and statutes.",
    url: "https://lawpavilion.com",
    badge: "Premium",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  {
    name: "Laws of the Federation",
    description: "Official consolidated Laws of the Federation of Nigeria (LFN) — CAP references.",
    url: "https://laws.gov.ng",
    badge: "Official",
    color: "bg-navy/5 border-navy/20",
    badgeColor: "bg-navy/10 text-navy"
  },
  {
    name: "CommonLII",
    description: "Common Legal Information Institute — Nigerian court judgments and legal materials.",
    url: "https://www.commonlii.org/ng/",
    badge: "Free",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700"
  },
  {
    name: "Supreme Court Nigeria",
    description: "Official Nigerian Supreme Court portal — landmark judgments and opinions.",
    url: "https://supremecourt.gov.ng",
    badge: "Official",
    color: "bg-navy/5 border-navy/20",
    badgeColor: "bg-navy/10 text-navy"
  },
  {
    name: "Nigeria Law",
    description: "Nigerian case law repository covering federal and state court decisions.",
    url: "https://www.lawnigeria.com",
    badge: "Free",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700"
  }
];

const CATEGORY_ICON: Record<string, any> = {
  'Case Law': Gavel,
  'Statutes & Regulations': Scale,
  'Legal Commentary': FileText,
};

const CATEGORY_COLOR: Record<string, string> = {
  'Case Law': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Statutes & Regulations': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Legal Commentary': 'bg-purple-50 text-purple-700 border border-purple-200',
};

const SUGGESTED = [
  "Companies and Allied Matters Act 2020",
  "Petroleum Industry Act 2021",
  "Land Use Act",
  "Nigerian Data Protection Act 2023",
  "Anti-Money Laundering regulations",
  "Fundamental rights enforcement",
];

interface ResearchResult {
  id: string;
  title: string;
  citation?: string;
  category: string;
  date: string;
  summary: string;
  court?: string;
  source: string;
  url?: string;
}

export default function LegalResearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (q?: string) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    setLastQuery(searchQ);
    if (q) setQuery(q);
    try {
      const res = await fetch('/api/legal-research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQ, category })
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError('Could not complete the search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-navy/5 text-navy text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 border border-navy/10">
          <Database className="w-3.5 h-3.5" /> AI-Powered Legal Research
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-5 tracking-tight">Nigerian Legal Research Center</h1>
        <p className="text-gray-500 font-sans max-w-2xl mx-auto text-lg leading-relaxed">
          Search real Nigerian statutes, case law, and legal commentary — powered by AI with access to authoritative legal databases.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search cases, statutes, regulations, or legal topics…"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold text-sm font-medium text-navy min-w-[200px]"
          >
            <option value="All">All Categories</option>
            <option value="Case Law">Case Law</option>
            <option value="Statutes & Regulations">Statutes & Regulations</option>
            <option value="Legal Commentary">Legal Commentary</option>
          </select>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-navy hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Suggested searches */}
        {!searched && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="text-xs text-navy bg-navy/5 hover:bg-navy hover:text-white border border-navy/10 px-3 py-1.5 rounded-lg font-medium transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-navy font-semibold text-lg">Searching Nigerian legal databases…</p>
          <p className="text-gray-400 text-sm mt-2">AI is retrieving real cases and statutes</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">
                Showing <span className="text-navy font-bold">{results.length}</span> results for <span className="font-semibold text-navy">"{lastQuery}"</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI-sourced from Nigerian legal databases
              </p>
            </div>
            <button
              onClick={() => { setSearched(false); setResults([]); setQuery(''); setLastQuery(''); }}
              className="text-xs font-bold text-gold hover:text-navy transition-colors uppercase tracking-widest"
            >
              Clear Results
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {results.map(item => {
              const Icon = CATEGORY_ICON[item.category] || FileText;
              const catStyle = CATEGORY_COLOR[item.category] || 'bg-gray-100 text-gray-700 border border-gray-200';
              return (
                <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-7 hover:shadow-xl hover:border-gold/40 transition-all duration-300 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-11 h-11 bg-navy/5 rounded-xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${catStyle}`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors leading-snug">
                    {item.title}
                  </h3>
                  {item.citation && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Quote className="w-3 h-3 text-gold shrink-0" />
                      <span className="text-xs text-gold font-mono font-semibold">{item.citation}</span>
                    </div>
                  )}
                  <p className="text-gray-600 text-sm flex-1 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-400">
                      <span className="font-semibold text-gray-500">{item.court || item.source}</span>
                      {item.date && <span className="ml-2">· {item.date}</span>}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-navy hover:text-gold transition-colors uppercase tracking-wider"
                      >
                        View Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mb-12">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">No results found</h3>
          <p className="text-gray-500 text-sm">Try a different query or browse the databases below directly.</p>
        </div>
      )}

      {/* Authoritative Databases */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-2xl font-bold text-navy">Authoritative Nigerian Legal Databases</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DATABASES.map(db => (
            <a
              key={db.name}
              href={db.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group p-6 rounded-2xl border ${db.color} hover:shadow-lg transition-all duration-300 block`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-navy text-base group-hover:text-gold transition-colors">{db.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${db.badgeColor}`}>{db.badge}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{db.description}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 group-hover:text-gold transition-colors">
                <ExternalLink className="w-3 h-3" /> {db.url.replace('https://', '').replace('http://', '')}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* AI Assistant CTA */}
      <div className="bg-navy rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
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
            onClick={() => document.dispatchEvent(new CustomEvent('open-chatbot'))}
            className="bg-gold hover:bg-gold-hover text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-gold/20 hover:-translate-y-1 whitespace-nowrap"
          >
            Start AI Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
