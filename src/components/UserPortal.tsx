import React, { useState } from 'react';
import { 
  User, Booking, PartPurchase, BookingStatus 
} from '../types';
import { 
  Wrench, Cpu, Compass, User as UserIcon, Phone, MapPin, Mail, 
  Calendar, CheckCircle, Clock, Archive, ArrowRight, Sparkles, Building2, Package, Trash2
} from 'lucide-react';
import { COMMON_ISSUES, SPARE_PARTS } from '../data/laptopData';

interface UserPortalProps {
  currentUser: User | null;
  onLoginOrCreateUser: (user: User) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  bookings: Booking[];
  purchases: PartPurchase[];
  onRemoveBooking: (id: string) => void;
  onNavigate: (tab: 'home' | 'quote' | 'shop' | 'portal') => void;
  onToggleAdminMode: () => void;
}

export default function UserPortal({ 
  currentUser, onLoginOrCreateUser, onLogout, onUpdateUser, 
  bookings, purchases, onRemoveBooking, onNavigate, onToggleAdminMode 
}: UserPortalProps) {
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [authError, setAuthError] = useState('');

  // Editing profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Selected booking for detailed timeline tracking
  const [selectedBookingTimelineId, setSelectedBookingTimelineId] = useState<string | null>(null);

  // Auth Submit Handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please fill in your email and password');
      return;
    }

    if (isSignUp) {
      if (!name || !phone) {
        setAuthError('Please provide both your name and Indian phone number');
        return;
      }
      
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        email,
        phone,
        address: address || undefined,
        createdAt: new Date().toISOString()
      };
      
      onLoginOrCreateUser(newUser);
    } else {
      // Login simulation - create default user
      const userPrefix = email.split('@')[0];
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: userPrefix.charAt(0).toUpperCase() + userPrefix.slice(1),
        email,
        phone: '+91 98114 10000',
        address: 'G-14, Nehru Place Market, New Delhi',
        createdAt: new Date().toISOString()
      };
      onLoginOrCreateUser(fallbackUser);
    }
  };

  const startEditProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone);
    setEditAddress(currentUser.address || '');
    setIsEditingProfile(true);
  };

  const saveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!editName || !editPhone) {
      alert('Name and Phone values are required');
      return;
    }

    const updated: User = {
      ...currentUser,
      name: editName,
      phone: editPhone,
      address: editAddress || undefined
    };
    onUpdateUser(updated);
    setIsEditingProfile(false);
  };

  // Status mapping for visual timeline bar
  const STATUS_STEPS: { status: BookingStatus; label: string; desc: string }[] = [
    { status: 'pending', label: 'Registered', desc: 'Job card generated successfully' },
    { status: 'received', label: 'Lab Received', desc: 'Device securely loaded into lab inventory' },
    { status: 'diagnosing', label: 'Diagnosis', desc: 'Chip-level diagnostic checks under scope' },
    { status: 'repairing', label: 'In Repair', desc: 'Heatsink/Motherboard rework active' },
    { status: 'ready', label: 'Ready', desc: 'Benchtested, cleaned & approved for return' },
    { status: 'delivered', label: 'Returned', desc: 'Laptop handed over with spares warranty' },
  ];

  const getStatusIndex = (status: BookingStatus) => {
    return STATUS_STEPS.findIndex(s => s.status === status);
  };

  return (
    <div className="py-6 space-y-8 animate-fade-in" id="user-portal-view">
      
      {!currentUser ? (
        /* Login / Signup Section */
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-extrabold text-white">SKB Customer Hub</h2>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Create a secure client file to coordinate repair bookings and parts shipments.' : 'Access your existing profile and inspect active diagnostic timelines.'}
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl">
            <button
              onClick={() => { setIsSignUp(false); setAuthError(''); }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                !isSignUp ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-450'
              }`}
              id="portal-login-toggle"
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setAuthError(''); }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isSignUp ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-450'
              }`}
              id="portal-signup-toggle"
            >
              Register / New Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-medium">
                {authError}
              </div>
            )}

            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-450 uppercase font-mono tracking-wider">Your Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      id="signup-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-450 uppercase font-mono tracking-wider">WhatsApp / Indian Mobile No.</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98114 XXXXX"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      id="signup-phone-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-450 uppercase font-mono tracking-wider">Default Delivery Address (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Nehru Place, New Delhi"
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      id="signup-address-input"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase font-mono tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  id="portal-email-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-450 uppercase font-mono tracking-wider">Secure Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                id="portal-password-input"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              id="portal-auth-submit-button"
            >
              <span>{isSignUp ? 'Generate Client File' : 'Authenticate & Sync Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Dashboard Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-active-hub">
          
          {/* User Profile info widget (Cols 4) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 self-start space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xl font-extrabold rounded-2xl flex items-center justify-center select-none">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">{currentUser.name}</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Registered Customer</span>
              </div>
            </div>

            {isEditingProfile ? (
              <form onSubmit={saveProfileEdit} className="space-y-4 pt-4 border-t border-slate-800/65">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-550 block">Modifiable Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-550 block">Phone Connection</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-550 block">Shipping Location</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[11px]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-slate-805 text-slate-400 px-3 py-1.5 rounded-lg text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-800/65 text-xs font-sans">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2.5 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-505" />
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-slate-300">
                    <Phone className="h-4 w-4 text-slate-505" />
                    <span>{currentUser.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2.5 text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-550 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{currentUser.address || 'No default shipping address specified.'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={startEditProfile}
                    className="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-300 py-2 border border-slate-800 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Modify Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] transition-colors border border-rose-500/20 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>

                {/* sandbox admin mode toggle */}
                <div className="pt-2 border-t border-dashed border-slate-800">
                  <button
                    onClick={onToggleAdminMode}
                    className={`w-full py-2 px-3 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center justify-center space-x-1 justify-content-center ${
                      currentUser.isAdmin
                        ? 'bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border-rose-500/20 shadow-lg'
                        : 'bg-sky-500/5 hover:bg-sky-500/15 text-sky-400 border-sky-500/10'
                    }`}
                    id="portal-sandbox-admin-btn"
                  >
                    <span>{currentUser.isAdmin ? '🛡️ Deactivate Sandbox Admin' : '🛡️ Activate Sandbox Admin'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Micro store hours details */}
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-[11px] space-y-2.5">
              <div className="flex items-center space-x-1 text-sky-400 font-semibold font-mono text-[10px] tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Diagnostic Center Location</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans">
                Laptop repairs and diagnostics occur at our tech facility inside Nehru Place, New Delhi. Drop off your device or choose Home Express Courier logic!
              </p>
            </div>
          </div>

          {/* Active Repair list and purchases tabs (Cols 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Sector 1: Active Laptop Repairs */}
            <div className="space-y-4" id="repairs-portal-section">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-sky-400" />
                  <h2 className="text-xl font-bold text-white leading-tight">Your Laptop Repairs History</h2>
                </div>
                <span className="bg-slate-950 text-slate-400 text-[10px] font-mono font-semibold px-2.5 py-1 rounded border border-slate-800">
                  {bookings.length} Orders
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-3 font-sans">
                  <Wrench className="h-10 w-10 text-slate-800 mx-auto" />
                  <p className="text-xs text-slate-400">No active laptop repair slot found under your client profile.</p>
                  <button
                    onClick={() => onNavigate('quote')}
                    className="inline-flex items-center space-x-1 bg-sky-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-sky-400 cursor-pointer"
                  >
                    <span>Fetch Online Quote &amp; Book Repair</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(book => {
                    const isExpanded = selectedBookingTimelineId === book.id;
                    const activeStepIdx = getStatusIndex(book.status);
                    
                    return (
                      <div 
                        key={book.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all font-sans"
                        id={`user-booking-card-${book.id}`}
                      >
                        {/* Summary metadata headers */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-100 text-sm">{book.brand} - {book.model}</span>
                              <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-semibold">
                                {book.id}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Booked on: {new Date(book.createdAt).toLocaleDateString()} • Code: {book.serialNumber || 'N/A'}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-start">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block leading-none uppercase">Est. Cost</span>
                              <span className="font-bold text-slate-200 mt-1 block font-mono">₹{book.quoteAmount}</span>
                            </div>
                            <div className="w-[1px] h-6 bg-slate-800" />
                            <div>
                              <span className="text-[10px] text-slate-500 block leading-none uppercase text-right">Progress</span>
                              <span className={`inline-block mt-1 text-[11px] font-bold uppercase tracking-wider ${
                                book.status === 'delivered' 
                                  ? 'text-emerald-400' 
                                  : book.status === 'ready' 
                                    ? 'text-sky-400 animate-pulse' 
                                    : 'text-amber-400'
                              }`}>
                                {STATUS_STEPS[activeStepIdx]?.label || book.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mid Details section */}
                        <div className="py-3 flex flex-wrap gap-4 text-xs">
                          <div>
                            <span className="text-slate-550 block">Logistics Preference:</span>
                            <span className="font-medium text-slate-350 mt-0.5 block">
                              {book.serviceType === 'home_pickup' ? '🛵 Home Pick-up & Delivery' : '🏢 Nehru Place Walk-in'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-550 block">Scheduled Date:</span>
                            <span className="font-medium text-slate-350 mt-0.5 block flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-sky-400" />
                              <span>{book.scheduledDate}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-550 block">Fittings Faults Selected:</span>
                            <span className="font-medium text-slate-350 mt-0.5 block capitalize">
                              {book.issues.map(id => COMMON_ISSUES.find(i => i.id === id)?.name || id).join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Action parameters */}
                        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedBookingTimelineId(isExpanded ? null : book.id)}
                            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Collapse Diagnostics' : 'Inspect Live Micro-Timeline'}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          {book.status === 'pending' && (
                            <button
                              onClick={() => {
                                if(confirm('Cancel this laptop repair reservation?')) {
                                  onRemoveBooking(book.id);
                                }
                              }}
                              className="text-xs text-rose-500 hover:text-rose-450 font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Delete booking reservation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Cancel Booking</span>
                            </button>
                          )}
                        </div>

                        {/* Live expanded diagnostic progress timeline track */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-6 animate-fade-in">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-sky-400" />
                              <span className="text-xs font-semibold text-slate-300 font-mono tracking-wide">CHIP-LEVEL INVENTORY BENCHMARK TIMELINE</span>
                            </div>

                            <div className="relative pl-6 space-y-6">
                              {/* Left trace vertical pipe */}
                              <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-800" />

                              {STATUS_STEPS.map((step, idx) => {
                                const isDone = idx <= activeStepIdx;
                                const isCurrent = idx === activeStepIdx;
                                return (
                                  <div key={step.status} className="relative flex items-start space-x-3.5 text-xs text-left" id={`timeline-node-${step.status}`}>
                                    {/* bullet circle */}
                                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full z-10 border mt-1 shrink-0 ${
                                      isCurrent 
                                        ? 'bg-sky-400 border-sky-400 animate-ping' 
                                        : isDone 
                                          ? 'bg-emerald-500 border-emerald-500' 
                                          : 'bg-slate-950 border-slate-800'
                                    }`} />
                                    
                                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full z-20 border mt-1 shrink-0 ${
                                      isCurrent 
                                        ? 'bg-sky-400 border-sky-400' 
                                        : isDone 
                                          ? 'bg-emerald-500 border-emerald-500' 
                                          : 'bg-slate-950 border-slate-800'
                                    }`} />

                                    <div className="space-y-0.5">
                                      <div className={`font-bold uppercase tracking-wider text-[10px] ${
                                        isCurrent 
                                          ? 'text-sky-400 font-extrabold' 
                                          : isDone 
                                            ? 'text-slate-300' 
                                            : 'text-slate-600'
                                      }`}>
                                        {step.label} {isCurrent && ' (Active Stage)'}
                                      </div>
                                      <div className={`text-[11px] ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {step.desc}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sector 2: Spare Parts purchases history */}
            <div className="space-y-4" id="purchases-portal-section">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-sky-400" />
                  <h2 className="text-xl font-bold text-white leading-tight">Authentic Spares Purchases History</h2>
                </div>
                <span className="bg-slate-950 text-slate-400 text-[10px] font-mono font-semibold px-2.5 py-1 rounded border border-slate-800">
                  {purchases.length} Items Shipped
                </span>
              </div>

              {purchases.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-3 font-sans">
                  <Archive className="h-10 w-10 text-slate-800 mx-auto" />
                  <p className="text-xs text-slate-400">You have no recorded separate spare parts purchases.</p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="inline-flex items-center space-x-1 bg-sky-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-sky-400 cursor-pointer"
                  >
                    <span>Browse Genuine Adapters &amp; Batteries</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map(pur => (
                    <div 
                      key={pur.id}
                      className="bg-slate-905 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs"
                      id={`user-parts-purchase-card-${pur.id}`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-200">{pur.partName}</div>
                        <div className="text-[10px] text-slate-550 font-mono">
                          ID: {pur.id} • Order Date: {new Date(pur.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-sm">
                          Shipping Address: {pur.shippingAddress}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/60 pt-2.5 sm:pt-0 shrink-0">
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px]">Qty x Price</span>
                          <span className="font-semibold text-slate-300 mt-0.5 block font-mono">
                            {pur.quantity} x ₹{pur.price} = ₹{pur.totalAmount}
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-slate-800/80 rounded px-2.5 py-1 text-center font-mono text-[10px] tracking-wide text-cyan-400 uppercase">
                          🛵 Processing
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
