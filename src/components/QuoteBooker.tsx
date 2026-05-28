import React, { useState, useEffect } from 'react';
import { 
  Wrench, Shield, CheckCircle2, ChevronRight, AlertCircle, 
  Calendar, ArrowRight, CornerDownRight, Sparkles, Building2, Truck, Eye, Key, Mail, Phone, User as UserIcon
} from 'lucide-react';
import { User, Booking, LaptopIssue, BookingStatus } from '../types';
import { BRANDS, MODELS_BY_BRAND, COMMON_ISSUES, SKB_INFO } from '../data/laptopData';

interface QuoteBookerProps {
  currentUser: User | null;
  onLoginOrCreateUser: (user: User) => void;
  onAddBooking: (booking: Booking) => void;
  onNavigate: (tab: 'home' | 'quote' | 'shop' | 'portal') => void;
}

export default function QuoteBooker({ currentUser, onLoginOrCreateUser, onAddBooking, onNavigate }: QuoteBookerProps) {
  // Wizard States
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('');
  
  // Issues Selection
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [serviceType, setServiceType] = useState<'home_pickup' | 'store_visit'>('store_visit');
  const [scheduledDate, setScheduledDate] = useState<string>('');

  // Authentication Panel inside Booker (if not logged in)
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authError, setAuthError] = useState('');

  // Booking result success modal
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Set default date to tomorrow and check for drafts
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setScheduledDate(`${yyyy}-${mm}-${dd}`);

    try {
      const draftBrand = localStorage.getItem('skb_draft_brand');
      const draftIssue = localStorage.getItem('skb_draft_issue');
      if (draftBrand) {
        setSelectedBrand(draftBrand);
        localStorage.removeItem('skb_draft_brand');
      }
      if (draftIssue) {
        setSelectedIssueIds([draftIssue]);
        localStorage.removeItem('skb_draft_issue');
      }
    } catch (e) {
      console.error('Failed to load draft selections: ', e);
    }
  }, []);

  // Set first model when brand changes
  useEffect(() => {
    if (selectedBrand && MODELS_BY_BRAND[selectedBrand]) {
      setSelectedModel(MODELS_BY_BRAND[selectedBrand][0]);
    } else {
      setSelectedModel('');
    }
  }, [selectedBrand]);

  const toggleIssue = (issueId: string) => {
    setSelectedIssueIds(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  // Price calculation
  const getPricingMetrics = () => {
    const chosenIssues = COMMON_ISSUES.filter(issue => selectedIssueIds.includes(issue.id));
    const rawSum = chosenIssues.reduce((sum, issue) => sum + issue.baseRepairCost, 0);
    
    // Combo discount: 15% off starting from 2 or more problems
    const discount = selectedIssueIds.length >= 2 ? Math.round(rawSum * 0.15) : 0;
    const diagnosticsFee = 0; // Free diagnostics at SKB Enterprises
    const subtotal = rawSum - discount + diagnosticsFee;
    const gst = Math.round(subtotal * 0.18); // 18% GST in India
    const total = subtotal + gst;

    return {
      chosenIssues,
      rawSum,
      discount,
      diagnosticsFee,
      subtotal,
      gst,
      total,
    };
  };

  const { chosenIssues, rawSum, discount, diagnosticsFee, gst, total } = getPricingMetrics();

  // Handle Authentication submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Please fill in your login credentials');
      return;
    }

    if (isSignUpMode) {
      if (!authName || !authPhone) {
        setAuthError('Please provide your name and Indian phone number');
        return;
      }
      
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: authName,
        email: authEmail,
        phone: authPhone,
        address: authAddress || undefined,
        createdAt: new Date().toISOString(),
      };
      onLoginOrCreateUser(newUser);
    } else {
      // Login mode - generic trigger
      const fallbackName = authEmail.split('@')[0];
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
        email: authEmail,
        phone: '+91 99999 12345',
        address: 'Nehru Place, New Delhi',
        createdAt: new Date().toISOString(),
      };
      onLoginOrCreateUser(fallbackUser);
    }
  };

  // Handle Final Booking Submission
  const handleConfirmBooking = () => {
    if (!currentUser) return;
    if (!selectedBrand) return;
    if (selectedIssueIds.length === 0) return;

    const brandName = selectedBrand;
    const finalModelName = selectedModel === 'other' || !selectedModel ? (customModel || 'Generic') : selectedModel;

    const bookingId = `SKB-REP-${Date.now().toString().slice(-6)}`;
    
    const newBooking: Booking = {
      id: bookingId,
      userId: currentUser.id,
      brand: brandName,
      model: finalModelName,
      serialNumber: serialNumber || undefined,
      issues: selectedIssueIds,
      additionalNotes: notes || undefined,
      quoteAmount: total,
      status: 'pending' as BookingStatus,
      scheduledDate,
      serviceType,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    onAddBooking(newBooking);
    setCreatedBooking(newBooking);
  };

  // Reset form
  const handleResetForm = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setCustomModel('');
    setSelectedIssueIds([]);
    setSerialNumber('');
    setNotes('');
    setCreatedBooking(null);
  };

  return (
    <div className="py-6 space-y-8 animate-fade-in" id="quote-booker-view">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Instant Price Estimator &amp; Repair Booking
        </h1>
        <p className="text-sm text-slate-400">
          Select your laptop details, click individual faults to dynamically see Nehru Place wholesale spare repair figures, and book repair queues instantly.
        </p>
      </div>

      {createdBooking ? (
        /* Success Screen */
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded">BOOKING CONFIRMED</span>
            <h2 className="text-2xl font-bold text-white mt-1">Your Laptop Repair Slot is Reserved!</h2>
            <p className="text-sm text-slate-300">
              Your unique order identifier is <strong className="text-sky-300 font-mono">{createdBooking.id}</strong>.
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-5 text-left border border-slate-800 space-y-3 font-sans">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 block">DEVICE</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{createdBooking.brand} - {createdBooking.model}</span>
              </div>
              <div>
                <span className="text-slate-500 block">SERVICE OPTION</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {createdBooking.serviceType === 'home_pickup' ? '🛵 Home Pick-up & Drop' : '🏢 Nehru Place Office Visit'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">SCHEDULED DATE</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{createdBooking.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ESTIMATED QUOTE</span>
                <span className="font-bold text-sky-400 mt-0.5 block text-sm font-mono">₹{createdBooking.quoteAmount}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              * SKB Enterprises enforces a strict No-Fix-No-Fee policy. Dynamic diagnostics are completely free of cost.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => {
                onNavigate('portal');
                setCreatedBooking(null);
              }}
              className="flex-1 bg-sky-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-sky-400 transition-colors cursor-pointer text-sm"
            >
              Go to Repair History Portal
            </button>
            <button
              onClick={handleResetForm}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer text-sm"
            >
              Book Another Repair
            </button>
          </div>
        </div>
      ) : (
        /* Booking wizard and Calculator grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side - Wizard (Cols 7) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Step 1: Laptop Identity */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">1</span>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">Select Laptop Brand &amp; Model</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Device Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500 transition-all font-sans"
                    id="brand-selector"
                  >
                    <option value="">-- Choose Brand --</option>
                    {BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Laptop Model / Series</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedBrand}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500 transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                    id="model-selector"
                  >
                    <option value="">-- Select Model --</option>
                    {selectedBrand && MODELS_BY_BRAND[selectedBrand]?.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                    <option value="other">My Model is not listed</option>
                  </select>
                </div>
              </div>

              {selectedModel === 'other' && (
                <div className="animate-fade-in bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Type Laptop Model Series Name</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. Acer Swift Go 14"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    id="custom-model-input"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Select fault criteria */}
            <div className="space-y-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">2</span>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">What Laptop Issues are you Facing?</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="issues-list-container">
                {COMMON_ISSUES.map(issue => {
                  const isChecked = selectedIssueIds.includes(issue.id);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => toggleIssue(issue.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left flex items-start space-x-3 select-none ${
                        isChecked 
                          ? 'bg-sky-500/5 border-sky-500/50 shadow-md shadow-sky-500/5' 
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700/80'
                      }`}
                      id={`issue-card-${issue.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // toggled via parent div click
                        className="mt-1 h-4 w-4 rounded border-slate-800 text-sky-500 bg-slate-950 focus:ring-0 shrink-0 pointer-events-none"
                      />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200 leading-tight">{issue.name}</div>
                        <div className="text-[10px] text-slate-500 leading-normal line-clamp-2">{issue.description}</div>
                        <div className="text-[10px] text-sky-400 font-mono tracking-wide mt-2">
                          Est: ₹{issue.baseRepairCost} • {issue.estimatedHours}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Logistics details & Booking Schedule */}
            <div className="space-y-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">3</span>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">Scheduling &amp; Logistics Option</h3>
              </div>

              {/* Service Logistics Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setServiceType('store_visit')}
                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 select-none transition-all ${
                    serviceType === 'store_visit'
                      ? 'bg-sky-500/5 border-sky-500/50 text-sky-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                  id="logistics-type-store"
                >
                  <Building2 className="h-6 w-6 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">Visit Nehru Place Store</span>
                  <span className="text-[10px] text-slate-500 font-sans">Self submission &amp; same-day tests</span>
                </div>

                <div
                  onClick={() => setServiceType('home_pickup')}
                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 select-none transition-all ${
                    serviceType === 'home_pickup'
                      ? 'bg-sky-500/5 border-sky-500/50 text-sky-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                  id="logistics-type-pickup"
                >
                  <Truck className="h-6 w-6 text-yellow-400" />
                  <span className="text-xs font-bold text-slate-200">Home Pick &amp; Drop</span>
                  <span className="text-[10px] text-slate-500 font-sans">Doorstep dispatcher inside Delhi / NCR</span>
                </div>
              </div>

              {/* Appointment Scheduling parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Preferred Booking Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-sky-500 transition-all font-mono"
                    id="scheduling-date-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Device Serial No. (Optional)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Locate under laptop chassis"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-all font-mono"
                    id="serial-number-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Describe the Fault / Extra Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Liquid split happened near spacebar, screen flickers only when moving hinges..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition-all font-sans"
                  id="notes-textarea"
                />
              </div>

            </div>

          </div>

          {/* Checkout Quote tally and Login Gate block (Cols 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Instant Online Tally Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 relative overflow-hidden" id="quoting-summary-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-2xl rounded-full" />
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">QUOTE ESTIMATE BREAKDOWN</span>
                <span className="text-[10px] font-mono text-cyan-400">INR (₹)</span>
              </div>

              {/* If no inputs selected, output warning instructions */}
              {selectedIssueIds.length === 0 ? (
                <div className="py-8 text-center text-slate-500 space-y-3 font-sans">
                  <Wrench className="h-10 w-10 text-slate-700 mx-auto" strokeWidth={1.5} />
                  <p className="text-xs leading-normal px-4">
                    Please specify a couple of laptop faults or upgrades. The instant pricing engine will tally itemized costings here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in font-sans">
                  {/* Selected issues list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {chosenIssues.map(issue => (
                      <div key={issue.id} className="flex justify-between items-start text-xs text-slate-200">
                        <div className="flex items-start space-x-1.5 max-w-[70%]">
                          <CornerDownRight className="h-3 w-3 text-sky-400 shrink-0 mt-0.5" />
                          <span>{issue.name}</span>
                        </div>
                        <span className="font-semibold text-slate-100 font-mono shrink-0">₹{issue.baseRepairCost}</span>
                      </div>
                    ))}
                  </div>

                  {/* Multi issue rebate */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-400 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/20">
                      <span>🎉 Multi-Issue 15% Combo Rebate</span>
                      <span className="font-semibold font-mono">-₹{discount}</span>
                    </div>
                  )}

                  {/* Pricing logic block */}
                  <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Interactive diagnostics fee</span>
                      <span className="font-semibold text-emerald-400">FREE</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Services Subtotal</span>
                      <span className="font-semibold text-slate-300 font-mono">₹{rawSum - discount}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST Regulatory (18%)</span>
                      <span className="font-semibold text-slate-300 font-mono">₹{gst}</span>
                    </div>
                    
                    {/* Grand Total */}
                    <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-3">
                      <span>Instant Quoted Total</span>
                      <span className="text-xl text-sky-400 font-mono">₹{total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Nehru Place guarantees */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
                <Shield className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-400 leading-normal">
                  Our diagnostics are backed by Nehru Place wholesale parts benchmarks. All parts used (adaptors, batteries, motherboards) include an authentic 90-day parts warranty.
                </div>
              </div>
            </div>

            {/* Step 4: Authentication Gate (Signin / Sign-up) OR Confirm Button */}
            {!currentUser ? (
              /* If customer is not authenticated, show Auth Panel */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fade-in" id="auth-gate-panel">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-slate-200">Signup or Login is Required</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    You must proceed to register your contact parameters first to save, coordinate, and track this repair booking history. 
                  </p>
                </div>

                {/* Inline signup-toggle tabs */}
                <div className="bg-slate-950 p-1 rounded-xl flex">
                  <button
                    onClick={() => { setIsSignUpMode(false); setAuthError(''); }}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      !isSignUpMode ? 'bg-slate-800 text-white' : 'text-slate-500'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setIsSignUpMode(true); setAuthError(''); }}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSignUpMode ? 'bg-slate-800 text-white' : 'text-slate-500'
                    }`}
                  >
                    New Sign-up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs font-medium">
                      {authError}
                    </div>
                  )}

                  {isSignUpMode && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">WhatsApp / Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="e.g. +91 9811X XXXXX"
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Delivery Address (Optional)</label>
                        <input
                          type="text"
                          value={authAddress}
                          onChange={(e) => setAuthAddress(e.target.value)}
                          placeholder="e.g. Sector-15, Rohini, New Delhi"
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        id="auth-gate-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        id="auth-gate-password-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs hover:from-sky-450 hover:to-sky-500 transition-colors cursor-pointer mt-2"
                    id="auth-gate-submit-button"
                  >
                    {isSignUpMode ? 'Register & Keep Quote Selections' : 'Verify & Continue Booking'}
                  </button>
                </form>
              </div>
            ) : (
              /* If customer is authenticated, allow immediate completion button */
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedBrand || selectedIssueIds.length === 0}
                className="w-full bg-sky-500 text-slate-950 font-extrabold py-4 rounded-xl flex items-center justify-center space-x-2 text-sm uppercase tracking-wide hover:bg-sky-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/10"
                id="booking-confirm-button"
              >
                <Wrench className="h-5 w-5" />
                <span>Submit Repair Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
