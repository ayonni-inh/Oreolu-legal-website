import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Shield, TrendingUp, Loader2 } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  type: 'action' | 'recommendation' | 'risk';
  icon: any;
}

export default function AIInsights({ userData }: { userData: any }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData })
        });
        
        if (!res.ok) throw new Error("AI Endpoint failed");
        const data = await res.json();
        
        const mappedInsights = data.map((item: any) => ({
          ...item,
          icon: item.type === 'risk' ? Shield : item.type === 'action' ? Lightbulb : TrendingUp
        }));

        setInsights(mappedInsights);
      } catch (error) {
        console.error("AI Insights Error:", error);
        // Fallback insights
        setInsights([
          {
            title: "Compliance Review",
            description: "Schedule an AML/CTF audit to ensure full regulatory alignment.",
            type: 'risk',
            icon: Shield
          },
          {
            title: "Trademark Expansion",
            description: "Consider registering 'AcmeFlow' in additional jurisdictions.",
            type: 'recommendation',
            icon: TrendingUp
          },
          {
            title: "Document Signature",
            description: "The Articles of Incorporation draft requires your immediate review.",
            type: 'action',
            icon: Lightbulb
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [userData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-navy/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          <h3 className="font-serif text-lg font-bold text-navy">AI Strategic Insights</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by Gemini</span>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-sm text-gray-500 italic">Analyzing your legal landscape...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="group p-4 rounded-xl border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all bg-gray-50/30">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    insight.type === 'risk' ? 'bg-red-50 text-red-600' : 
                    insight.type === 'action' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    <insight.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-navy group-hover:text-gold transition-colors">{insight.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
                <button className="w-full mt-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-navy hover:text-gold transition-colors pt-3 border-t border-gray-100">
                  Take Action <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
