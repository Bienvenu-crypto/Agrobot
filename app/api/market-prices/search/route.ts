import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { crop } = await req.json();

    if (!crop || typeof crop !== 'string') {
      return NextResponse.json({ error: 'Invalid crop name provided' }, { status: 400 });
    }

    const normalizedCrop = crop.trim().toLowerCase();

    // Check cache first
    const cached = db.prepare('SELECT data_json, updated_at FROM market_prices_cache WHERE crop_name = ?').get(normalizedCrop) as { data_json: string, updated_at: string } | undefined;
    
    if (cached) {
      // Check if cache is fresh (e.g., less than 24 hours old)
      const cacheTime = new Date(cached.updated_at).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return NextResponse.json(JSON.parse(cached.data_json), { status: 200 });
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    let data;
    
    if (!apiKey) {
      console.warn('Gemini API key is missing, using fallback mock data generator');
      data = generateMockData(crop);
    } else {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate realistic mock market price data for the crop: "${crop}" in Uganda (prices in UGX per KG).
Provide the current price, the percentage change over the last month (e.g., "+2.4%" or "-1.2%"), the overall trend ("up", "down", or "stable"), and historical prices for the last 6 months (Oct, Nov, Dec, Jan, Feb, Mar).`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                crop: { type: Type.STRING, description: 'The name of the crop (capitalized)' },
                price: { type: Type.NUMBER, description: 'Current price in UGX' },
                change: { type: Type.STRING, description: 'Percentage change' },
                trend: { type: Type.STRING, description: 'Trend: "up", "down", or "stable"' },
                historical: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING, description: 'Month abbreviation (e.g., "Oct")' },
                      price: { type: Type.NUMBER, description: 'Price in UGX' },
                    },
                    required: ['month', 'price'],
                  },
                  description: 'Historical prices for the last 6 months',
                },
              },
              required: ['crop', 'price', 'change', 'trend', 'historical'],
            },
          },
        });
        data = JSON.parse(response.text || '{}');
      } catch (aiError) {
        console.warn('Gemini API failed, using fallback mock data generator:', aiError);
        data = generateMockData(crop);
      }
    }

    // Save to cache
    db.prepare(`
      INSERT INTO market_prices_cache (crop_name, data_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(crop_name) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
    `).run(normalizedCrop, JSON.stringify(data));

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Market price search error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch market data' }, { status: 500 });
  }
}

function generateMockData(cropName: string) {
  // Generate a random base price between 500 and 5000
  const basePrice = Math.floor(Math.random() * 4500) + 500;
  
  // Generate a random trend
  const trends = ['up', 'down', 'stable'];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  
  // Generate a random percentage change
  const changeNum = (Math.random() * 10).toFixed(1);
  const change = trend === 'up' ? `+${changeNum}%` : trend === 'down' ? `-${changeNum}%` : '0.0%';
  
  // Generate historical data
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  let currentPrice = basePrice;
  
  // Reverse engineer historical prices based on trend
  const historical = months.map((month, index) => {
    // For the last month (Mar), use the base price
    if (index === 5) return { month, price: basePrice };
    
    // For previous months, adjust price based on trend to make it look realistic
    const variance = Math.floor(Math.random() * 200) - 100;
    let histPrice = basePrice;
    
    if (trend === 'up') {
      histPrice = basePrice - ((5 - index) * 50) + variance;
    } else if (trend === 'down') {
      histPrice = basePrice + ((5 - index) * 50) + variance;
    } else {
      histPrice = basePrice + variance;
    }
    
    // Ensure price doesn't go below 100
    return { month, price: Math.max(100, histPrice) };
  });
  
  // Capitalize crop name
  const capitalizedCrop = cropName.charAt(0).toUpperCase() + cropName.slice(1);
  
  return {
    crop: capitalizedCrop,
    price: basePrice,
    change,
    trend,
    historical
  };
}
