'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Users, Shield, LogOut,
  Search, Calendar, Trash2, Zap, ArrowLeft, ShoppingBag,
  Store, Tag, ShoppingCart, Loader2, Edit, X, Save,
  AlertCircle, RefreshCw, ChevronRight, Menu, CheckCircle2,
  Handshake, Phone, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type Tab = 'overview' | 'marketplace' | 'chats' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All Data state
  const [adminData, setAdminData] = useState<{
    appUsers: any[],
    marketplaceUsers: any[],
    chats: any[],
    listings: any[],
    orders: any[],
    trades: any[]
  }>({ appUsers: [], marketplaceUsers: [], chats: [], listings: [], orders: [], trades: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit State
  const [editingItem, setEditingItem] = useState<{ type: string, item: any } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'agrobot-admin-2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    router.push('/');
  };

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdminData(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.item.id,
          data: editingItem.item
        }),
      });
      if (res.ok) {
        setEditingItem(null);
        fetchAllData();
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>

        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-10">
          <ArrowLeft size={20} />
          Back to App
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 border border-white/10"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-3xl text-emerald-600">
              <Shield size={40} className="drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-slate-900 mb-2 tracking-tight">Admin Panel</h1>
          <p className="text-slate-500 text-center mb-8 text-sm px-4">Secure gateway to manage agricultural interactions</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg"
            >
              Access Console
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all relative group ${activeTab === id
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
    >
      <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="flex-1 text-left">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="activeInd" className="w-1.5 h-1.5 bg-white rounded-full" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-emerald-600 p-2 rounded-xl">
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight">Admin Console</span>
        </div>

        <nav className="flex-1 space-y-3">
          <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
          <TabButton id="marketplace" label="Marketplace" icon={ShoppingBag} />
          <TabButton id="chats" label="Chat Logs" icon={MessageSquare} />
          <TabButton id="users" label="User Manager" icon={Users} />
        </nav>

        <div className="mt-auto space-y-4 pt-8 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-slate-100 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> Back to App
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all font-bold text-sm group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 bg-slate-50 rounded-xl lg:hidden text-slate-600 active:scale-95 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase text-[0.7rem] bg-slate-100 px-2 py-0.5 rounded-md w-fit mb-1">{activeTab} Section</h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Calendar size={14} />
                {format(new Date(), 'EEEE, MMM dd')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={dataLoading}
              className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all hover:shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={dataLoading ? 'animate-spin' : ''} />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-tighter">System Live</span>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed inset-0 z-50 bg-slate-900 p-8 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-black text-white">Admin Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2"><X /></button>
              </div>
              <nav className="space-y-2 mb-12">
                <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
                <TabButton id="marketplace" label="Marketplace" icon={ShoppingBag} />
                <TabButton id="chats" label="Chat Logs" icon={MessageSquare} />
                <TabButton id="users" label="User Manager" icon={Users} />
              </nav>
              <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-red-400 font-black">
                <LogOut size={20} /> Signed Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-6 lg:p-10 flex-1 overflow-x-hidden">
          {dataLoading && adminData.chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <Loader2 size={48} className="text-emerald-600 animate-spin" />
              </div>
              <p className="text-slate-400 font-bold animate-pulse">Synchronizing Dashboard Data...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-10">

              {activeTab === 'overview' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard label="Total Interactions" val={adminData.chats.length} grow="+22%" icon={MessageSquare} color="emerald" />
                    <StatCard label="Live Matches" val={adminData.trades.length} grow="+8%" icon={Zap} color="blue" />
                    <StatCard label="Active Listings" val={adminData.listings.filter(l => l.status === 'active').length} grow="+15%" icon={Tag} color="amber" />
                    <StatCard label="Completed Trades" val={adminData.trades.filter(t => t.status === 'completed').length} grow="+12%" icon={CheckCircle2} color="purple" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><MessageSquare size={20} /></div>
                          Live Interaction Stream
                        </h3>
                        <button onClick={() => setActiveTab('chats')} className="text-sm font-black text-emerald-600 hover:translate-x-1 transition-transform flex items-center gap-1 uppercase tracking-tighter">See All <ChevronRight size={16} /></button>
                      </div>
                      <div className="space-y-4">
                        {adminData.chats.slice(0, 6).map((chat: any) => (
                          <div key={chat.id} className="flex items-start gap-4 p-5 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${chat.role === 'user' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-black text-slate-900 truncate">{chat.user_email}</p>
                                <span className="text-[0.6rem] font-bold text-slate-400 uppercase">{format(new Date(chat.timestamp), 'HH:mm')}</span>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{chat.content}</p>
                            </div>
                            <button onClick={() => handleDelete('chat', chat.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200">
                        <h4 className="text-lg font-black mb-6 flex items-center gap-2 text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">Market Pulse</h4>
                        <div className="space-y-6">
                          <PulseItem label="Avg Listing Price" val="UGX 2,400" icon={Tag} />
                          <PulseItem label="Popular Crop" val="Maize" icon={ShoppingBag} />
                          <PulseItem label="Top District" val="Wakiso" icon={Users} />
                        </div>
                        <button onClick={() => setActiveTab('marketplace')} className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all border border-white/5">Go to Marketplace</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chats' && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">Interaction Vault</h2>
                      <p className="text-slate-500 text-sm font-medium">Secure record of all platform conversations</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">{adminData.chats.length} Logs</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[0.65rem] font-black uppercase text-slate-400 tracking-[0.2em] bg-slate-50/50">
                          <th className="px-8 py-5">Sender</th>
                          <th className="px-8 py-5">Role</th>
                          <th className="px-8 py-5 min-w-[300px]">Content</th>
                          <th className="px-8 py-5">Timestamp</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {adminData.chats.map((chat: any) => (
                          <tr key={chat.id} className="group hover:bg-slate-50/30 transition-all font-medium text-sm">
                            <td className="px-8 py-6 text-slate-900 font-bold">{chat.user_email}</td>
                            <td className="px-8 py-6">
                              <span className={`text-[0.6rem] font-black uppercase px-3 py-1.5 rounded-xl ${chat.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{chat.role}</span>
                            </td>
                            <td className="px-8 py-6 text-slate-600 leading-relaxed whitespace-pre-wrap max-w-lg">{chat.content}</td>
                            <td className="px-8 py-6 text-slate-400 text-xs font-bold">{format(new Date(chat.timestamp), 'MMM dd, HH:mm')}</td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => handleDelete('chat', chat.id)} className="p-3 bg-slate-50 group-hover:bg-red-50 text-slate-300 group-hover:text-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Farmer Directory</h2>
                    <div className="flex gap-2">
                      <span className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">{adminData.appUsers.length} MEMBERS</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[0.65rem] font-black uppercase text-slate-400 tracking-[0.2em] bg-slate-50/50">
                          <th className="px-8 py-6">Member Name</th>
                          <th className="px-8 py-6">Location</th>
                          <th className="px-8 py-6">Join Date</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {adminData.appUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/30 group">
                            <td className="px-8 py-6">
                              <div className="font-black text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                            </td>
                            <td className="px-8 py-6 text-slate-600 font-bold">{u.district || 'Unknown Area'}</td>
                            <td className="px-8 py-6 text-slate-400 text-xs font-bold tracking-tight">{format(new Date(u.created_at), 'MMMM dd, yyyy')}</td>
                            <td className="px-8 py-6 text-right flex justify-end gap-3 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setEditingItem({ type: 'app-user', item: u })} className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all"><Edit size={18} /></button>
                              <button onClick={() => handleDelete('app-user', u.id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Store className="text-emerald-500" /> Marketplace Roles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                      {adminData.marketplaceUsers.map((u: any) => (
                        <div key={u.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{u.name}</p>
                            <span className={`text-[0.6rem] font-black uppercase ${u.role === 'seller' ? 'text-emerald-500' : 'text-blue-500'}`}>{u.role}</span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 origin-right">
                            <button onClick={() => setEditingItem({ type: 'marketplace-user', item: u })} className="p-2.5 bg-white text-slate-400 hover:text-emerald-600 rounded-xl shadow-sm border border-slate-100"><Edit size={16} /></button>
                            <button onClick={() => handleDelete('marketplace-user', u.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-xl shadow-sm border border-slate-100"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <MarketTable label="Active Listings" data={adminData.listings} type="listing" icon={Tag} col="emerald" onEdit={(i: any) => setEditingItem({ type: 'listing', item: i })} onDelete={(id: string) => handleDelete('listing', id)} />
                    <MarketTable label="Buy Orders" data={adminData.orders} type="order" icon={ShoppingCart} col="blue" onEdit={(i: any) => setEditingItem({ type: 'order', item: i })} onDelete={(id: string) => handleDelete('order', id)} />
                  </div>

                  {/* TRADES LOG */}
                  <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><Handshake size={200} /></div>
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10"><Zap className="text-purple-400" /> Transaction Logs</h3>
                    <div className="space-y-4 relative z-10">
                      {adminData.trades.map((t: any) => (
                        <div key={t.id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center"><Handshake size={22} /></div>
                              <div>
                                <p className="font-black text-lg">{t.crop}</p>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t.quantity_kg}kg · UGX {t.agreed_price_per_kg}/kg</p>
                              </div>
                            </div>
                            <div className="flex flex-col md:items-end">
                              <p className="font-black text-xl text-emerald-400">UGX {t.total_value.toLocaleString()}</p>
                              <span className={`text-[0.6rem] font-black uppercase px-3 py-1 rounded-lg ${t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{t.status}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> <b>Buyer:</b> {t.buyer_name} ({t.buyer_district})</div>
                            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> <b>Seller:</b> {t.seller_name} ({t.seller_district})</div>
                          </div>
                        </div>
                      ))}
                      {adminData.trades.length === 0 && <p className="text-center py-10 text-white/20 font-bold italic">No matched trades found</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl relative shrink-0 overflow-hidden"
            >
              <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center"><Edit size={22} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Modify Asset</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{editingItem.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-200 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 sm:p-10 space-y-6">
                {editingItem.type.includes('user') && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                      <input type="text" value={editingItem.item.name} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Primary Email</label>
                      <input type="email" value={editingItem.item.email} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, email: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">{editingItem.type === 'app-user' ? 'Registered Location' : 'Market District'}</label>
                      <input type="text" value={editingItem.type === 'app-user' ? (editingItem.item.location || '') : (editingItem.item.district || '')}
                        onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, [editingItem.type === 'app-user' ? 'location' : 'district']: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                  </div>
                )}

                {(editingItem.type === 'listing' || editingItem.type === 'order') && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Product Description</label>
                      <input type="text" value={editingItem.item.crop} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, crop: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Stock (kg)</label>
                        <input type="number" value={editingItem.item.quantity_kg} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, quantity_kg: e.target.value } })}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">{editingItem.type === 'listing' ? 'UGX / kg' : 'Max UGX / kg'}</label>
                        <input type="number" value={editingItem.type === 'listing' ? editingItem.item.price_per_kg : editingItem.item.max_price_per_kg}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, [editingItem.type === 'listing' ? 'price_per_kg' : 'max_price_per_kg']: e.target.value } })}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-4.5 text-slate-600 font-black text-sm border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">ABORT</button>
                  <button type="submit" disabled={editLoading} className="flex-1 py-4.5 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2">
                    {editLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> COMMIT CHANGES</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, val, grow, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100'
  }
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-[1.5rem] ring-4 ring-offset-0 ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <span className={`text-[0.7rem] font-black px-3 py-1.5 rounded-full ring-1 ring-inset ${colors[color]}`}>{grow}</span>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{val}</p>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function PulseItem({ label, val, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50"><Icon size={18} /></div>
      <div>
        <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
        <p className="font-bold text-white tracking-tight">{val}</p>
      </div>
    </div>
  );
}

function MarketTable({ label, data, type, icon: Icon, col, onEdit, onDelete }: any) {
  const color = col === 'emerald' ? 'text-emerald-500 bg-emerald-50' : 'text-blue-500 bg-blue-50';
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
        <h4 className="font-black text-slate-900 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
          {label}
        </h4>
        <span className="text-[0.65rem] font-black text-slate-400 uppercase px-3 py-1 bg-slate-50 rounded-lg">{data.length} Total</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-50">
            {data.map((item: any) => (
              <tr key={item.id} className="group hover:bg-slate-50 transition-all">
                <td className="px-8 py-6">
                  <div className="font-black text-slate-900">{item.crop}</div>
                  <p className="text-[0.65rem] font-bold text-slate-400 truncate max-w-[150px] uppercase tracking-tighter">By {item.seller_name || item.buyer_name}</p>
                </td>
                <td className="px-8 py-6 text-sm font-black text-slate-700">{item.quantity_kg}kg</td>
                <td className="px-8 py-6 text-right space-x-2">
                  <button onClick={() => onEdit(item)} className="p-2.5 bg-slate-50 text-slate-300 hover:text-emerald-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Edit size={16} /></button>
                  <button onClick={() => onDelete(item.id)} className="p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-bold italic">No {label.toLowerCase()} available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
