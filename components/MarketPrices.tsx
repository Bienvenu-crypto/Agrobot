'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, AlertCircle, Loader2, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sendGAEvent } from '@next/third-parties/google';

interface CropData {
  crop: string;
  price: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  historical: { month: string; price: number }[];
}

export default function MarketPrices() {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [marketData, setMarketData] = useState<CropData[]>([]);
  const [dataSource, setDataSource] = useState<string>('mock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/market-prices');

        let result;
        try {
          const text = await response.text();
          result = JSON.parse(text);
        } catch (e) {
          throw new Error(`Server returned an invalid response (${response.status}).`);
        }

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch market prices');
        }

        setMarketData(result.data);
        setDataSource(result.source);
        if (result.data && result.data.length > 0) {
          setSelectedCrop(result.data[0].crop);
          sendGAEvent({ event: 'market_trend_view', value: result.data[0].crop });

          // Send notification for top trending crop
          const topTrend = result.data.find((c: any) => c.trend === 'up');
          if (topTrend) {
            fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'info',
                title: 'Market Opportunity',
                message: `${topTrend.crop} prices are up ${topTrend.change}. It's a great time to list your harvest!`
              })
            }).catch(() => { });
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/market-prices/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crop: searchQuery }),
      });

      let data;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned an invalid response (${response.status}). Please try again later.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch market data for this crop');
      }

      setMarketData(prev => {
        const exists = prev.find(c => c.crop.toLowerCase() === data.crop.toLowerCase());
        if (exists) {
          return prev.map(c => c.crop.toLowerCase() === data.crop.toLowerCase() ? data : c);
        }
        return [data, ...prev];
      });

      setSelectedCrop(data.crop);
      setSearchQuery('');
      sendGAEvent({ event: 'market_trend_search', value: data.crop });
    } catch (err: any) {
      console.error('Search error:', err);
      alert(err.message || 'Failed to fetch market data for this crop');
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching market feeds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Unavailable</h3>
        <p className="text-gray-600 max-w-sm mb-6">{error}</p>
      </div>
    );
  }

  const currentCropData = marketData.find(c => c.crop === selectedCrop);

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            Market Intelligence
            <Info size={14} className="text-gray-400" />
          </h3>
          {dataSource === 'live' || dataSource === 'live_hdx' ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide uppercase">Live (WFP)</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold tracking-wide uppercase">WFP Data</span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">UGX / KG</span>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a crop (e.g., Coffee, Matooke)..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          disabled={isSearching}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Search
        </button>
      </form>

      <div className="space-y-2 mb-8">
        {marketData.map((item) => (
          <div
            key={item.crop}
            onClick={() => {
              setSelectedCrop(item.crop);
              sendGAEvent({ event: 'market_trend_view', value: item.crop });
            }}
            className={`flex items-center justify-between p-3 rounded-xl transition-colors border cursor-pointer ${selectedCrop === item.crop
                ? 'bg-indigo-50 border-indigo-100'
                : 'border-transparent hover:bg-gray-50 hover:border-black/5'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${item.trend === 'up' ? 'bg-emerald-500' :
                  item.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
              <span className={`font-medium ${selectedCrop === item.crop ? 'text-indigo-900' : 'text-gray-700'}`}>
                {item.crop}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-mono font-bold ${selectedCrop === item.crop ? 'text-indigo-900' : 'text-gray-900'}`}>
                {item.price.toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-xs font-bold ${item.trend === 'up' ? 'text-emerald-600' :
                  item.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                {item.trend === 'up' ? <TrendingUp size={12} /> :
                  item.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentCropData && currentCropData.historical && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">{selectedCrop} - 6 Month Trend</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentCropData.historical}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis
                  hide
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
