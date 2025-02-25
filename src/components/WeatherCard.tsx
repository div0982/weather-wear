import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherCardProps {
  location: Location;
  onWeatherUpdate: (weather: WeatherData) => void;
}

export const WeatherCard = ({ location, onWeatherUpdate }: WeatherCardProps) => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${location.lat},${location.lng}&aqi=no`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        
        const weatherData: WeatherData = {
          temp: data.current.temp_c,
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph / 3.6 // Convert km/h to m/s
        };
        
        setWeather(weatherData);
        onWeatherUpdate(weatherData);
      } catch (error) {
        console.error('Error fetching weather:', error);
        toast.error("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
    }
  }, [location]);

  if (!location || loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = {
    "Clear": Sun,
    "Sunny": Sun,
    "PartlyCloudy": Cloud,
    "Cloudy": Cloud,
    "Overcast": Cloud,
    "Rain": CloudRain,
    "LightRain": CloudRain,
    "ModerateRain": CloudRain,
    "HeavyRain": CloudRain,
    "Snow": Cloud
  }[weather.condition.replace(/\s+/g, '')] || Cloud;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <WeatherIcon className="h-12 w-12 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold">{weather.temp}°C</h2>
          <p className="text-muted-foreground">{weather.condition}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>Humidity: {weather.humidity}%</div>
        <div>Wind: {weather.windSpeed.toFixed(1)} m/s</div>
      </div>
    </Card>
  );
};
