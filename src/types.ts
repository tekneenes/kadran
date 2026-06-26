export interface MarketData {
  usdTry: number;
  eurTry: number;
  gbpTry: number;
  goldGramTry: number;
  usdTryPrev: number;
  eurTryPrev: number;
  gbpTryPrev: number;
  goldGramTryPrev: number;
  lastUpdated: string;
  loading: boolean;
  error: string | null;
}

export interface CityWeather {
  name: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  cityName: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  loading: boolean;
  error: string | null;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type TimerMode = 'focus' | 'break' | 'custom';
