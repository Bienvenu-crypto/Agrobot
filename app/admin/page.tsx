'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Users, Shield, LogOut, Search, Calendar, Trash2, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface ChatRecord {
  id: string;
  user_email: string;
  role: string;
  content: string;
  image_url: string | null;
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ totalMessages: 0, uniqueUsers: 0 });
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'agrobot-admin-2026') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    router.push('/');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?secret=agrobot-admin-2026`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data.stats);
      setChats(data.recentChats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Back to App
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
              <Shield size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">AgroBot Admin</h1>
          <p className="text-slate-500 text-center mb-8 text-sm">Enter password to access the dashboard</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Shield size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight">Admin Console</span>
        </div>

        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all mb-4">
          <ArrowLeft size={18} />
          Back to App
        </Link>

        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-600 rounded-xl font-medium">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <MessageSquare size={18} />
            Chat Logs
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <Users size={18} />
            User Management
          </a>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-all mt-auto"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 lg:hidden">
              <Link href="/" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <Shield size={18} />
              </div>
              <span className="font-bold text-slate-900">Admin Console</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 text-sm hidden md:block">Real-time monitoring of AgroBot interactions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-2 text-sm text-slate-500">
              <Calendar size={16} />
              {format(new Date(), 'MMM dd, yyyy')}
            </div>
            <button 
              onClick={handleLogout}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalMessages}</div>
            <div className="text-sm text-slate-500">Total Messages</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.uniqueUsers}</div>
            <div className="text-sm text-slate-500">Unique Farmers</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Zap size={24} />
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">99.9%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">Active</div>
            <div className="text-sm text-slate-500">System Status</div>
          </div>
        </div>

        {/* Recent Chats Table */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Interactions</h2>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Search logs..." className="bg-transparent border-none text-xs outline-none w-32" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="px-6 py-4">Farmer Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Message Content</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {chats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{chat.user_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        chat.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {chat.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {chat.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {chat.timestamp && !isNaN(new Date(chat.timestamp).getTime()) 
                        ? format(new Date(chat.timestamp), 'MMM dd, HH:mm') 
                        : (typeof chat.timestamp === 'string' && !isNaN(new Date(chat.timestamp.replace(' ', 'T') + 'Z').getTime())
                          ? format(new Date(chat.timestamp.replace(' ', 'T') + 'Z'), 'MMM dd, HH:mm')
                          : 'N/A')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {chats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No chat logs found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
