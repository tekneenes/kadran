import React, { useState, useEffect } from 'react';
import { CityWeather, WeatherData } from '../types';
import { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning, MapPin, Wind, Droplets, Settings } from 'lucide-react';

const TURKEY_CITIES: CityWeather[] = [
  { name: 'İstanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'İzmir', latitude: 38.4192, longitude: 27.1287 },
  { name: 'Antalya', latitude: 36.8969, longitude: 30.7133 },
  { name: 'Bursa', latitude: 40.1828, longitude: 29.0665 },
  { name: 'Trabzon', latitude: 41.0027, longitude: 39.7168 },
];

interface WeatherWidgetProps {
  onOpenSettings?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onOpenSettings }) => {
  const [selectedCity, setSelectedCity] = useState<CityWeather>(TURKEY_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData>({
    cityName: TURKEY_CITIES[0].name,
    temp: 22,
    apparentTemp: 22,
    humidity: 60,
    weatherCode: 1,
    isDay: true,
    loading: true,
    error: null,
  });

  const fetchWeather = async (city: CityWeather) => {
    try {
      setWeather((prev) => ({ ...prev, loading: true, error: null }));
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Hava durumu verisi alınamadı');
      const data = await res.json();
      
      const current = data.current;
      setWeather({
        cityName: city.name,
        temp: current.temperature_2m,
        apparentTemp: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setWeather((prev) => ({
        ...prev,
        loading: false,
        error: 'Bağlantı hatası',
      }));
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  // Map WMO weather code to icon and Turkish text
  const getWeatherDetails = (code: number) => {
    const sizeClass = "w-5 h-5";
    switch (code) {
      case 0:
        return { text: 'Güneşli', icon: <Sun className={`${sizeClass} text-amber-400`} /> };
      case 1:
      case 2:
        return { text: 'Az Bulutlu', icon: <CloudSun className={`${sizeClass} text-amber-300`} /> };
      case 3:
        return { text: 'Bulutlu', icon: <Cloud className={`${sizeClass} text-zinc-400`} /> };
      case 45:
      case 48:
        return { text: 'Sisli', icon: <CloudFog className={`${sizeClass} text-zinc-500`} /> };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return { text: 'Çisenti', icon: <CloudDrizzle className={`${sizeClass} text-blue-300`} /> };
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return { text: 'Yağmurlu', icon: <CloudRain className={`${sizeClass} text-blue-400`} /> };
      case 71:
      case 73:
      case 75:
      case 77:
        return { text: 'Karlı', icon: <Snowflake className={`${sizeClass} text-sky-200 animate-pulse`} /> };
      case 80:
      case 81:
      case 82:
        return { text: 'Sağanak', icon: <CloudRain className={`${sizeClass} text-sky-400 animate-bounce`} /> };
      case 95:
      case 96:
      case 99:
        return { text: 'Fırtına', icon: <CloudLightning className={`${sizeClass} text-yellow-500`} /> };
      default:
        return { text: 'Bulutlu', icon: <Cloud className={`${sizeClass} text-zinc-400`} /> };
    }
  };

  const details = getWeatherDetails(weather.weatherCode);

  return (
    <div className="flex items-center gap-3 p-2.5 bg-zinc-950/50 backdrop-blur-md rounded-xl border border-zinc-800/40 shadow-lg paper-texture-card w-full md:w-[350px] xl:w-[410px] h-[72px] xl:h-[82px] overflow-hidden select-none">
      
      {/* City & Temperature Side */}
      <div className="flex flex-col justify-center pr-3 border-r border-zinc-800/60 shrink-0 h-full min-w-[100px] xl:min-w-[115px]">
        {weather.loading ? (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-mono text-[10px] text-zinc-500">...</span>
          </div>
        ) : (
          <span className="font-display text-lg sm:text-xl xl:text-2xl font-bold tracking-tight text-zinc-100">
            {Math.round(weather.temp)}°C
          </span>
        )}
        
        {/* City Select */}
        <div className="flex items-center gap-1 text-zinc-400 mt-0.5">
          <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
          <select
            value={selectedCity.name}
            onChange={(e) => {
              const city = TURKEY_CITIES.find((c) => c.name === e.target.value);
              if (city) setSelectedCity(city);
            }}
            className="bg-transparent text-[9px] xl:text-[10px] font-mono font-bold text-zinc-400 border-none focus:outline-none focus:ring-0 cursor-pointer pr-1 leading-none uppercase"
          >
            {TURKEY_CITIES.map((city) => (
              <option key={city.name} value={city.name} className="bg-zinc-900 text-zinc-300 text-xs">
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Details Side */}
      <div className="flex-1 flex items-center justify-between pl-1 h-full">
        {weather.loading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="w-3.5 h-3.5 border border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
            <span className="text-[9px] font-mono text-zinc-500">Yükleniyor...</span>
          </div>
        ) : weather.error ? (
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-mono text-rose-400 leading-none">Hata</span>
            <button onClick={() => fetchWeather(selectedCity)} className="text-[8px] font-mono text-zinc-500 underline mt-1">Yenile</button>
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full w-full">
            {/* Condition Icon and Label */}
            <div className="flex items-center gap-1.5 text-[10px] xl:text-[11px] text-zinc-400 font-mono font-bold tracking-wider uppercase mb-0.5">
              {details.icon}
              <span className="text-zinc-300">{details.text}</span>
            </div>

            {/* Humidity & Apparent temp */}
            <div className="flex items-center gap-3 font-mono text-[10px] xl:text-[11px] text-zinc-500">
              <span className="flex items-center gap-0.5">
                <Droplets className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-blue-400/80" /> %{weather.humidity}
              </span>
              <span className="flex items-center gap-0.5">
                <Wind className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-emerald-400/80" /> Hiss. {Math.round(weather.apparentTemp)}°C
              </span>
            </div>
          </div>
        )}

        {/* Mini Actions: Refresh and Settings */}
        <div className="flex items-center gap-1.5 shrink-0 self-center pl-1">
          {!weather.loading && (
            <button
              onClick={() => fetchWeather(selectedCity)}
              title="Yenile"
              className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg border border-zinc-800/50 transition-all cursor-pointer active:scale-90"
            >
              <Wind className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onOpenSettings}
            title="Ayarlar"
            className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg border border-zinc-800/50 transition-all cursor-pointer active:scale-90"
            id="weather-settings-btn"
          >
            <Settings className="w-3 h-3 text-amber-500" />
          </button>
        </div>
      </div>

    </div>
  );
};
