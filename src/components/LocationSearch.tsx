import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  initialLocation?: { name: string; lat: number | null; lng: number | null };
}

interface LocationSuggestion {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const LocationSearch = ({ onLocationSelect, initialLocation }: LocationSearchProps) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLocation?.name) {
      setSearchQuery(initialLocation.name);
      if (!initialLocation.lat || !initialLocation.lng) {
        handleSearch(initialLocation.name);
      }
    }
  }, [initialLocation]);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error("Failed to fetch location suggestions");

      const data = await response.json();
      setSuggestions(data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error("Failed to fetch location data");

      const data = await response.json();

      if (data.length > 0) {
        const location = data[0];
        onLocationSelect({
          name: location.name,
          lat: location.lat,
          lng: location.lon,
        });
        setSearchQuery(location.name);
        setOpen(false);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      toast.error("Failed to search location");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    onLocationSelect({
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lon,
    });
    setSearchQuery(suggestion.name);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder="Enter a location..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setOpen(true)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 w-full"
          />
          {suggestions.length > 0 && open && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50">
              <div className="py-1">
                {suggestions.map((suggestion) => (
                  <div
                    key={`${suggestion.lat}-${suggestion.lon}`}
                    onClick={() => handleSelectLocation(suggestion)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {suggestion.name}, {suggestion.country}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Button type="submit" disabled={loading} onClick={() => handleSearch(searchQuery)}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
      </Button>
    </div>
  );
};
