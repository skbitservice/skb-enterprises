import React, { useState } from 'react';
import { 
  ShoppingBag, Cpu, Shield, Check, AlertCircle, 
  Search, Filter, Plus, Minus, ArrowRight, X, Sparkles, CheckCircle
} from 'lucide-react';
import { User, LaptopPart, PartPurchase, PartType } from '../types';

interface PartsStoreProps {
  currentUser: User | null;
  onNavigate: (tab: 'home' | 'quote' | 'shop' | 'portal') => void;
  onAddPurchase: (purchase: PartPurchase) => void;
  parts: LaptopPart[];
}

export default function PartsStore({ currentUser, onNavigate, onAddPurchase, parts }: PartsStoreProps) {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PartType | 'all'>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');

  // Load from Bento category preset if stored
  React.useEffect(() => {
    try {
      const persistedFilter = localStorage.getItem('skb_parts_filter');
      if (persistedFilter) {
        setSelectedType(persistedFilter as any);
        localStorage.removeItem('skb_parts_filter');
      }
    } catch (e) {
      console.error('Failed to load parts category preset: ', e);
    }
  }, []);

  // Interactive checkout states
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<LaptopPart | null>(null);
  const [partEnteringCheckout, setPartEnteringCheckout] = useState<LaptopPart | null>(null);
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'cod' | 'net_banking'>('net_banking');
  const [checkoutSuccess, setCheckoutSuccess] = useState<PartPurchase | null>(null);

  // Filter parts catalog
  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          part.compatibleModels.some(model => model.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          part.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || part.type === selectedType;

    const matchesBrand = selectedBrandFilter === 'all' || 
                        part.brand.toLowerCase() === selectedBrandFilter.toLowerCase() ||
                        (selectedBrandFilter === 'Others' && !['HP', 'Dell', 'Lenovo', 'Apple (MacBook)'].includes(part.brand));

    return matchesSearch && matchesType && matchesBrand;
  });

  // Unique brand names for filters
  const filterBrands = ['all', 'HP', 'Dell', 'Lenovo', 'Apple (MacBook)', 'Others'];

  const openCheckout = (part: LaptopPart) => {
    setCheckoutSuccess(null);
    if (!currentUser) {
      // Guide to login first
      onNavigate('portal');
      return;
    }
    setPartEnteringCheckout(part);
    setPurchaseQty(1);
    setShippingAddress(currentUser.address || '');
    setSelectedPartForDetails(null);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !partEnteringCheckout) return;

    if (!shippingAddress.trim()) {
      alert('Please provide a valid shipping address for Delhi and other Indian regions Delivery.');
      return;
    }

    const totalAmount = partEnteringCheckout.price * purchaseQty;
    const purchaseId = `SKB-ORD-${Date.now().toString().slice(-6)}`;

    const newPurchase: PartPurchase = {
      id: purchaseId,
      userId: currentUser.id,
      partId: partEnteringCheckout.id,
      partName: partEnteringCheckout.name,
      price: partEnteringCheckout.price,
      quantity: purchaseQty,
      totalAmount,
      status: 'processing',
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    onAddPurchase(newPurchase);
    setCheckoutSuccess(newPurchase);
    setPartEnteringCheckout(null);
  };

  return (
    <div className="py-6 space-y-8 animate-fade-in" id="parts-store-view">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Original Laptop Spare Parts Store
        </h1>
        <p className="text-sm text-slate-400">
          Source authentic AC adapters, high safety cycle internal batteries, and component motherboards directly from Nehru Place Delhi inventory catalog with full replacements guarantees.
        </p>
      </div>

      {/* Main Grid: Filtering Controls on top, catalog below */}
      <div className="space-y-6">
        
        {/* Search and filter panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part name or laptop model compatibility..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              id="part-search-input"
            />
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto" id="part-type-filters">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              All Spares
            </button>
            <button
              onClick={() => setSelectedType('adapter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'adapter'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
              id="filter-type-adapter"
            >
              Adapters / Chargers
            </button>
            <button
              onClick={() => setSelectedType('battery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'battery'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
              id="filter-type-battery"
            >
              Batteries
            </button>
            <button
              onClick={() => setSelectedType('motherboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'motherboard'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
              id="filter-type-motherboard"
            >
              Motherboards
            </button>
            <button
              onClick={() => setSelectedType('ssd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'ssd'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              SSD
            </button>
            <button
              onClick={() => setSelectedType('ram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedType === 'ram'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              RAM
            </button>
          </div>

          {/* Brand selectors */}
          <div className="flex items-center space-x-2 w-full md:w-auto self-stretch md:self-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Brand fit</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-2 py-1.5 text-xs text-slate-300 rounded-lg focus:outline-none focus:border-sky-550"
              id="part-brand-filter"
            >
              {filterBrands.map(b => (
                <option key={b} value={b}>{b === 'all' ? 'All Fits' : b}</option>
              ))}
            </select>
          </div>

        </div>

        {/* If checkout session succeeded, display block */}
        {checkoutSuccess && (
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl block text-center space-y-4 max-w-xl mx-auto animate-fade-in" id="purchase-success-alert">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 tracking-wider font-semibold">ORDER PLACED</span>
              <h3 className="text-lg font-bold text-slate-200 mt-1">Authentic Parts Reserved!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Your purchase was authorized under Order ID <span className="text-white font-semibold font-mono">{checkoutSuccess.id}</span>. We will deliver this directly with Free Courier to high-priority address.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => onNavigate('portal')}
                className="flex-1 bg-sky-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-sky-400 transition-colors"
              >
                Go to Orders Dashboard
              </button>
              <button
                onClick={() => setCheckoutSuccess(null)}
                className="flex-1 bg-slate-850 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-800 transition-colors"
              >
                Continue Purchasing
              </button>
            </div>
          </div>
        )}

        {/* Catalog List */}
        {filteredParts.length === 0 ? (
          <div className="text-center py-16 bg-slate-950 rounded-2xl border border-slate-800">
            <ShoppingBag className="h-12 w-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-450">No spare parts matched your searches.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedBrandFilter('all'); }} 
              className="mt-3 text-xs text-sky-500 underline font-semibold cursor-pointer"
            >
              Reset filters and search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="parts-catalog-grid">
            {filteredParts.map(part => {
              const isLowStock = part.stock <= 3;
              return (
                <div 
                  key={part.id} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-shadow flex flex-col justify-between group"
                  id={`part-card-${part.id}`}
                >
                  {/* Photo area with absolute tags */}
                  <div className="h-44 bg-slate-950 relative overflow-hidden shrink-0">
                    <img
                      src={part.image}
                      alt={part.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-sm text-sky-400 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border border-slate-800/80">
                      {part.type}
                    </div>
                  </div>

                  {/* Descriptions block */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-tight group-hover:text-white transition-colors">
                          {part.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                        {part.description}
                      </p>
                      
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Comptability fits</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {part.compatibleModels.map(fit => (
                            <span key={fit} className="bg-slate-950 text-slate-300 font-sans text-[10px] px-2 py-0.5 rounded border border-slate-800/80">
                              {fit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Costing values and buyout triggers */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono leading-none">Price incl. GST</span>
                        <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">₹{part.price}</span>
                      </div>
                      
                      <div className="text-right">
                        {/* Stock indicator */}
                        {isLowStock ? (
                          <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 mb-1.5 inline-block">
                            Hurry, {part.stock} left!
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 mb-1.5 inline-block">
                            Available ({part.stock})
                          </span>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPartForDetails(part)}
                            className="bg-slate-950 hover:bg-slate-850 text-slate-300 p-2 rounded-lg text-xs border border-slate-800 transition-colors cursor-pointer"
                            title="View precise engineering data"
                          >
                            Specs
                          </button>
                          
                          <button
                            onClick={() => openCheckout(part)}
                            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3 py-2 rounded-lg text-xs flex items-center space-x-1 transition-colors cursor-pointer shadow-lg shadow-sky-500/5"
                            id={`part-buy-button-${part.id}`}
                          >
                            <span>Buy Part</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Expanded specifications overlay Modal */}
      {selectedPartForDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="part-details-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden relative shadow-2xl">
            <button
              onClick={() => setSelectedPartForDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="h-48 bg-slate-950 relative">
              <img 
                src={selectedPartForDetails.image} 
                alt={selectedPartForDetails.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono bg-sky-500/15 text-sky-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {selectedPartForDetails.type}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2">{selectedPartForDetails.name}</h2>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-sans">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850/80 space-y-2">
                  <div className="text-slate-400 font-semibold tracking-wide uppercase text-[10px]">Part Description &amp; Specifications</div>
                  <div>{selectedPartForDetails.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/30 p-3 rounded-lg border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">MANUFACTURER BRAND</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{selectedPartForDetails.brand}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WAREHOUSE STOCK</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{selectedPartForDetails.stock} units left</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">NEHRU PLACE DIRECT RATE</span>
                  <span className="text-2xl font-bold text-white font-mono">₹{selectedPartForDetails.price}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const modelToInquire = selectedPartForDetails.compatibleModels[0] || 'your laptop';
                      setSelectedPartForDetails(null);
                      onNavigate('quote');
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-800 transition-colors"
                  >
                    Need Fitting?
                  </button>
                  <button
                    onClick={() => openCheckout(selectedPartForDetails)}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Secure Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Processing Overlay Drawer / Modal (If logged in) */}
      {partEnteringCheckout && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="checkout-form-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-5">
            <button
              onClick={() => setPartEnteringCheckout(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/80 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 rounded font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-sky-400 shrink-0" />
                <span>Verified OEM Spare</span>
              </span>
              <h2 className="text-lg font-bold text-white mt-1">Order Dispatch Parameters</h2>
              <p className="text-xs text-slate-405 leading-normal">
                Fits: {partEnteringCheckout.compatibleModels.join(', ')}
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 font-sans">
              {/* Product mini card list */}
              <div className="bg-slate-955 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <div className="truncate max-w-[65%] font-medium text-slate-200">{partEnteringCheckout.name}</div>
                <div className="font-mono font-semibold">₹{partEnteringCheckout.price} each</div>
              </div>

              {/* Quantity config */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase font-mono tracking-wider">Adjustment Quantity</span>
                <div className="flex items-center space-x-3 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setPurchaseQty(prev => Math.max(1, prev - 1))}
                    disabled={purchaseQty <= 1}
                    className="p-1 px-2 hover:bg-slate-800 text-slate-300 rounded-lg text-xs disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-xs font-semibold text-slate-100 min-w-4 text-center">{purchaseQty}</span>
                  <button
                    type="button"
                    onClick={() => setPurchaseQty(prev => Math.min(partEnteringCheckout.stock, prev + 1))}
                    disabled={purchaseQty >= partEnteringCheckout.stock}
                    className="p-1 px-2 hover:bg-slate-800 text-slate-300 rounded-lg text-xs disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Shipping address input */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Indian Postal Shipping Address</label>
                <textarea
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street details, Locality, Pincode, City, State..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 text-xs text-slate-200 rounded-lg p-3 focus:outline-none transition-colors"
                />
              </div>

              {/* Payment mechanism simulation */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Simulation Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPayMethod('net_banking')}
                    className={`cursor-pointer p-2.5 rounded-lg text-center border text-[11px] font-semibold transition-colors uppercase ${
                      payMethod === 'net_banking'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-450'
                        : 'bg-slate-950/80 border-slate-850 text-slate-405'
                    }`}
                  >
                    Online Sandbox Card
                  </div>
                  <div
                    onClick={() => setPayMethod('cod')}
                    className={`cursor-pointer p-2.5 rounded-lg text-center border text-[11px] font-semibold transition-colors uppercase ${
                      payMethod === 'cod'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-450'
                        : 'bg-slate-950/80 border-slate-850 text-slate-405'
                    }`}
                  >
                    Cash on Delivery
                  </div>
                </div>
              </div>

              {/* Itemized final sum */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal ({purchaseQty} item)</span>
                  <span className="font-mono text-slate-300">₹{partEnteringCheckout.price * purchaseQty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fast Delivery from Nehru Place Store</span>
                  <span className="text-emerald-400 uppercase font-semibold">FREE SHIPPING</span>
                </div>
                <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800/80 pt-2">
                  <span>Grand Total</span>
                  <span className="font-mono text-sky-400">₹{partEnteringCheckout.price * purchaseQty}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-sky-500/10 cursor-pointer"
                id="checkout-confirm-button"
              >
                <span>Authorize payment &amp; secure parts</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
