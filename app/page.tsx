'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import WeatherWidget from '@/components/WeatherWidget';
import MarketPrices from '@/components/MarketPrices';
import Marketplace from '@/components/Marketplace';
import AuthModal from '@/components/AuthModal';
import IoTDashboard from '@/components/IoTDashboard';
import CropRecommendation from '@/components/CropRecommendation';
import SmartCropCalendar from '@/components/SmartCropCalendar';
import ResourceLibrary from '@/components/ResourceLibrary';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/components/AuthProvider';
import { Sprout, ShieldCheck, Zap, BarChart3, Menu, X, User, LogOut, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Page() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-900">AgroBot</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {!user ? (
              <button onClick={() => scrollToSection('chat')} className="cursor-pointer hover:text-emerald-600 transition-colors font-bold text-emerald-700">Advisory</button>
            ) : (
              <>
                <button onClick={() => scrollToSection('iot')} className="cursor-pointer hover:text-emerald-600 transition-colors">Sensors</button>
                <button onClick={() => scrollToSection('recommendation')} className="cursor-pointer hover:text-emerald-600 transition-colors">Crops</button>
                <button onClick={() => scrollToSection('calendar')} className="cursor-pointer hover:text-emerald-600 transition-colors">Calendar</button>
                <button onClick={() => scrollToSection('market')} className="cursor-pointer hover:text-emerald-600 transition-colors">Market</button>
                <button onClick={() => scrollToSection('marketplace')} className="cursor-pointer hover:text-emerald-600 transition-colors font-semibold text-emerald-700">Trade</button>
                <button onClick={() => scrollToSection('weather')} className="cursor-pointer hover:text-emerald-600 transition-colors">Weather</button>
                <button onClick={() => scrollToSection('resources')} className="cursor-pointer hover:text-emerald-600 transition-colors">Resources</button>
                <Link href="/admin" className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <ShieldCheck size={16} /> Admin
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && <NotificationBell />}

            <button 
              className="cursor-pointer md:hidden p-2 text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="hidden md:flex items-center gap-3 relative">
              {user && (
                <>
                  <div 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm cursor-pointer hover:bg-emerald-200 transition-colors"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-black/5 bg-slate-50">
                          <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="cursor-pointer w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-black/5 mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4 py-4 text-sm font-medium text-slate-600">
                {!user ? (
                   <button onClick={() => scrollToSection('chat')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Advisory</button>
                ) : (
                  <>
                    <button onClick={() => scrollToSection('iot')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Sensors</button>
                    <button onClick={() => scrollToSection('recommendation')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Crops</button>
                    <button onClick={() => scrollToSection('calendar')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Calendar</button>
                    <button onClick={() => scrollToSection('market')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Market</button>
                    <button onClick={() => scrollToSection('marketplace')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-semibold text-emerald-700">🛒 Trade</button>
                    <button onClick={() => scrollToSection('weather')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Weather</button>
                    <button onClick={() => scrollToSection('resources')} className="cursor-pointer text-left px-2 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">Resources</button>
                    <Link href="/admin" className="cursor-pointer w-full bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 mt-2">
                      <ShieldCheck size={16} /> Admin Dashboard
                    </Link>
                  </>
                )}
                
                <div className="border-t border-black/5 pt-4 mt-2">
                  {user && (
                    <div className="px-2">
                      <p className="font-bold text-slate-800 mb-1">{user.name}</p>
                      <button 
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="cursor-pointer text-red-600 flex items-center gap-2 py-2"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4"
          >
            Smart Farming <span className="text-emerald-600">Intelligence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl leading-relaxed"
          >
            Real-time decision support for Ugandan smallholder farmers. 
            Get expert advice, detect diseases, and stay ahead of market trends.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-8">
            {!user ? (
              <>
                {/* GUEST VIEW: Advisory + Conversion Banner */}
                <section id="chat" className="scroll-mt-24">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Zap size={20} className="text-emerald-600" />
                      Free AI Advisory
                    </h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Public Access</span>
                    </div>
                  </div>
                  <ChatInterface />
                </section>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden text-center shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BarChart3 size={240} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black mb-4">Unlock Your Professional Farm Dashboard</h3>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
                      Join thousands of elite farmers. Sign up now to access real-time soil sensors, market price alerts, smart crop calendars, and our secure trade marketplace.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button 
                        onClick={() => openAuthModal('signup')}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                      >
                        Create Your Account
                      </button>
                      <button 
                        onClick={() => openAuthModal('login')}
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all border border-white/5"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* LOGGED IN VIEW: Full Smart Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-12">
                    <section id="iot" className="scroll-mt-24">
                      <IoTDashboard />
                    </section>

                    <section id="recommendation" className="scroll-mt-24">
                      <CropRecommendation />
                    </section>

                    <section id="calendar" className="scroll-mt-24">
                      <SmartCropCalendar />
                    </section>

                    <section id="marketplace" className="scroll-mt-24">
                      <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6">
                        <Store size={26} className="text-emerald-500" />
                        Platform Marketplace
                      </h2>
                      <Marketplace />
                    </section>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                    <section id="weather" className="scroll-mt-24">
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Local Micro-Climate
                      </h2>
                      <WeatherWidget />
                    </section>

                    <section id="market" className="scroll-mt-24">
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div> Regional Price Index
                      </h2>
                      <MarketPrices />
                    </section>

                    <section id="resources" className="scroll-mt-24">
                      <ResourceLibrary />
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Sprout size={16} />
            </div>
            <span className="text-lg font-bold tracking-tight text-emerald-900">AgroBot</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 AgroBot. Built for Bugema University Software Engineering.</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <button className="cursor-pointer hover:text-emerald-600">Privacy</button>
            <button className="cursor-pointer hover:text-emerald-600">Terms</button>
            <button onClick={() => scrollToSection('chat')} className="cursor-pointer hover:text-emerald-600">Contact</button>
          </div>
        </div>
      </footer>
    </main>
  );
}
