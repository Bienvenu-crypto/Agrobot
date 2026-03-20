import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  const locationKey = `${lat},${lon}`;

  try {
    // Check cache first
    const cached = db.prepare('SELECT data_json, updated_at FROM weather_cache WHERE location_key = ?').get(locationKey) as { data_json: string, updated_at: string } | undefined;
    
    if (cached) {
      // Check if cache is fresh (e.g., less than 1 hour old for weather)
      const cacheTime = new Date(cached.updated_at).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        return NextResponse.json(JSON.parse(cached.data_json));
      }
    }

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();

    // Save to cache
    db.prepare(`
      INSERT INTO weather_cache (location_key, data_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(location_key) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP
    `).run(locationKey, JSON.stringify(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    
    // Fallback to stale cache if available
    try {
      const staleCached = db.prepare('SELECT data_json FROM weather_cache WHERE location_key = ?').get(locationKey) as { data_json: string } | undefined;
      if (staleCached) {
        const parsed = JSON.parse(staleCached.data_json);
        parsed._isStale = true;
        return NextResponse.json(parsed);
      }
    } catch (e) {
      // Ignore cache fallback errors
    }

    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
