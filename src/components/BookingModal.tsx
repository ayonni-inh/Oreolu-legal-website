import { X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface BookingModalProps {
  service: any;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export default function BookingModal({ service, onClose, isLoggedIn, onLoginRequired }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{trackingNumber: string, invoiceId: string} | null>(null);

  // Check login status immediately
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-navy">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy mb-4">Account Required</h3>
          <p className="text-gray-600 mb-8">
            Please log in or register to book a service and process secure payments.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { onClose(); onLoginRequired(); }}
              className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Log In / Register
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-navy font-medium py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    setIsProcessing(true);
    setError(null);
    // Simulate payment gateway delay
    setTimeout(() => {
      // 10% chance of payment failure for demonstration
      if (Math.random() > 0.9) {
        setError("Payment processing failed. Please check your card details or try a different payment method.");
        setIsProcessing(false);
      } else {
        const trackingNumber = 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        setBookingDetails({ trackingNumber, invoiceId });
        setIsProcessing(false);
        setStep(3);
      }
    }, 2000);
  };

  const dates = [
    { day: 'Mon', date: 'Oct 12', slots: 4 },
    { day: 'Tue', date: 'Oct 13', slots: 2 },
    { day: 'Wed', date: 'Oct 14', slots: 5 },
    { day: 'Thu', date: 'Oct 15', slots: 1 },
    { day: 'Fri', date: 'Oct 16', slots: 3 },
    { day: 'Sat', date: 'Oct 17', slots: 0 },
  ];
  const times = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '03:30 PM', '04:30 PM'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-navy text-white p-6 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold">{service.title}</h2>
            <p className="text-gold font-sans text-sm mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {service.duration} • {service.price}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors relative z-10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-navy mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <CalendarIcon className="w-5 h-5 text-gold" /> Select Date & Time
              </h3>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-navy mb-4 uppercase tracking-wide">Available Dates</label>
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
                  {dates.map((item) => (
                    <button
                      key={item.date}
                      disabled={item.slots === 0}
                      onClick={() => {
                        setSelectedDate(item.date);
                        setSelectedTime(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[100px] p-4 rounded-xl border transition-all snap-center ${
                        selectedDate === item.date 
                          ? 'border-navy bg-navy text-white shadow-lg scale-105' 
                          : item.slots === 0 
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gold hover:shadow-md text-gray-600 bg-white'
                      }`}
                    >
                      <span className={`text-xs font-medium mb-1 ${selectedDate === item.date ? 'text-gold' : 'text-gray-400'}`}>{item.day}</span>
                      <span className="text-lg font-bold mb-1">{item.date.split(' ')[1]}</span>
                      <span className="text-xs">{item.date.split(' ')[0]}</span>
                      <span className={`text-[10px] mt-2 px-2 py-0.5 rounded-full ${
                        selectedDate === item.date ? 'bg-white/20 text-white' : item.slots === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.slots > 0 ? `${item.slots} slots` : 'Full'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-sm font-bold text-navy mb-4 uppercase tracking-wide">
                    Available Times for <span className="text-gold">{selectedDate}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {times.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          selectedTime === time 
                            ? 'border-gold bg-gold text-white shadow-md' 
                            : 'border-gray-200 hover:border-navy hover:text-navy text-gray-600 bg-white'
                        }`}
                      >
                        <Clock className={`w-4 h-4 ${selectedTime === time ? 'text-white' : 'text-gray-400'}`} />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
                <button 
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                  className="bg-navy hover:bg-navy-light disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg disabled:shadow-none"
                >
                  Continue to Payment <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-lg font-semibold text-navy mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold" /> Secure Payment
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-navy">{service.title}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Appointment</span>
                  <span className="font-semibold text-navy">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Due</span>
                  <span className="font-bold text-2xl text-navy">{service.price}</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Mock Payment Form */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input type="text" placeholder="•••• •••• •••• ••••" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input type="text" placeholder="•••" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-navy font-medium px-4 py-2"
                >
                  Back
                </button>
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-gold hover:bg-gold-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 min-w-[160px] justify-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    `Pay ${service.price}`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-navy mb-4">Booking Confirmed</h3>
              <p className="text-gray-600 font-sans max-w-md mx-auto mb-8">
                Your payment of {service.price} was successful. A confirmation email has been sent.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8 border border-gray-200">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Tracking Number</span>
                  <span className="font-mono font-bold text-navy">{bookingDetails?.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Invoice ID</span>
                  <span className="font-mono font-bold text-navy">{bookingDetails?.invoiceId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Appointment</span>
                  <span className="font-semibold text-navy text-right">{selectedDate}<br/>{selectedTime}</span>
                </div>
              </div>

              <div>
                <button 
                  onClick={onClose}
                  className="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go to Client Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
