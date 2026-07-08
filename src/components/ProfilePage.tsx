'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  Type,
  CheckCircle2,
  ArrowLeft,
  Bell,
  Save,
  Loader2
} from 'lucide-react';
import { usePreferences, Theme, FontScale } from '@/src/contexts/PreferencesContext';

interface ProfilePageProps {
  user: any;
  onNavigate: (page: string) => void;
  onUpdateUser?: (data: any) => void;
}

export default function ProfilePage({ user, onNavigate, onUpdateUser }: ProfilePageProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'preferences' ? 'preferences' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>(initialTab);
  const { theme, setTheme, fontScale, setFontScale } = usePreferences();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || ''
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'preferences') setActiveTab('preferences');
  }, [searchParams]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateUser?.({ ...user, ...updated });
        setSaveMessage('Profile updated successfully.');
      } else {
        setSaveMessage('Could not update profile. Please try again.');
      }
    } catch {
      setSaveMessage('Network error. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const fontOptions: { value: FontScale; label: string }[] = [
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' }
  ];

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate(user?.appRole === 'Admin' ? 'admin-dashboard' : user?.appRole === 'Staff' ? 'staff-portal' : 'dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy dark:hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {user?.appRole === 'Admin' ? 'Management' : user?.appRole === 'Staff' ? 'Staff Portal' : 'Dashboard'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 text-center transition-colors">
              <div className="w-24 h-24 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-4 border-gold/30">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : initials}
              </div>
              <h2 className="text-xl font-bold text-navy dark:text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider rounded-full">
                <Shield className="w-3 h-3" /> {user?.appRole}
              </span>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4" /> Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Settings & Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-2">
            {saveMessage && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${saveMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                <CheckCircle2 className="w-4 h-4" /> {saveMessage}
              </div>
            )}

            {activeTab === 'profile' ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
                <h3 className="font-serif text-2xl font-bold text-navy dark:text-white mb-2">Profile Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your personal details and contact information.</p>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={form.firstName}
                          onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={form.lastName}
                          onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                      <input
                        value={form.companyName}
                        onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-gray-400 dark:text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-navy dark:bg-gold dark:text-navy text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-navy-light dark:hover:bg-gold-hover transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
                <h3 className="font-serif text-2xl font-bold text-navy dark:text-white mb-2">Settings & Preferences</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Customize how the portal looks and feels.</p>

                {/* Theme Toggle */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Appearance</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        theme === 'light'
                          ? 'border-navy bg-navy/5 dark:bg-navy/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${theme === 'light' ? 'text-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Light Mode</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Classic firm branding</p>
                      </div>
                      {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-navy dark:text-gold ml-auto" />}
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-navy dark:border-gold bg-navy/5 dark:bg-slate-800'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${theme === 'dark' ? 'text-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>Dark Mode</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes at night</p>
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-navy dark:text-gold ml-auto" />}
                    </button>
                  </div>
                </div>

                {/* Font Scale */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <span className="flex items-center gap-2"><Type className="w-4 h-4" /> Font Size</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {fontOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFontScale(opt.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          fontScale === opt.value
                            ? 'border-navy dark:border-gold bg-navy text-white dark:bg-gold dark:text-navy'
                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Adjusts the text size across the entire portal.</p>
                </div>

                {/* Notification Preference */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Notifications</label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-navy dark:text-white text-sm">Email Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates about appointments and documents</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Enabled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
