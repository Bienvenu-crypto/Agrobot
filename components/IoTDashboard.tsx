'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Droplets, ThermometerSun, Activity, Leaf, AlertTriangle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simulated initial data
const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 10; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moisture: Math.floor(Math.random() * 15) + 40, // 40-55%
      temperature: Math.floor(Math.random() * 5) + 22, // 22-27°C
      ph: (Math.random() * 1 + 6).toFixed(1), // 6.0-7.0
    });
  }
  return data;
};

export default function IoTDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setData(generateData());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const lastWarningTime = React.useRef<number>(0);

  useEffect(() => {
    if (!isSimulating || !isMounted || data.length === 0) return;

    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return prev;
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        
        // Add some random walk to the data
        const newMoisture = Math.max(0, Math.min(100, last.moisture + (Math.random() * 4 - 2)));
        const newTemp = Math.max(10, Math.min(40, last.temperature + (Math.random() * 2 - 1)));
        
        // Check for moisture warning and notify (once every 10 mins max)
        if (newMoisture < 30 && Date.now() - lastWarningTime.current > 600000) {
          lastWarningTime.current = Date.now();
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'alert',
              title: 'Critical Soil Moisture',
              message: `Soil moisture dropped to ${Math.round(newMoisture)}%. Immediate irrigation is recommended for your field.`
            })
          }).catch(() => {});
        }

        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          moisture: Math.round(newMoisture),
          temperature: Math.round(newTemp),
          ph: (parseFloat(last.ph) + (Math.random() * 0.2 - 0.1)).toFixed(1),
        });
        return newData;
      });
    }, 3000); // Update every 3 seconds for demo purposes

    return () => clearInterval(interval);
  }, [isSimulating, isMounted, data.length]);

  if (!isMounted || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium">Initializing sensors...</p>
        </div>
      </div>
    );
  }

  const current = data[data.length - 1];
  const moistureWarning = current.moisture < 30 || current.moisture > 70;

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            Field Sensors (IoT)
          </h2>
          <p className="text-sm text-slate-500">Real-time soil and environmental monitoring</p>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
            isSimulating ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <RefreshCw size={14} className={isSimulating ? 'animate-spin' : ''} />
          {isSimulating ? 'Live Syncing' : 'Paused'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Moisture Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-4 rounded-xl border ${moistureWarning ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${moistureWarning ? 'text-red-600' : 'text-blue-600'}`}>
              <Droplets size={18} />
              <span className="font-semibold text-sm">Soil Moisture</span>
            </div>
            {moistureWarning && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
          </div>
          <div className="text-3xl font-bold text-slate-800">{current.moisture}%</div>
          <div className={`text-xs mt-1 ${moistureWarning ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
            {moistureWarning ? 'Critical level! Irrigation needed.' : 'Optimal range (40-60%)'}
          </div>
        </motion.div>

        {/* Temperature Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-orange-50 border border-orange-100"
        >
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <ThermometerSun size={18} />
            <span className="font-semibold text-sm">Soil Temp</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{current.temperature}°C</div>
          <div className="text-xs text-slate-500 mt-1">Normal range (20-30°C)</div>
        </motion.div>

        {/* pH Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-100"
        >
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Leaf size={18} />
            <span className="font-semibold text-sm">Soil pH</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{current.ph}</div>
          <div className="text-xs text-slate-500 mt-1">Slightly acidic (Ideal for most crops)</div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <h3 className="text-sm font-bold text-slate-600 mb-4">Moisture & Temperature Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
            <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={12} domain={[0, 50]} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="moisture" 
              name="Moisture (%)"
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="temperature" 
              name="Temp (°C)"
              stroke="#f97316" 
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
