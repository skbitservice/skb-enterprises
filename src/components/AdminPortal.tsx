import React, { useState } from 'react';
import { 
  Cpu, Users, Wrench, Plus, Edit, Trash2, Save, X, Search, Check, 
  AlertCircle, DollarSign, Package, Calendar, RefreshCw, Layers, Eye
} from 'lucide-react';
import { LaptopPart, User, Booking, PartPurchase, PartType } from '../types';
import { BRANDS } from '../data/laptopData';

interface AdminPortalProps {
  currentUser: User | null;
  parts: LaptopPart[];
  onAddPart: (part: LaptopPart) => Promise<void> | void;
  onUpdatePart: (part: LaptopPart) => Promise<void> | void;
  onDeletePart: (id: string) => Promise<void> | void;
  users: User[];
  onUpdateUserDetail: (updatedUser: User) => Promise<void> | void;
  bookings: Booking[];
  onUpdateBooking: (updatedBooking: Booking) => Promise<void> | void;
  purchases: PartPurchase[];
  onUpdatePurchase: (updatedPurchase: PartPurchase) => Promise<void> | void;
}

type AdminSubTab = 'products' | 'users' | 'bookings';

export default function AdminPortal({
  currentUser,
  parts,
  onAddPart,
  onUpdatePart,
  onDeletePart,
  users,
  onUpdateUserDetail,
  bookings,
  onUpdateBooking,
  purchases,
  onUpdatePurchase
}: AdminPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('products');
  
  // Product Search/Filter
  const [productQuery, setProductQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<PartType | 'all'>('all');

  // User Search/Filter
  const [userQuery, setUserQuery] = useState('');

  // Booking Search/Filter
  const [bookingQuery, setBookingQuery] = useState('');

  // Uploader / Editor States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<LaptopPart | null>(null);
  
  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<PartType>('adapter');
  const [prodBrand, setProdBrand] = useState('HP');
  const [prodCompat, setProdCompat] = useState('');
  const [prodPrice, setProdPrice] = useState(1000);
  const [prodStock, setProdStock] = useState(10);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');

  // User details editor state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserAddress, setEditUserAddress] = useState('');
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);

  // Booking editor state
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null);
  const [editBookingQuote, setEditBookingQuote] = useState(0);
  const [editBookingStatus, setEditBookingStatus] = useState<Booking['status']>('pending');
  const [editBookingDate, setEditBookingDate] = useState('');
  const [editBookingPayStatus, setEditBookingPayStatus] = useState<'pending' | 'paid'>('pending');

  // Spark image presets to easily match Nehru place aesthetic
  const IMAGE_PRESETS = [
    { name: 'Adapter/Charger', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=60' },
    { name: 'Spare Battery', url: 'https://images.unsplash.com/photo-1595182811462-cbd2d9d1b0d2?w=600&auto=format&fit=crop&q=60' },
    { name: 'Motherboard Core', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60' },
    { name: 'SSD Upgrade module', url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&auto=format&fit=crop&q=60' },
    { name: 'RAM Memory stick', url: 'https://images.unsplash.com/photo-1541029071473-074b372d441c?w=600&auto=format&fit=crop&q=60' }
  ];

  // Open Product form helper
  const openAddForm = () => {
    setIsAddingProduct(true);
    setSelectedProductForEdit(null);
    setProdName('');
    setProdType('adapter');
    setProdBrand('HP');
    setProdCompat('');
    setProdPrice(1200);
    setProdStock(8);
    setProdDesc('');
    setProdImage(IMAGE_PRESETS[0].url);
  };

  const openEditProductForm = (part: LaptopPart) => {
    setSelectedProductForEdit(part);
    setIsAddingProduct(false);
    setProdName(part.name);
    setProdType(part.type);
    setProdBrand(part.brand);
    setProdCompat(part.compatibleModels.join(', '));
    setProdPrice(part.price);
    setProdStock(part.stock);
    setProdDesc(part.description);
    setProdImage(part.image);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Product Name is required');
      return;
    }

    const compatList = prodCompat
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const productPayload: LaptopPart = {
      id: selectedProductForEdit ? selectedProductForEdit.id : `part_${Date.now()}`,
      name: prodName,
      type: prodType,
      brand: prodBrand,
      compatibleModels: compatList.length > 0 ? compatList : ['All Laptop Models'],
      price: Number(prodPrice),
      stock: Number(prodStock),
      description: prodDesc || 'OEM Certified authentic laptop spare element.',
      image: prodImage || IMAGE_PRESETS[0].url
    };

    try {
      if (selectedProductForEdit) {
        await onUpdatePart(productPayload);
        setSelectedProductForEdit(null);
      } else {
        await onAddPart(productPayload);
        setIsAddingProduct(false);
      }
    } catch (err) {
      console.error('Failed submitting part: ', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you dynamic sure you want to delete this product from database catalog?')) {
      await onDeletePart(id);
    }
  };

  // Open user editor helper
  const openEditUserForm = (u: User) => {
    setSelectedUserForEdit(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserPhone(u.phone);
    setEditUserAddress(u.address || '');
    setEditUserIsAdmin(!!u.isAdmin);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const userPayload: User = {
      ...selectedUserForEdit,
      name: editUserName,
      email: editUserEmail,
      phone: editUserPhone,
      address: editUserAddress || undefined,
      isAdmin: editUserIsAdmin
    };

    await onUpdateUserDetail(userPayload);
    setSelectedUserForEdit(null);
  };

  // Open booking status progress shifter
  const openEditBookingForm = (b: Booking) => {
    setSelectedBookingForEdit(b);
    setEditBookingQuote(b.quoteAmount);
    setEditBookingStatus(b.status);
    setEditBookingDate(b.scheduledDate);
    setEditBookingPayStatus(b.paymentStatus);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    const bookingPayload: Booking = {
      ...selectedBookingForEdit,
      quoteAmount: Number(editBookingQuote),
      status: editBookingStatus,
      scheduledDate: editBookingDate,
      paymentStatus: editBookingPayStatus
    };

    await onUpdateBooking(bookingPayload);
    setSelectedBookingForEdit(null);
  };

  // Fast inline price increment helper
  const handleQuickPriceAdjust = async (part: LaptopPart, increment: number) => {
    const updated: LaptopPart = {
      ...part,
      price: Math.max(0, part.price + increment)
    };
    await onUpdatePart(updated);
  };

  // Filtering
  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productQuery.toLowerCase()) ||
                          p.compatibleModels.some(m => m.toLowerCase().includes(productQuery.toLowerCase()));
    const matchesType = productTypeFilter === 'all' || p.type === productTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.phone.includes(userQuery) ||
    (u.address && u.address.toLowerCase().includes(userQuery.toLowerCase()))
  );

  const filteredBookings = bookings.filter(b => {
    const customer = users.find(u => u.id === b.userId);
    const searchStr = `${b.brand} ${b.model} ${b.id} ${customer?.name || ''}`.toLowerCase();
    return searchStr.includes(bookingQuery.toLowerCase());
  });

  return (
    <div className="py-6 space-y-8 animate-fade-in" id="admin-portal-dashboard">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-bold font-mono tracking-widest uppercase">
            🛡️ Authorized Administration Space
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            SKB Administration Hub
          </h1>
          <p className="text-sm text-slate-400">
            Provision and list components parts catalogs, change customer diagnostic progress, adjust pricing matrices, and edit master details instantly.
          </p>
        </div>

        {/* Master analytics figures */}
        <div className="flex flex-wrap gap-3 font-mono">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block leading-tight">PRODUCTS</span>
            <span className="text-base font-bold text-sky-400">{parts.length} SKU</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block leading-tight">CUSTOMERS</span>
            <span className="text-base font-bold text-emerald-400">{users.length} registered</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block leading-tight">ACTIVE REPAIRS</span>
            <span className="text-base font-bold text-amber-500">
              {bookings.filter(b => b.status !== 'delivered').length} open
            </span>
          </div>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl max-w-lg">
        <button
          onClick={() => { setActiveSubTab('products'); setIsAddingProduct(false); setSelectedProductForEdit(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'products' ? 'bg-slate-800 text-sky-400 font-bold border border-slate-700/80 shadow-inner' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="admin-subtab-products"
        >
          <Cpu className="h-4 w-4 shrink-0" />
          <span>Catalog Spares</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('users'); setSelectedUserForEdit(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'bg-slate-800 text-sky-400 font-bold border border-slate-700/80 shadow-inner' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="admin-subtab-users"
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>User Profiles</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('bookings'); setSelectedBookingForEdit(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'bookings' ? 'bg-slate-800 text-sky-400 font-bold border border-slate-700/80 shadow-inner' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="admin-subtab-bookings"
        >
          <Wrench className="h-4 w-4 shrink-0" />
          <span>Repair Orders</span>
        </button>
      </div>

      {/* ─────────────────────────────────── SUB TAB 1: PRODUCTS CATALOG ─────────────────────────────────── */}
      {activeSubTab === 'products' && (
        <div className="space-y-6" id="admin-products-subview">
          
          {/* Filtering operations panel */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Product search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Filter elements name or key compatible models..."
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-500"
                />
              </div>

              {/* Type Category filter dropdown */}
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Product Classes</option>
                <option value="adapter">Adapters & Charger elements</option>
                <option value="battery">Lithium Battery cell packs</option>
                <option value="motherboard">Main motherboard circuit assemblies</option>
                <option value="ssd">SSD Solid state upgrades</option>
                <option value="ram">RAM SODIMM Storage upgrade</option>
              </select>
            </div>

            {/* Upload product click trigger */}
            <button
              onClick={openAddForm}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 self-stretch lg:self-auto transition-colors shadow-lg shadow-sky-500/10 cursor-pointer"
              id="admin-add-product-btn"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Upload New Product</span>
            </button>
          </div>

          {/* Upload / Edit Product Drawer Modal overlay */}
          {(isAddingProduct || selectedProductForEdit) && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative max-w-2xl mx-auto space-y-5 shadow-2xl animate-fade-in" id="product-form-box">
              <button
                onClick={() => { setIsAddingProduct(false); setSelectedProductForEdit(null); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/80 p-2 rounded-lg border border-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                  {selectedProductForEdit ? 'MODALITY EDITOR' : 'UPLOADER WIZARD'}
                </span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {selectedProductForEdit ? `Edit Product: ${selectedProductForEdit.name}` : 'Upload & Provision Spare Part Product'}
                </h2>
              </div>

              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                
                {/* 1. Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Product Heading (Name)</label>
                  <input
                    required
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Original AC Adapter for MacBook Air M1"
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    id="admin-form-prodname"
                  />
                </div>

                {/* 2. Type Class */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Spare Part Category type</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as PartType)}
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    id="admin-form-prodtype"
                  >
                    <option value="adapter">Adapter / Charger</option>
                    <option value="battery">Battery Pack</option>
                    <option value="motherboard">Motherboard</option>
                    <option value="ssd">SSD</option>
                    <option value="ram">RAM</option>
                  </select>
                </div>

                {/* 3. Manufacturer Brand */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Manufacturer / OEM Association</label>
                  <select
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    id="admin-form-prodbrand"
                  >
                    {BRANDS.map(brandName => (
                      <option key={brandName} value={brandName}>{brandName}</option>
                    ))}
                    <option value="All Brands">Universal Fits (All Brands)</option>
                  </select>
                </div>

                {/* 4. Compatible Models */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Model Compatibility List (Comma Separated)</label>
                  <input
                    type="text"
                    value={prodCompat}
                    onChange={(e) => setProdCompat(e.target.value)}
                    placeholder="e.g. Pavilion 15, HP 15s, Spectre x360"
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    id="admin-form-prodcompat"
                  />
                </div>

                {/* 5. Cost price */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Price incl. GST (In Rupees)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-mono text-slate-500 text-xs">₹</span>
                    <input
                      required
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800/80 pl-8 pr-4 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                      id="admin-form-prodprice"
                    />
                  </div>
                </div>

                {/* 6. Current Stock */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Warehouse Stocks units</label>
                  <input
                    required
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    id="admin-form-prodstock"
                  />
                </div>

                {/* 7. Image Asset url */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Catalog Photo Asset URL</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="Paste layout HTTP image URL here..."
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-505 font-mono"
                    id="admin-form-prodimage"
                  />
                  
                  {/* Image presets */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block self-center">Presets:</span>
                    {IMAGE_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setProdImage(preset.url)}
                        className="bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-850"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-450 block font-mono uppercase tracking-wide text-[10px]">Product Description Card Details</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    rows={2}
                    placeholder="Details about components efficiency, warranty, input ranges, certification..."
                    className="w-full bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    id="admin-form-proddesc"
                  />
                </div>

                {/* Form actions */}
                <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsAddingProduct(false); setSelectedProductForEdit(null); }}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-800/80 cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                    id="admin-submit-product-btn"
                  >
                    <Save className="h-4 w-4" />
                    <span>{selectedProductForEdit ? 'Commit Elements Revisions' : 'Launch Product Live'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Master Excel-like products table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl" id="admin-parts-table-box">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-955 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <th className="py-4 px-5">Spares Product Info</th>
                    <th className="py-4 px-3">Category</th>
                    <th className="py-4 px-3">OEM Brand</th>
                    <th className="py-4 px-3">Compatible Lines</th>
                    <th className="py-4 px-3 text-right">Warehouse Storage</th>
                    <th className="py-4 px-4 text-center">Cost rate Update (₹)</th>
                    <th className="py-4 px-5 text-right font-bold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredParts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        No product spare matches. Refresh list values.
                      </td>
                    </tr>
                  ) : (
                    filteredParts.map(part => {
                      const isLowStock = part.stock <= 3;
                      return (
                        <tr 
                          key={part.id} 
                          className="hover:bg-slate-850/30 transition-colors"
                          id={`admin-table-row-${part.id}`}
                        >
                          {/* Info Column */}
                          <td className="py-4 px-5 min-w-[200px]">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={part.image} 
                                alt={part.name} 
                                className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800/80" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-slate-100 line-clamp-1">{part.name}</div>
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">{part.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-3 font-semibold uppercase font-mono tracking-wider text-[10px] text-sky-400 shrink-0">
                            {part.type}
                          </td>

                          {/* Brand */}
                          <td className="py-4 px-3 text-slate-300 font-semibold uppercase font-mono text-[10px]">
                            {part.brand}
                          </td>

                          {/* Models */}
                          <td className="py-4 px-3 text-slate-400 font-medium">
                            <span className="line-clamp-2 max-w-[150px]">{part.compatibleModels.join(', ')}</span>
                          </td>

                          {/* Stock */}
                          <td className="py-4 px-3 text-right">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                              isLowStock 
                                ? 'text-rose-400 bg-rose-500/10 border border-rose-550/15'
                                : 'text-emerald-400 bg-emerald-500/5'
                            }`}>
                              {part.stock} left
                            </span>
                          </td>

                          {/* Cost rates fast increment updater */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleQuickPriceAdjust(part, -100)}
                                className="bg-slate-950 hover:bg-slate-800 text-slate-400 font-mono font-black p-1 px-2.5 rounded border border-slate-855"
                                title="Subtract ₹100"
                              >
                                -100
                              </button>
                              
                              {/* Price label */}
                              <span className="font-mono font-bold text-slate-100 text-sm min-w-[70px] text-center">
                                ₹{part.price}
                              </span>

                              <button
                                onClick={() => handleQuickPriceAdjust(part, 100)}
                                className="bg-slate-950 hover:bg-slate-800 text-sky-400 font-mono font-black p-1 px-2.5 rounded border border-slate-855"
                                title="Add ₹100"
                              >
                                +100
                              </button>
                            </div>
                          </td>

                          {/* Delete / edit layout triggers */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditProductForm(part)}
                                className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2 rounded-lg border border-slate-800 cursor-pointer"
                                title="Revise all details"
                                id={`admin-edit-part-${part.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(part.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/15 cursor-pointer"
                                title="Delete SKU"
                                id={`admin-delete-part-${part.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────── SUB TAB 2: USER PROFILES ─────────────────────────────────── */}
      {activeSubTab === 'users' && (
        <div className="space-y-6" id="admin-users-subview">
          
          {/* Filtering operations panel */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search user name, email, phone coordinates..."
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 mt-0.5 text-xs text-slate-200 focus:outline-none focus:border-sky-505 placeholder-slate-500"
              />
            </div>
            
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">
              Found {filteredUsers.length} Customers registers
            </span>
          </div>

          {/* User detailing profiles Editor Overlay */}
          {selectedUserForEdit && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative max-w-md mx-auto space-y-5 shadow-2xl animate-fade-in" id="user-editor-box">
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/80 p-2 rounded-lg border border-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">CLIENT FILE MANAGER</span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">Edit Personal Details</h2>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-4 text-xs font-sans">
                
                {/* 1. Name */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Client Name</label>
                  <input
                    required
                    type="text"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-250 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* 2. Email */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Logged Gmail Email</label>
                  <input
                    required
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-250 focus:outline-none focus:border-sky-500 cursor-not-allowed opacity-70"
                    disabled
                  />
                  <span className="text-[10px] text-slate-550">Authing emails are immutable for ledger index.</span>
                </div>

                {/* 3. Phone */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Mobile Phone Connection</label>
                  <input
                    required
                    type="text"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    placeholder="e.g. +91 98114 XXXXX"
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-250 focus:outline-none focus:border-sky-505"
                  />
                </div>

                {/* 4. Delivery Address */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Default NCR Delivery Location</label>
                  <input
                    type="text"
                    value={editUserAddress}
                    onChange={(e) => setEditUserAddress(e.target.value)}
                    placeholder="Courier logistics endpoint..."
                    className="w-full bg-slate-950 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-slate-250 focus:outline-none focus:border-sky-505"
                  />
                </div>

                {/* 5. Role Admin designation */}
                <div className="p-3 bg-slate-955 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block font-semibold">ADMIN SYSTEM CLAIMS</span>
                    <span className="text-slate-400 text-[11px]">Designate customer as system Administrator</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editUserIsAdmin}
                    onChange={(e) => setEditUserIsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-800 cursor-pointer"
                  />
                </div>

                {/* Submit actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-800/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Customer changes</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Customer list Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="admin-users-list">
            {filteredUsers.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-slate-90 w-full rounded-2xl border border-slate-800/80">
                <Users className="h-10 w-10 text-slate-750 mx-auto" />
                <p className="text-xs text-slate-450 mt-1">No active customer registers found.</p>
              </div>
            ) : (
              filteredUsers.map(user => {
                const totalRepairs = bookings.filter(b => b.userId === user.id).length;
                const totalPurchased = purchases.filter(p => p.userId === user.id).length;
                return (
                  <div 
                    key={user.id} 
                    className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 bg-sky-500/10 text-sky-400 border border-sky-500/15 text-lg font-bold rounded-xl flex items-center justify-center select-none uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-extrabold text-slate-100 uppercase text-xs sm:text-sm">{user.name}</h3>
                            {user.isAdmin && (
                              <span className="text-[9px] font-mono text-rose-450 bg-rose-500/15 border border-rose-550/10 px-1.5 rounded uppercase font-semibold">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 max-w-[140px] truncate">{user.id}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-800/60 text-xs text-slate-350">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-505 font-medium min-w-[50px]">Email:</span>
                          <span className="text-slate-205 truncate max-w-[180px] font-mono text-[11px]">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-505 font-medium min-w-[50px]">Phone:</span>
                          <span className="text-slate-205 font-mono text-[11px]">{user.phone}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-slate-505 font-medium shrink-0 min-w-[50px]">Address:</span>
                          <span className="text-slate-205 leading-relaxed line-clamp-2">{user.address || 'No Default Address specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="space-x-2 flex">
                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          🛠️ {totalRepairs} repair slots
                        </span>
                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          📦 {totalPurchased} parts bought
                        </span>
                      </div>

                      <button
                        onClick={() => openEditUserForm(user)}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold p-1 px-2.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        id={`admin-edit-user-${user.id}`}
                      >
                        Change Details
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────── SUB TAB 3: REPAIR ORDERS ─────────────────────────────────── */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6" id="admin-bookings-subview">
          
          {/* Filtering operations panel */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={bookingQuery}
                onChange={(e) => setBookingQuery(e.target.value)}
                placeholder="Search laptop brand, model, repair ID or client name..."
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 mt-0.5 text-xs text-slate-200 focus:outline-none focus:border-sky-505 placeholder-slate-500"
              />
            </div>
            
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">
              Managed {filteredBookings.length} Total Bookings log
            </span>
          </div>

          {/* Booking Edit/Rescheduling Modal Drawer overlay */}
          {selectedBookingForEdit && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative max-w-md mx-auto space-y-5 shadow-2xl animate-fade-in" id="booking-editor-box">
              <button
                onClick={() => setSelectedBookingForEdit(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/80 p-2 rounded-lg border border-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">DIAGNOSTICS &amp; COMPLIANCE MANAGER</span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">Edit Booking Reservation</h2>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Order ID: {selectedBookingForEdit.id}</div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-sans">
                
                {/* 1. Quote price change */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Adjust Repair Quote Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-mono text-slate-550">₹</span>
                    <input
                      required
                      type="number"
                      value={editBookingQuote}
                      onChange={(e) => setEditBookingQuote(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800/80 pl-7 pr-4 py-2.5 rounded-xl text-slate-150 font-mono focus:outline-none focus:border-sky-505"
                    />
                  </div>
                </div>

                {/* 2. Scheduled Date */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Scheduled Repair Visit/Pick-up Date</label>
                  <input
                    required
                    type="date"
                    value={editBookingDate}
                    onChange={(e) => setEditBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 snap-center px-4 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                {/* 3. Dropdown progress Status shift */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Diagnostics Status progress</label>
                  <select
                    value={editBookingStatus}
                    onChange={(e) => setEditBookingStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-slate-205 focus:outline-none focus:border-sky-500 uppercase tracking-wide text-[10px] font-mono font-bold"
                  >
                    <option value="pending">Pending Registration (Unassigned)</option>
                    <option value="received">Received in Nehru Place Lab</option>
                    <option value="diagnosing">Active Oscilloscope Diagnosis</option>
                    <option value="repairing">In Solder / Reballing Repair</option>
                    <option value="ready">Completed Benchtested &amp; Ready</option>
                    <option value="delivered">Delivered to client (Closed ledger)</option>
                  </select>
                </div>

                {/* 4. Payment status updater */}
                <div className="space-y-1">
                  <label className="text-slate-450 block font-mono uppercase text-[10px]">Payment Verification Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditBookingPayStatus('pending')}
                      className={`py-2 px-3 border text-[11px] font-mono font-extrabold uppercase rounded-lg transition-colors cursor-pointer ${
                        editBookingPayStatus === 'pending'
                          ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                          : 'bg-slate-950/80 border-slate-850 text-slate-500'
                      }`}
                    >
                      Pending payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditBookingPayStatus('paid')}
                      className={`py-2 px-3 border text-[11px] font-mono font-extrabold uppercase rounded-lg transition-colors cursor-pointer ${
                        editBookingPayStatus === 'paid'
                          ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-bold'
                          : 'bg-slate-950/80 border-slate-850 text-slate-500'
                      }`}
                    >
                      Verified PAID
                    </button>
                  </div>
                </div>

                {/* Submit operations */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForEdit(null)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-805/85"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Apply Booking parameters</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Bookings table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl" id="admin-bookings-table-box">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-slate-955 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <th className="py-4 px-5">Repair ID</th>
                    <th className="py-4 px-3">Device (Model)</th>
                    <th className="py-4 px-3">Associated Owner</th>
                    <th className="py-4 px-3 font-mono text-right">Repairs Quote (₹)</th>
                    <th className="py-4 px-3 text-center">Service Method</th>
                    <th className="py-4 px-3 text-center font-bold">Progress status</th>
                    <th className="py-4 px-3 text-center">Payment Status</th>
                    <th className="py-4 px-5 text-right font-bold text-slate-450">Set params</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold">
                        No laptop repair logs matching. Adjust filter searches.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(book => {
                      const customer = users.find(u => u.id === book.userId);
                      return (
                        <tr 
                          key={book.id} 
                          className="hover:bg-slate-850/30 transition-colors"
                          id={`admin-booking-row-${book.id}`}
                        >
                          {/* ID */}
                          <td className="py-4 px-5 font-mono font-bold text-sky-400 tracking-wide text-xs">
                            {book.id}
                          </td>

                          {/* Device details */}
                          <td className="py-4 px-3">
                            <div className="font-bold text-slate-100">{book.brand}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-sans leading-none">{book.model}</div>
                          </td>

                          {/* Client owner */}
                          <td className="py-4 px-3">
                            <div className="font-semibold text-slate-205">{customer?.name || 'Walkin Client'}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 tracking-tight font-mono">{customer?.phone || 'No phone'}</div>
                          </td>

                          {/* Price Quote */}
                          <td className="py-4 px-3 text-right font-mono font-bold text-slate-100 text-[13px]">
                            ₹{book.quoteAmount}
                          </td>

                          {/* Service mechanism */}
                          <td className="py-4 px-3 text-center font-medium">
                            <span className="bg-slate-950 px-2 py-1 rounded text-[10px] border border-slate-850 text-slate-350">
                              {book.serviceType === 'home_pickup' ? '🛵 NCR pickup' : '🏢 Nehru Place'}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-block text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                              book.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-450 border-emerald-555/20'
                                : book.status === 'ready'
                                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/25 animate-pulse'
                                  : 'bg-amber-500/10 text-amber-450 border-amber-550/15'
                            }`}>
                              {book.status}
                            </span>
                          </td>

                          {/* Pay status */}
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              book.paymentStatus === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {book.paymentStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => openEditBookingForm(book)}
                              className="bg-slate-950 hover:bg-slate-800 text-slate-250 p-2 rounded-lg border border-slate-800 cursor-pointer text-xs"
                              title="Update live parameters"
                              id={`admin-edit-booking-${book.id}`}
                            >
                              Update Status
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
