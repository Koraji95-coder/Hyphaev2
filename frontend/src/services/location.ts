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

      // Use reverse geocoding to get location details
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`,
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
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${this.currentLocation.latitude},${this.currentLocation.longitude}&days=5`,
      );

      return {
        temperature: response.data.current.temp_c,
        condition: response.data.current.condition.text,
        icon: response.data.current.condition.icon,
        forecast: response.data.forecast.forecastday.map((day: any) => ({
          date: day.date,
          high: day.day.maxtemp_c,
          low: day.day.mintemp_c,
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
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
