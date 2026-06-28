import { Mail, MapPin, Phone, Send, Clock, AlertCircle } from 'lucide-react';
import { useState, ChangeEvent, FormEvent } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call with occasional failure
    setTimeout(() => {
      // 10% chance of failure for demonstration
      if (Math.random() > 0.9) {
        setError("We couldn't send your message due to a network error. Please try again.");
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    }, 1500);
  };

  return (
    <div className="pt-10 pb-20">
      {/* Hero Section */}
      <div className="bg-navy text-white py-20 px-6 lg:px-8 mb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-gray-300 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you have a legal inquiry, need to schedule a consultation, or want to learn more about our services, our team is here to assist you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Information */}
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy mb-8">Contact Information</h2>
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg mb-1">Our Headquarters</h3>
                  <p className="text-gray-600 leading-relaxed">
                    HERITAGE & GRACE CHAMBERS,<br />
                    SUITE C20/C21, CHERUB MALL,<br />
                    New Road Bus Stop,<br />
                    KM 18 Lekki - Epe Expy,<br />
                    Lekki Penninsula II,<br />
                    Lekki 106104, Lagos
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=SUITE+C20+C21+CHERUB+MALL+KM+18+Lekki+Epe+Expressway+Lekki+Lagos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-gold hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Get Directions →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg mb-1">Ojo Office</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Suite 5/6, 2nd Floor, Plot 4,<br />
                    Alaba Int'l Market Road,<br />
                    Opposite Total Station,<br />
                    Ojo, Lagos State
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Alaba+International+Market+Road+Ojo+Lagos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-gold hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Get Directions →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg mb-1">Phone</h3>
                  <p className="text-gray-600">
                    +234 803 320 1909
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg mb-1">Email</h3>
                  <p className="text-gray-600">
                    General Inquiries: ogacosolicitors@gmail.com<br />
                    Client Support: contact@ogacosolicitors.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg mb-1">Office Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 6:00 PM EST<br />
                    Saturday: By Appointment Only
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-2xl h-64 w-full relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span className="font-medium">Interactive Map Loading...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
            <h2 className="font-serif text-3xl font-bold text-navy mb-6">Send us a Message</h2>
            
            {isSent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Message Sent!</h3>
                <p className="text-gray-600">
                  Thank you for reaching out. A member of our team will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setIsSent(false)}
                  className="mt-6 text-navy font-semibold hover:text-gold transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select 
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="consultation">Request Consultation</option>
                    <option value="case-inquiry">Existing Case Inquiry</option>
                    <option value="billing">Billing Question</option>
                    <option value="media">Media/Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy hover:bg-navy-light text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Message <Send className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
