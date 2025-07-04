import axios from "axios";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}


interface LocationData {
  city: string;
  region: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async detectLocation(): Promise<LocationData> {
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const key = import.meta.env.VITE_OPENCAGE_API_KEY;
      if (!key) {
        throw new Error('VITE_OPENCAGE_API_KEY is missing');
      }

      // Use reverse geocoding to get location details
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`,
      );

      const result = response.data.results[0];

      this.currentLocation = {
        city: result.components.city || result.components.town,
        region: result.components.state,
        country: result.components.country,
        timezone: result.annotations.timezone.name,
        latitude,
        longitude,
      };

      return this.currentLocation;
    } catch (error) {
      console.error("Error detecting location:", error);
      throw error;
    }
  }

  async getWeather(): Promise<WeatherData> {
    if (!this.currentLocation) {
      throw new Error("Location not set");
    }

    try {
      const weatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!weatherKey) {
        throw new Error("VITE_OPENWEATHER_API_KEY is missing");
      }

      const { latitude, longitude } = this.currentLocation;

      const currentResponse = await axios.get(
        `https://pro.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${weatherKey}`,
      );

      const forecastResponse = await axios.get(
        `https://pro.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=5&units=metric&appid=${weatherKey}`,
      );

      return {
        temperature: currentResponse.data.main.temp,
        condition: currentResponse.data.weather[0].description,
        icon: `http://openweathermap.org/img/wn/${currentResponse.data.weather[0].icon}@2x.png`,
        forecast: forecastResponse.data.list.map((day: any) => ({
          date: new Date(day.dt * 1000).toISOString(),
          high: day.temp.max,
          low: day.temp.min,
          condition: day.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
        })),
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw error;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }

  getStoredLocation(): LocationData | null {
    return this.currentLocation;
  }
}

export const locationService = LocationService.getInstance();
