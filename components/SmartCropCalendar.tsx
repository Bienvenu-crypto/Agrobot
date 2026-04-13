'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Loader2, CheckCircle2, Clock, AlertCircle, Sprout, Droplets, Bug, Sun } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Task {
  date: string;
  phase: string;
  task: string;
  description: string;
  isCritical: boolean;
}

interface CalendarData {
  tasks: Task[];
  estimatedYieldDate: string;
  generalAdvice: string;
}

export default function SmartCropCalendar() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    crop: 'Maize',
    plantingDate: new Date().toISOString().split('T')[0],
    region: 'Central Uganda',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as an expert agronomist. I am planting ${formData.crop} in ${formData.region} on ${formData.plantingDate}. 
      
Generate a detailed, chronological crop management calendar. 
Include specific estimated dates (calculated from the planting date) for key phases like:
- Germination/Emergence
- Weeding
- Fertilizer application
- Pest/Disease scouting
- Harvesting

Make the advice highly actionable for a smallholder farmer.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING, description: "Estimated date (e.g., Oct 15, 2026)" },
                    phase: { type: Type.STRING, description: "Crop growth phase (e.g., Germination, Vegetative, Flowering)" },
                    task: { type: Type.STRING, description: "Specific action required (e.g., First Weeding)" },
                    description: { type: Type.STRING, description: "Brief details on how to do it" },
                    isCritical: { type: Type.BOOLEAN, description: "True if this task is critical for yield" }
                  },
                  required: ["date", "phase", "task", "description", "isCritical"]
                }
              },
              estimatedYieldDate: { type: Type.STRING, description: "Estimated harvest date (e.g., Jan 20, 2027)" },
              generalAdvice: { type: Type.STRING, description: "One paragraph of general advice for this crop in this region" }
            },
            required: ["tasks", "estimatedYieldDate", "generalAdvice"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      const parsedData = JSON.parse(jsonStr) as CalendarData;
      setData(parsedData);
    } catch (err) {
      console.error("Calendar Error:", err);
      setError("An error occurred while generating the calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPhaseIcon = (phase: string) => {
    const p = phase.toLowerCase();
    if (p.includes('germination') || p.includes('emergence')) return <Sprout size={16} />;
    if (p.includes('vegetative') || p.includes('weeding')) return <Droplets size={16} />;
    if (p.includes('pest') || p.includes('disease')) return <Bug size={16} />;
    if (p.includes('flowering') || p.includes('harvest')) return <Sun size={16} />;
    return <Clock size={16} />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Calendar size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Smart Crop Calendar</h2>
          <p className="text-sm text-slate-500">AI-generated timeline for planting, maintenance, and harvesting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Crop Type</label>
              <input
                type="text"
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                placeholder="e.g., Maize, Beans, Coffee"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Planting Date</label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Central Uganda"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
              {loading ? 'Generating Schedule...' : 'Generate Calendar'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4 border border-red-100 flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p className="text-sm max-w-xs">Enter your crop details to generate a customized, week-by-week farming schedule.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-indigo-400 text-center bg-indigo-50/50 rounded-xl border border-indigo-100 p-6">
              <Loader2 size={40} className="mb-4 animate-spin opacity-50" />
              <p className="text-sm font-medium text-indigo-800">Analyzing crop cycles and regional data...</p>
            </div>
          )}

          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-bold text-indigo-900">Estimated Harvest</h3>
                  <p className="text-indigo-700 text-sm">{data.estimatedYieldDate}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-indigo-100 text-sm text-indigo-800 max-w-md">
                  <span className="font-bold block mb-1">Agronomist Note:</span>
                  {data.generalAdvice}
                </div>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                {data.tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6"
                  >
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${task.isCritical ? 'bg-red-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                      {getPhaseIcon(task.phase)}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                          {task.date}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${task.isCritical ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {task.phase}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
                        {task.task}
                        {task.isCritical && <AlertCircle size={16} className="text-red-500" />}
                      </h4>
                      <p className="text-slate-600 text-sm">{task.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
