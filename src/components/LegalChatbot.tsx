import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Scale, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function LegalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I am your AI Legal Assistant for OROELU GODWIN AGIDI & CO. I can provide information on Nigerian law and general legal guidance. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for the chat
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history })
      });

      if (!res.ok) throw new Error("Chat Endpoint failed");
      const data = await res.json();
      
      const modelMessage: Message = {
        role: 'model',
        text: data.text || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMessage: Message = {
        role: 'model',
        text: "I apologize, but I'm having trouble connecting right now. Please try again later or contact our office directly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close legal assistant chat" : "Open legal assistant chat"}
        aria-expanded={isOpen}
        aria-controls="legal-chatbot-window"
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 outline-none ${
          isOpen ? 'bg-gold rotate-90' : 'bg-navy hover:bg-navy-light'
        }`}
      >
        {isOpen ? <X className="text-white w-6 h-6" aria-hidden="true" /> : <MessageSquare className="text-white w-6 h-6" aria-hidden="true" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gold"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          id="legal-chatbot-window"
          role="dialog"
          aria-label="Legal AI Assistant Chat"
          className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="bg-navy p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-gold" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm">Legal AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-white transition-colors p-1 focus-visible:ring-2 focus-visible:ring-gold rounded outline-none"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 p-2 px-4 border-b border-yellow-100 flex items-start gap-2" role="note">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[10px] text-yellow-800 leading-tight">
              Informational only. No attorney-client relationship is formed. Consult our attorneys for formal advice.
            </p>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-gold text-white' : 'bg-navy text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" aria-hidden="true" /> : <Bot className="w-4 h-4" aria-hidden="true" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gold text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:text-navy prose-a:text-gold">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <p className={`text-[9px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className="sr-only">Sent at </span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" aria-busy="true">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-gold animate-spin" aria-hidden="true" />
                    <span className="text-xs text-gray-400 font-medium italic">Consulting legal database...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <label htmlFor="chat-input" className="sr-only">Type your message</label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Nigerian law..."
                className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-navy outline-none ${
                  input.trim() && !isLoading ? 'bg-navy text-white hover:bg-navy-light' : 'text-gray-300'
                }`}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-[9px] text-center text-gray-400 mt-2">
              Powered by Gemini 2.5 • OROELU GODWIN AGIDI & CO
            </p>
          </div>
        </div>
      )}
    </>
  );
}
