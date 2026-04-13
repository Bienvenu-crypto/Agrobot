'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, CheckCircle2, ShoppingBag, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  timestamp: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click Outside logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, readAll: !id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade_match': return <ShoppingBag size={14} className="text-emerald-600" />;
      case 'alert': return <AlertCircle size={14} className="text-red-500" />;
      case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer p-2 text-slate-400 hover:text-emerald-600 transition-all active:scale-95 relative group"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] flex flex-col pointer-events-auto"
          >
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={() => markAsRead()} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-all">
                  Read All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${n.is_read === 0 ? 'bg-emerald-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.is_read === 0 ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-xs truncate ${n.is_read === 0 ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>
                              {n.title}
                            </p>
                            <span className="text-[9px] font-bold text-slate-400">
                              {format(new Date(n.timestamp), 'HH:mm')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bell size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold italic tracking-tight">Your notification vault is empty</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                View Full Inbox
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
