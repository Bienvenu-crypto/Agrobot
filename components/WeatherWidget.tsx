'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, CloudFog, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { sendGAEvent } from '@next/third-parties/google';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  advice: string;
  weatherCode: number;
}

// Map WMO weather codes to conditions and advice
const getWeatherDetails = (code: number) => {
  if (code === 0) return { condition: 'Clear sky', advice: 'Great day for field work. Ensure crops are adequately watered.', icon: Sun };
  if (code === 1 || code === 2 || code === 3) return { condition: 'Partly cloudy', advice: 'Good conditions for most farming activities.', icon: Cloud };
  if (code === 45 || code === 48) return { condition: 'Fog', advice: 'Visibility is low. Delay spraying pesticides until fog clears.', icon: CloudFog };
  if (code >= 51 && code <= 67) return { condition: 'Rain', advice: 'Rain expected. Avoid spraying chemicals and applying fertilizer today.', icon: CloudRain };
  if (code >= 71 && code <= 77) return { condition: 'Snow', advice: 'Protect sensitive crops from frost.', icon: CloudSnow };
  if (code >= 80 && code <= 82) return { condition: 'Rain showers', advice: 'Showers expected. Good time for indoor farm planning.', icon: CloudRain };
  if (code >= 85 && code <= 86) return { condition: 'Snow showers', advice: 'Protect sensitive crops from frost.', icon: CloudSnow };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', advice: 'Seek shelter immediately. Do not work in open fields.', icon: CloudLightning };
  return { condition: 'Unknown', advice: 'Monitor local conditions.', icon: Cloud };
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;
    let lastFetchedCoords: { lat: number, lon: number } | null = null;

    const fetchWeather = async (lat: number, lon: number, locationName: string) => {
      try {
        setError(null);
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Weather API failed');
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        const current = data.current;
        const details = getWeatherDetails(current.weather_code);

        sendGAEvent({ event: 'weather_check', value: locationName });

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: details.condition,
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: Math.round(current.wind_speed_10m),
          location: locationName,
          advice: details.advice,
          weatherCode: current.weather_code
        });
      } catch (err) {
        console.error("Weather Error:", err);
        setError("Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    };

    const handlePositionUpdate = async (latitude: number, longitude: number) => {
      // Only fetch if we haven't fetched yet, or if the user moved significantly (e.g., > 0.01 degrees, roughly 1km)
      if (
        lastFetchedCoords &&
        Math.abs(lastFetchedCoords.lat - latitude) < 0.01 &&
        Math.abs(lastFetchedCoords.lon - longitude) < 0.01
      ) {
        return;
      }

      lastFetchedCoords = { lat: latitude, lon: longitude };

      let locationName = 'Your Location';
      try {
        const geoRes = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (!geoData.error) {
            locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.address?.state || 'Your Location';
          }
        }
      } catch (e) {
        console.error("Geocoding error", e);
      }

      fetchWeather(latitude, longitude, locationName);
    };

    setLoading(true);

    if (navigator.geolocation) {
      // Get initial position quickly
      navigator.geolocation.getCurrentPosition(
        (position) => handlePositionUpdate(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.warn("Geolocation denied or failed, falling back to Kampala", error);
          fetchWeather(0.31628, 32.58219, 'Kampala, Uganda');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Track position changes
      watchId = navigator.geolocation.watchPosition(
        (position) => handlePositionUpdate(position.coords.latitude, position.coords.longitude),
        (error) => console.warn("Watch position error:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      fetchWeather(0.31628, 32.58219, 'Kampala, Uganda');
    }

    // Refresh weather data every 5 minutes for the current location
    const interval = setInterval(() => {
      if (lastFetchedCoords) {
        // Force refresh by temporarily clearing last fetched coords
        const coords = { ...lastFetchedCoords };
        lastFetchedCoords = null;
        handlePositionUpdate(coords.lat, coords.lon);
      }
    }, 300000);

    return () => {
      clearInterval(interval);
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (loading && !weather) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center h-48 text-center">
        <CloudLightning className="text-red-400 mb-2" size={32} />
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <p className="text-xs text-red-400 mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const WeatherIcon = weather ? getWeatherDetails(weather.weatherCode).icon : Cloud;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={16} />
          <span className="text-sm font-medium">{weather?.location}</span>
        </div>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
          <WeatherIcon size={40} />
        </div>
        <div>
          <div className="text-4xl font-light text-gray-900">{weather?.temp}°C</div>
          <div className="text-sm text-gray-500 font-medium">{weather?.condition}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Thermometer size={16} className="text-emerald-500" />
          <span className="text-xs">Humidity: {weather?.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Wind size={16} className="text-emerald-500" />
          <span className="text-xs">Wind: {weather?.windSpeed} km/h</span>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">AgroBot Advice</h4>
        <p className="text-sm text-emerald-700 leading-relaxed">
          {weather?.advice}
        </p>
      </div>
    </motion.div>
  );
}
