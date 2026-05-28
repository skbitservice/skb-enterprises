import React from 'react';
import { Laptop, MapPin, Wrench, ShoppingBag, User, LogOut, Cpu } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentTab: 'home' | 'quote' | 'shop' | 'portal' | 'admin';
  setTab: (tab: 'home' | 'quote' | 'shop' | 'portal' | 'admin') => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

export default function Header({ currentTab, setTab, currentUser, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setTab('home')}
            id="brand-logo"
          >
            <div className="bg-sky-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-sky-500/15 group-hover:bg-sky-400 transition-colors">
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans sm:text-2xl">
                  SKB<span className="text-sky-400 font-normal"> Enterprises</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                <span>Nehru Place, Delhi</span>
              </div>
            </div>
          </div>

          {/* Nav Links for Desktop */}
          <nav className="hidden md:flex space-x-1" id="desktop-nav">
            <button
              onClick={() => setTab('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentTab === 'home'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              id="nav-tab-home"
            >
              Home
            </button>
            <button
              onClick={() => setTab('quote')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-150 ${
                currentTab === 'quote'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              id="nav-tab-quote"
            >
              <Wrench className="h-4 w-4 shrink-0" />
              <span>Get Instant Quote</span>
            </button>
            <button
              onClick={() => setTab('shop')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-150 ${
                currentTab === 'shop'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              id="nav-tab-shop"
            >
              <Cpu className="h-4 w-4 shrink-0" />
              <span>Laptop Parts Store</span>
            </button>
            <button
              onClick={() => setTab('portal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-150 ${
                currentTab === 'portal'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              id="nav-tab-portal"
            >
              <User className="h-4 w-4 shrink-0" />
              <span>Customer Portal {currentUser && '●'}</span>
            </button>
            {currentUser?.isAdmin && (
              <button
                onClick={() => setTab('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-150 ${
                  currentTab === 'admin'
                    ? 'bg-amber-955 text-amber-400 border border-amber-500/20'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
                id="nav-tab-admin"
              >
                <span>🛡️ Admin Console</span>
              </button>
            )}
          </nav>

          {/* User profile & quick action */}
          <div className="flex items-center space-x-3" id="header-auth-section">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div 
                  className="hidden lg:block text-right cursor-pointer"
                  onClick={() => setTab('portal')}
                >
                  <div className="text-xs text-slate-400 leading-none">Logged in as</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">{currentUser.name}</div>
                </div>
                <div 
                  onClick={() => setTab('portal')}
                  className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-content-center justify-center text-sky-400 font-bold uppercase select-none cursor-pointer hover:border-sky-400 transition-colors"
                  id="user-avatar-button"
                >
                  {currentUser.name.charAt(0)}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                  id="header-logout-button"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTab('portal')}
                className="inline-flex items-center space-x-2 bg-sky-500 text-slate-950 font-semibold px-4 py-2 rounded-lg hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/10 text-sm"
                id="header-login-button"
              >
                <User className="h-4 w-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
