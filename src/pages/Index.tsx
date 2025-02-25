import { useEffect, useState } from "react";
import { WeatherCard } from "@/components/WeatherCard";
import { AvatarBuilder } from "@/components/AvatarBuilder";
import { LocationSearch } from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SnowBackground } from "@/components/SnowBackground";
import { WeatherAnalysis } from "@/components/WeatherAnalysis";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { saveOutfit } from "@/lib/outfits";
import { LogOut, FolderOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

const Analyzer = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedInnerLayers, setSelectedInnerLayers] = useState<Set<string>>(new Set());
  const [selectedOuterLayers, setSelectedOuterLayers] = useState<Set<string>>(new Set());
  const [shouldShowAnalysis, setShouldShowAnalysis] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Redirect to welcome page if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load saved outfit if provided in navigation state
  useEffect(() => {
    if (state?.outfit) {
      const { location: savedLocation, weather: savedWeather, innerLayers, outerLayers } = state.outfit;
      
      // Set all states at once to prevent flickering
      setLocation(savedLocation);
      if (savedWeather) {
        setWeather(savedWeather);
      }
      setSelectedInnerLayers(new Set<string>(innerLayers || []));
      setSelectedOuterLayers(new Set<string>(outerLayers || []));
      setShouldShowAnalysis(true);
      
      // Clear the state after loading
      navigate('/analyzer', { replace: true, state: undefined });
    }
  }, [state, navigate]);

  // Only reset analysis when location or weather changes, not when layers change
  useEffect(() => {
    setShouldShowAnalysis(false);
  }, [location, weather]);

  const handleAnalyze = () => {
    if (!location || !weather) {
      toast.error("Please select a location first");
      return;
    }
    if (selectedInnerLayers.size === 0 && selectedOuterLayers.size === 0) {
      toast.error("Please select at least one clothing item");
      return;
    }
    setShouldShowAnalysis(true);
  };

  const handleSaveOutfit = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!location || !weather) {
      toast.error("Please select a location first");
      return;
    }

    if (selectedInnerLayers.size === 0 && selectedOuterLayers.size === 0) {
      toast.error("Please select at least one clothing item");
      return;
    }

    try {
      console.log('Saving outfit with data:', {
        userId: user.uid,
        city: location.name,
        weather,
        innerLayers: Array.from(selectedInnerLayers),
        outerLayers: Array.from(selectedOuterLayers)
      });

      await saveOutfit({
        userId: user.uid,
        city: location.name,
        weather,
        innerLayers: Array.from(selectedInnerLayers),
        outerLayers: Array.from(selectedOuterLayers)
      });
      
      toast.success("Outfit saved successfully!");
    } catch (error) {
      console.error('Detailed save error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        fullError: JSON.stringify(error, null, 2)
      });
      toast.error(error instanceof Error ? error.message : "Failed to save outfit");
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="relative min-h-screen">
      <SnowBackground />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              WeatherWear
            </h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/saved-outfits')}>
                <FolderOpen className="mr-2 h-4 w-4" />
                See Outfits
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <LocationSearch 
                onLocationSelect={setLocation}
                initialLocation={state?.outfit?.location}
              />
              {location && <WeatherCard location={location} onWeatherUpdate={setWeather} />}
              {location && weather && shouldShowAnalysis && (
                <WeatherAnalysis
                  city={location.name}
                  weather={weather}
                  selectedInnerLayers={selectedInnerLayers}
                  selectedOuterLayers={selectedOuterLayers}
                />
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
              <AvatarBuilder 
                onInnerLayersChange={setSelectedInnerLayers}
                onOuterLayersChange={setSelectedOuterLayers}
                onAnalyze={handleAnalyze}
                onSave={handleSaveOutfit}
                isAuthenticated={!!user}
                initialInnerLayers={selectedInnerLayers}
                initialOuterLayers={selectedOuterLayers}
              />
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Analyzer;
