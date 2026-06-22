export interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  icon: string;
  condition: string;
  isRain: boolean;
  uvIndex?: number;
  windSpeed?: number;
  precipitationSum?: number;
}

export interface WeatherHour {
  time: string; // "2024-01-15T10:00"
  temp: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  icon: string;
  condition: string;
  isRain: boolean;
}

export interface WeatherForecast {
  lat: number;
  lng: number;
  daily: WeatherDay[];
  hourly: WeatherHour[];
  fetchedAt: string;
}
