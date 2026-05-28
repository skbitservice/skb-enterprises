import React, { useState, useEffect } from 'react';
import { 
  Wrench, Cpu, Shield, Clock, MapPin, Phone, Mail, 
  ArrowRight, CheckCircle2, ChevronRight, Sparkles, MessageSquare 
} from 'lucide-react';
import { SKB_INFO, SPARE_PARTS, BRANDS, COMMON_ISSUES } from '../data/laptopData';

interface HomeDashboardProps {
  onNavigate: (tab: 'home' | 'quote' | 'shop' | 'portal') => void;
}

export default function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [heroBrand, setHeroBrand] = useState(BRANDS[0] || 'HP');
  const [heroIssue, setHeroIssue] = useState(COMMON_ISSUES[0]?.id || 'screen_damage');

  useEffect(() => {
    // Determine if Nehru Place store is open:
    // IST is UTC + 5.5 hours. Let's calculate from current UTC time.
    const nowUtc = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(nowUtc.getTime() + istOffset);
    
    const day = istTime.getUTCDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Check if Sunday (Day 0)
    if (day === 0) {
      setIsOpen(false);
    } else {
      // 10:30 AM to 7:30 PM (Operating timing: 10:30 to 19:30 IST)
      // 10:30 = 630 mins
      // 19:30 = 1170 mins
      if (totalMinutes >= 630 && totalMinutes <= 1170) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, []);

  const handleCalculateEstimate = () => {
    try {
      localStorage.setItem('skb_draft_brand', heroBrand);
      localStorage.setItem('skb_draft_issue', heroIssue);
    } catch (e) {
      console.error('Failed to draft brand estimate: ', e);
    }
    onNavigate('quote');
  };

  const featuredParts = SPARE_PARTS.slice(0, 3);

  return (
    <div className="space-y-12 py-8 animate-fade-in" id="home-dashboard-view">
      
      {/* Prime Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="bento-grid-section">
        
        {/* Card 1: Hero & Active Quote Calculator (Double Span Width & Height) */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-600 to-sky-700 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden text-white shadow-xl shadow-blue-900/10 min-h-[420px]">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
              <span>Interactive Estimate Engine</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              GET AN INSTANT<br />REPAIR QUOTE
            </h2>
            
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Select your laptop brand and failure type to calculate a component-specific diagnostic and replacement cost calibrated with wholesale Nehru Place spare benchmarks.
            </p>

            {/* Micro Quick Form */}
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/25">
                  <label className="text-[10px] uppercase font-bold text-blue-200 block mb-1">Device Brand</label>
                  <select 
                    value={heroBrand}
                    onChange={(e) => setHeroBrand(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold text-white outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/25">
                  <label className="text-[10px] uppercase font-bold text-blue-200 block mb-1">Issue Type</label>
                  <select 
                    value={heroIssue}
                    onChange={(e) => setHeroIssue(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold text-white outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    {COMMON_ISSUES.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {issue.name.split(' (')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleCalculateEstimate}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-150 flex items-center justify-center space-x-2 border border-slate-800"
              >
                <span>Calculate My Estimate</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Abstract background graphics */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Card 2: Genuine parts Tall Card (Double Span Height) */}
        <div className="col-span-1 lg:col-span-1 lg:row-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-lg">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Cpu className="h-4.5 w-4.5 text-sky-400" />
                <span>Genuine Spares</span>
              </span>
              <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/25 font-bold uppercase tracking-wider">
                In Stock
              </span>
            </h3>
            
            <div className="space-y-2.5">
              <div 
                onClick={() => { localStorage.setItem('skb_parts_filter', 'battery'); onNavigate('shop'); }}
                className="bg-slate-800/40 p-3 rounded-xl flex items-center gap-3 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">🔋</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Batteries</p>
                  <p className="text-[10px] text-slate-400 group-hover:underline">Shop 120+ Models</p>
                </div>
              </div>

              <div 
                onClick={() => { localStorage.setItem('skb_parts_filter', 'adapter'); onNavigate('shop'); }}
                className="bg-slate-800/40 p-3 rounded-xl flex items-center gap-3 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">🔌</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Adapters</p>
                  <p className="text-[10px] text-slate-400 group-hover:underline">Original Chargers</p>
                </div>
              </div>

              <div 
                onClick={() => { localStorage.setItem('skb_parts_filter', 'motherboard'); onNavigate('shop'); }}
                className="bg-slate-800/40 p-3 rounded-xl flex items-center gap-3 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">💾</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Motherboards</p>
                  <p className="text-[10px] text-slate-400 group-hover:underline">Pre-tested Chips</p>
                </div>
              </div>

              <div 
                onClick={() => { localStorage.setItem('skb_parts_filter', 'all'); onNavigate('shop'); }}
                className="bg-slate-800/40 p-3 rounded-xl flex items-center gap-3 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">⚙️</div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Keyboard &amp; Hinges</p>
                  <p className="text-[10px] text-slate-400 group-hover:underline">Replacement Parts</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('shop')}
            className="w-full mt-4 py-2 bg-slate-850 hover:bg-slate-800 text-sky-400 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            Show Depot Store
          </button>
        </div>

        {/* Card 3: Nehru Place Hub (Square Card) */}
        <div className="col-span-1 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">📍</div>
              {isOpen ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  ● Store Open
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25 uppercase tracking-wide">
                  ● Store Closed
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">Nehru Place Hub</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Visit our state-of-the-art repair lab located in Delhi&apos;s primary IT district for a quick 2-hour swap turnaround.
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-800/60 font-mono text-[10px] tracking-wider text-slate-400 flex flex-col gap-0.5">
            <span className="text-sky-400 font-semibold">{SKB_INFO.timings}</span>
            <span className="text-slate-500 text-[9px]">{SKB_INFO.mapCoordinates}</span>
          </div>
        </div>

        {/* Card 4: Tracking & Portal Entry (Square Card) */}
        <div className="col-span-1 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-lg">
          <div className="space-y-2">
            <div className="text-2xl">📋</div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">Track Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify repair logs, retrieve digital invoices, check device health diagnostics, and claim guarantees.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('portal')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-sky-400 font-bold text-[11px] uppercase tracking-wider rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            Access My Portal
          </button>
        </div>

        {/* Card 5: Quick Statistics (Double Span Width Card) */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex justify-around items-center hover:border-slate-700/80 transition-all shadow-lg text-center">
          <div className="flex-1">
            <p className="text-3xl font-black text-white">15k+</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Repairs Completed</p>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex-1">
            <p className="text-3xl font-black text-white">4.9/5</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Customer Rating</p>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="flex-1">
            <p className="text-3xl font-black text-white">ALL</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Laptop Brands</p>
          </div>
        </div>

        {/* Card 6: Comprehensive Booking CTA (Double Span Width Card) */}
        <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-orange-500 to-rose-600 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between text-white relative overflow-hidden shadow-lg shadow-rose-950/15">
          <div className="relative z-10 max-w-sm text-center sm:text-left space-y-2">
            <h3 className="text-2xl font-extrabold tracking-tight">READY TO BOOK?</h3>
            <p className="text-orange-100 text-xs leading-relaxed">
              Secure your laboratory priority slot. Our professional pickup agent is dispatched in 2 hours within Delhi NCR!
            </p>
          </div>
          <button 
            onClick={() => onNavigate('quote')}
            className="relative z-10 mt-4 sm:mt-0 px-6 py-3.5 bg-white text-rose-600 hover:bg-slate-100 font-extrabold rounded-xl shadow-xl transition-all text-sm whitespace-nowrap cursor-pointer"
          >
            Schedule Repair Now
          </button>
          
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
        </div>

      </section>

      {/* Brands Slide & Sourcing Segment */}
      <section className="space-y-6 pt-4" id="brands-section">
        <div className="text-center space-y-1">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-500">Brands We Service &amp; Supply Parts For</h2>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent mx-auto" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {BRANDS.map((brand, idx) => (
            <div 
              key={idx}
              onClick={() => {
                localStorage.setItem('skb_draft_brand', brand);
                onNavigate('quote');
              }}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 px-4 py-5 rounded-2xl text-center transition-all group cursor-pointer"
            >
              <div className="text-sm font-semibold text-slate-300 group-hover:text-sky-400 transition-colors">
                {brand}
              </div>
              <div className="text-[9px] text-slate-500 mt-1 uppercase font-mono tracking-wider">
                Support
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chip-Level Laboratory Information Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4" id="features-highlights">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Nehru Place&apos;s Professional Micro-Soldering Lab
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              SKB Enterprises has been pioneering high-quality repair architectures at deep component levels in Delhi&apos;s IT Capital since 2012. Our laboratory houses professional diagnostic tools, infrared BGA rework stations, and precision micro-soldering rigs to handle any board anomalies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKB_INFO.features.map((feat, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-slate-700/60 transition-all">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <h3 className="font-bold text-slate-200 text-sm">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hotlines and Direct Contact Bento Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-5 flex flex-col justify-between" id="location-business-card">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Customer Support Desk</span>
              <h4 className="text-base font-extrabold text-slate-200 mt-1">Direct Laboratory Ingress</h4>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-850 rounded-lg shrink-0 text-sky-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-[10px] font-mono text-slate-500 leading-none">Phone Hotline</h5>
                  <p className="text-xs text-slate-200 mt-1 font-mono">{SKB_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-850 rounded-lg shrink-0 text-violet-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-[10px] font-mono text-slate-500 leading-none">Email Expert Support</h5>
                  <p className="text-xs text-slate-200 mt-1 font-mono">{SKB_INFO.supportEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-850 rounded-lg shrink-0 text-emerald-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-[10px] font-mono text-slate-500 leading-none">Certified Safe Sourcing</h5>
                  <p className="text-xs text-slate-200 mt-1">90-Day Unmatched Warranties</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center text-[11px] text-slate-400">
            Delhi NCR Registration: <span className="text-emerald-400 font-mono">SKB-VERIFIED-2026</span>
          </div>
        </div>
      </section>

      {/* Spares Mini Shop Depot Preview */}
      <section className="space-y-6 pt-4" id="spares-preview-section">
        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Authentic Adapters &amp; High Back-Up Batteries</h2>
            <p className="text-xs text-slate-400 mt-1">Buy authentic verified laptop hardware directly from Nehru Place</p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>VIEW ENTIRE STORE</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredParts.map((part) => (
            <div 
              key={part.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/60 hover:-translate-y-1 transition-all block group"
            >
              <div className="h-48 bg-slate-850 relative">
                <img 
                  src={part.image} 
                  alt={part.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-950/90 text-sky-400 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                  {part.type}
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white line-clamp-1">{part.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">Fits: {part.compatibleModels.join(', ')}</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none">Wholesale rate</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">₹{part.price}</span>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem('skb_parts_filter', part.type);
                      onNavigate('shop');
                    }}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Structured FAQs */}
      <section className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6" id="faq-section">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Answers to Your Repair Queries</h2>
          <p className="text-xs text-slate-400">Everything you need to know about our micro-diagnostics &amp; parts guarantees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-250 text-slate-200 text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0" />
              <span>How precise is your quick estimator?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Our instant price estimator evaluates specific repair parameters. If you select Screen replacement, it maps pricing dynamically calibrated with wholesale Nehru Place spare levels. A physical tech verification follows diagnostic acceptance.
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-250 text-slate-200 text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Are all adapters and batteries verified original?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Yes, SKB Enterprises stocking verified original OEM parts with custom internal IC safety modules to prevent device swelling. Every battery carries direct replacement warranties.
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-250 text-slate-200 text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0" />
              <span>What is your &apos;No Fix - No Fee&apos; guarantee?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              If our micro-soldering team is unable to trace or repair your motherboard fault during chip-level inspection, we charge zero rupees. No diagnostic extraction fee.
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-250 text-slate-200 text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-sky-400 shrink-0" />
              <span>How swift is pick &amp; delivery inside NCR?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Once scheduled, our dispatch rider picks up your device within 2 hours. After incoming lab diagnosis, the report is directly synced to your portal feed for client approval.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
