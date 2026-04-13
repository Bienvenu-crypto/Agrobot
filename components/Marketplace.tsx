'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  ShoppingCart,
  Plus,
  X,
  LogIn,
  UserPlus,
  LogOut,
  TrendingUp,
  TrendingDown,
  Handshake,
  Package,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Sprout,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MpUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district: string;
  role: 'seller' | 'buyer';
}

interface Listing {
  id: string;
  seller_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  description: string | null;
  status: string;
  created_at: string;
  seller_name: string;
  seller_district: string;
  seller_phone: string | null;
}

interface BuyOrder {
  id: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  max_price_per_kg: number;
  description: string | null;
  status: string;
  created_at: string;
  buyer_name: string;
  buyer_district: string;
  buyer_phone: string | null;
}

interface Trade {
  id: string;
  crop: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_value: number;
  status: string;
  created_at: string;
  seller_name: string;
  seller_phone: string | null;
  seller_district: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_district: string;
  seller_id: string;
  buyer_id: string;
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({
  onClose,
  onSuccess,
  defaultRole,
}: {
  onClose: () => void;
  onSuccess: (user: MpUser) => void;
  defaultRole: 'seller' | 'buyer';
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'seller' | 'buyer'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'signup'
          ? '/api/marketplace/auth/register'
          : '/api/marketplace/auth/login';

      const body =
        mode === 'signup'
          ? { ...form, role }
          : { email: form.email, password: form.password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleColor = role === 'seller' ? 'emerald' : 'blue';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Role selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            {(['seller', 'buyer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${role === r
                    ? r === 'seller'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {r === 'seller' ? <><Store className="inline w-3.5 h-3.5 mr-1" /> Seller</> : <><ShoppingCart className="inline w-3.5 h-3.5 mr-1" /> Buyer</>}
              </button>
            ))}
          </div>

          <div className={`flex justify-center mb-4`}>
            <div className={`p-3 rounded-2xl ${role === 'seller' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {role === 'seller' ? <Store size={28} /> : <ShoppingCart size={28} />}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">
            {mode === 'login' ? 'Welcome back' : `Join as a ${role}`}
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm">
            {mode === 'login'
              ? `Sign in to your ${role} account`
              : role === 'seller'
                ? 'List your crops and connect with buyers'
                : 'Find the best crop deals from local farmers'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">District</label>
                    <input
                      type="text"
                      required
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                      placeholder="e.g. Wakiso"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Manual district entry</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                      placeholder="+256 700..."
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex gap-2 items-start">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${role === 'seller' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className={`font-bold hover:underline ${role === 'seller' ? 'text-emerald-600' : 'text-blue-600'}`}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

          {mode === 'signup' && (
            <p className="mt-3 text-center text-xs text-slate-400">
              💡 You can create both a seller and buyer account using the same email.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Listing Modal ───────────────────────────────────────────────────────
function AddListingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop: '', quantity_kg: '', price_per_kg: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          price_per_kg: parseFloat(form.price_per_kg),
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><Package size={22} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Listing</h2>
            <p className="text-xs text-slate-500">Post your crop for sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
            <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="e.g. Maize, Coffee, Matooke" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price/kg (UGX)</label>
              <input type="number" required min="1" value={form.price_per_kg} onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="1200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
              rows={2} placeholder="Grade A, freshly harvested..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Post Listing
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Add Buy Order Modal ─────────────────────────────────────────────────────
function AddBuyOrderModal({
  onClose,
  onSuccess,
  prefillCrop,
}: {
  onClose: () => void;
  onSuccess: (trade: Trade | null) => void;
  prefillCrop?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop: prefillCrop || '', quantity_kg: '', max_price_per_kg: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/buy-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          max_price_per_kg: parseFloat(form.max_price_per_kg),
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.trade);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><ShoppingCart size={22} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Buy Order</h2>
            <p className="text-xs text-slate-500">Request a crop — we'll find a match automatically</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
            <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="e.g. Maize, Coffee, Matooke" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Max Price/kg (UGX)</label>
              <input type="number" required min="1" value={form.max_price_per_kg} onChange={e => setForm({ ...form, max_price_per_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="1500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              rows={2} placeholder="Preferred grade, delivery notes..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Submit Buy Order
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Trade Success Toast ─────────────────────────────────────────────────────
function TradeToast({ trade, onDismiss }: { trade: Trade; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-emerald-100 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 flex-shrink-0">
          <Handshake size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm">🎉 Trade Matched!</p>
          <p className="text-xs text-slate-600 mt-1">
            <strong>{trade.quantity_kg} kg of {trade.crop}</strong> at UGX {trade.agreed_price_per_kg.toLocaleString()}/kg
          </p>
          <p className="text-xs text-emerald-700 font-bold mt-1">
            Total: UGX {trade.total_value.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
            <Phone size={10} />
            <span>Seller: {trade.seller_name} — {trade.seller_phone || 'No phone'}</span>
          </div>
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X size={16} /></button>
      </div>
    </motion.div>
  );
}

// ─── Main Marketplace Component ───────────────────────────────────────────────
export default function Marketplace() {
  const [mpUser, setMpUser] = useState<MpUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'buy-orders' | 'trades'>('browse');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<'seller' | 'buyer'>('seller');
  const [showAddListing, setShowAddListing] = useState(false);
  const [showAddBuyOrder, setShowAddBuyOrder] = useState(false);
  const [prefillCrop, setPrefillCrop] = useState('');
  const [tradeToast, setTradeToast] = useState<Trade | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch('/api/marketplace/auth/session')
      .then(r => r.json())
      .then(d => { setMpUser(d.user); setLoadingUser(false); })
      .catch(() => setLoadingUser(false));
  }, []);

  const fetchListings = useCallback(async () => {
    const res = await fetch('/api/marketplace/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }, []);

  const fetchBuyOrders = useCallback(async () => {
    const res = await fetch('/api/marketplace/buy-orders');
    const data = await res.json();
    setBuyOrders(data.orders || []);
  }, []);

  const fetchTrades = useCallback(async () => {
    const res = await fetch('/api/marketplace/trades');
    const data = await res.json();
    setTrades(data.trades || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    await Promise.all([fetchListings(), fetchBuyOrders(), ...(mpUser ? [fetchTrades()] : [])]);
    setLoadingData(false);
  }, [fetchListings, fetchBuyOrders, fetchTrades, mpUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = async () => {
    await fetch('/api/marketplace/auth/session', { method: 'DELETE' });
    setMpUser(null);
    setActiveTab('browse');
    setTrades([]);
  };

  const markTradeCompleted = async (tradeId: string) => {
    try {
      const res = await fetch('/api/marketplace/trades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tradeId, status: 'completed' }),
      });
      if (res.ok) {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'completed' } : t));
      }
    } catch (err) {
      console.error('Failed to complete trade');
    }
  };

  const cancelListing = async (id: string) => {
    await fetch('/api/marketplace/listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchListings();
  };

  const cancelBuyOrder = async (id: string) => {
    await fetch('/api/marketplace/buy-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchBuyOrders();
  };

  const myListings = listings.filter(l => mpUser && l.seller_id === mpUser.id);
  const myBuyOrders = buyOrders.filter(o => mpUser && o.buyer_id === mpUser.id);

  if (loadingUser) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={(user) => { setMpUser(user); fetchAll(); }}
            defaultRole={authRole}
          />
        )}
        {showAddListing && (
          <AddListingModal
            onClose={() => setShowAddListing(false)}
            onSuccess={() => { fetchListings(); setActiveTab('my-listings'); }}
          />
        )}
        {showAddBuyOrder && (
          <AddBuyOrderModal
            onClose={() => setShowAddBuyOrder(false)}
            prefillCrop={prefillCrop}
            onSuccess={(trade) => {
              fetchAll();
              if (trade) setTradeToast(trade);
              setActiveTab('trades');
            }}
          />
        )}
        {tradeToast && (
          <TradeToast trade={tradeToast} onDismiss={() => setTradeToast(null)} />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Store size={22} />
                <h3 className="text-xl font-bold">AgroMarket</h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
              <p className="text-emerald-100 text-sm">
                Connect sellers and buyers — trade crops at fair market prices
              </p>
            </div>

            {mpUser ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-sm">{mpUser.name}</p>
                  <p className="text-emerald-200 text-xs capitalize">{mpUser.role} · {mpUser.district}</p>
                </div>
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm border border-white/30">
                  {mpUser.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-white/20 rounded-xl transition-colors" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <Store size={13} /> Sell
                </button>
                <button
                  onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <ShoppingCart size={13} /> Buy
                </button>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 mt-4 text-xs">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{listings.length}</span>
              <span className="text-emerald-200 ml-1">listings</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{buyOrders.length}</span>
              <span className="text-emerald-200 ml-1">buy orders</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{trades.filter(t => t.status === 'pending' || t.status === 'completed').length}</span>
              <span className="text-emerald-200 ml-1">trades</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-black/5">
          {([
            { key: 'browse', label: 'Browse', icon: Eye },
            ...(mpUser?.role === 'seller' ? [{ key: 'my-listings', label: 'My Listings', icon: Package }] : []),
            ...(mpUser?.role === 'buyer' ? [{ key: 'buy-orders', label: 'My Orders', icon: ShoppingCart }] : []),
            ...(mpUser ? [{ key: 'trades', label: 'Trades', icon: Handshake }] : []),
          ] as { key: string; label: string; icon: any }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={fetchAll} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-colors" title="Refresh">
            <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="p-5">
          {/* BROWSE TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Active Listings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag size={15} className="text-emerald-600" /> Seller Listings
                  </h4>
                  {mpUser?.role === 'seller' && (
                    <button onClick={() => setShowAddListing(true)}
                      className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                      <Plus size={13} /> New Listing
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                      className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                      <UserPlus size={12} /> Sell your crops
                    </button>
                  )}
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No active listings yet</p>
                    <p className="text-xs mt-1">Be the first seller to list a crop!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {listings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                            <Sprout size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{listing.crop}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <MapPin size={10} /> {listing.seller_district} · {listing.seller_name}
                              {listing.seller_phone && <><Phone size={10} /> {listing.seller_phone}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{listing.quantity_kg.toLocaleString()} kg</p>
                            <p className="text-xs text-emerald-700 font-bold">UGX {listing.price_per_kg.toLocaleString()}/kg</p>
                          </div>
                          {mpUser?.role === 'buyer' && (
                            <button
                              onClick={() => { setPrefillCrop(listing.crop); setShowAddBuyOrder(true); }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buy Orders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShoppingCart size={15} className="text-blue-600" /> Open Buy Orders
                  </h4>
                  {mpUser?.role === 'buyer' && (
                    <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                      <Plus size={13} /> New Order
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <UserPlus size={12} /> Post a buy order
                    </button>
                  )}
                </div>

                {buyOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No open buy orders</p>
                    <p className="text-xs mt-1">Post your crop requirements here</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {buyOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 flex-shrink-0">
                            <ShoppingCart size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{order.crop}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <MapPin size={10} /> {order.buyer_district} · {order.buyer_name}
                              {order.buyer_phone && <><Phone size={10} /> {order.buyer_phone}</>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">{order.quantity_kg.toLocaleString()} kg</p>
                          <p className="text-xs text-blue-700 font-bold">Max UGX {order.max_price_per_kg.toLocaleString()}/kg</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY LISTINGS TAB (seller) */}
          {activeTab === 'my-listings' && mpUser?.role === 'seller' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800">Your Listings ({myListings.length})</h4>
                <button onClick={() => setShowAddListing(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                  <Plus size={13} /> Add Listing
                </button>
              </div>
              {myListings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No listings yet</p>
                  <p className="text-sm mt-1">Add your first crop listing to start selling</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{listing.crop}</p>
                        <p className="text-xs text-slate-500">{listing.quantity_kg} kg · UGX {listing.price_per_kg.toLocaleString()}/kg</p>
                        {listing.description && <p className="text-xs text-slate-400 mt-0.5">{listing.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">{listing.status}</span>
                        <button onClick={() => cancelListing(listing.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY BUY ORDERS TAB (buyer) */}
          {activeTab === 'buy-orders' && mpUser?.role === 'buyer' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800">Your Buy Orders ({myBuyOrders.length})</h4>
                <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                  <Plus size={13} /> New Order
                </button>
              </div>
              {myBuyOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No buy orders yet</p>
                  <p className="text-sm mt-1">Post what you want to buy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBuyOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{order.crop}</p>
                        <p className="text-xs text-slate-500">{order.quantity_kg} kg · Max UGX {order.max_price_per_kg.toLocaleString()}/kg</p>
                        {order.description && <p className="text-xs text-slate-400 mt-0.5">{order.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${order.status === 'open' ? 'bg-blue-100 text-blue-700' : order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{order.status}</span>
                        {order.status === 'open' && (
                          <button onClick={() => cancelBuyOrder(order.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRADES TAB */}
          {activeTab === 'trades' && mpUser && (
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Your Trade History ({trades.length})</h4>
              {trades.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Handshake size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No trades yet</p>
                  <p className="text-sm mt-1">
                    {mpUser.role === 'buyer'
                      ? 'Post a buy order — it will automatically match with a seller listing.'
                      : 'When a buyer matches your listing, the trade will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.map(trade => {
                    const isSeller = trade.seller_id === mpUser.id;
                    return (
                      <motion.div key={trade.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSeller ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              <Handshake size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{trade.crop}</p>
                              <p className="text-xs text-slate-500">
                                {trade.quantity_kg} kg · UGX {trade.agreed_price_per_kg.toLocaleString()}/kg
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-slate-900 text-sm">UGX {trade.total_value.toLocaleString()}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${trade.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {trade.status}
                            </span>
                          </div>
                        </div>

                        {trade.status === 'pending' && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => markTradeCompleted(trade.id)}
                              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 size={13} />
                              Mark as Completed
                            </button>
                          </div>
                        )}
                        <div className={`mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-600`}>
                          {isSeller ? (
                            <>
                              <ShoppingCart size={12} className="text-blue-500" />
                              <span>Buyer: <strong>{trade.buyer_name}</strong> · {trade.buyer_district}</span>
                              {trade.buyer_phone && <span className="flex items-center gap-1"><Phone size={10} />{trade.buyer_phone}</span>}
                            </>
                          ) : (
                            <>
                              <Store size={12} className="text-emerald-500" />
                              <span>Seller: <strong>{trade.seller_name}</strong> · {trade.seller_district}</span>
                              {trade.seller_phone && <span className="flex items-center gap-1"><Phone size={10} />{trade.seller_phone}</span>}
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sign-in CTA (unauthenticated) */}
          {!mpUser && activeTab !== 'browse' && (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LogIn size={24} className="text-slate-400" />
              </div>
              <p className="font-bold text-slate-900 mb-1">Sign in to continue</p>
              <p className="text-sm text-slate-500 mb-4">Create a seller or buyer account to access this tab.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Join as Seller
                </button>
                <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                  Join as Buyer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
