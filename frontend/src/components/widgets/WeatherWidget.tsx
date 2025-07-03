import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Loader } from "lucide-react";
import { locationService } from "@/services/location";
import { format } from "date-fns-tz";

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

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const loadLocationAndWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const locationData = await locationService.detectLocation();
        setLocation(locationData);

        const weatherData = await locationService.getWeather();
        setWeather(weatherData);
      } catch (err) {
        setError("Failed to load weather data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLocationAndWeather();
  }, []);

  useEffect(() => {
    if (location?.timezone) {
      const updateTime = () => {
        const now = new Date();
        setCurrentTime(
          format(now, "HH:mm:ss", { timeZone: location.timezone }),
        );
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-6">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 text-hyphae-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg p-6">
        <div className="text-fungal-300">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-dark-200/80 backdrop-blur-sm rounded-xl border border-dark-100/50 shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {location?.city}, {location?.region}
            </h2>
            <p className="text-gray-400 text-sm">{location?.country}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{currentTime}</p>
            <p className="text-gray-400 text-sm">{location?.timezone}</p>
          </div>
        </div>

        {weather && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img
                  src={weather.icon}
                  alt={weather.condition}
                  className="w-16 h-16 mr-4"
                />
                <div>
                  <p className="text-3xl font-bold text-white">
                    {weather.temperature}°C
                  </p>
                  <p className="text-gray-400">{weather.condition}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              {weather.forecast.slice(1).map((day) => (
                <div
                  key={day.date}
                  className="text-center p-2 bg-dark-300/50 rounded-lg"
                >
                  <p className="text-gray-400 text-sm mb-2">
                    {format(new Date(day.date), "EEE")}
                  </p>
                  <img
                    src={day.icon}
                    alt={day.condition}
                    className="w-8 h-8 mx-auto mb-2"
                  />
                  <p className="text-white font-medium">{day.high}°</p>
                  <p className="text-gray-400 text-sm">{day.low}°</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
