import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOutfits, deleteOutfit, type SavedOutfit } from '@/lib/outfits';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, MapPin, Cloud, Shirt, ArrowLeft, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SnowBackground } from '@/components/SnowBackground';
import { useNavigate } from 'react-router-dom';

export const SavedOutfits = () => {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOutfits = async () => {
      if (!user) return;
      
      try {
        const userOutfits = await getUserOutfits(user.uid);
        setOutfits(userOutfits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error fetching outfits:', error);
        toast.error('Failed to load saved outfits');
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, [user]);

  const handleDelete = async (outfitId: string) => {
    try {
      await deleteOutfit(outfitId);
      setOutfits(outfits.filter(outfit => outfit.id !== outfitId));
      toast.success('Outfit deleted successfully');
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast.error('Failed to delete outfit');
    }
  };

  const handleOpenOutfit = (outfit: SavedOutfit) => {
    navigate('/analyzer', {
      state: {
        outfit: {
          location: {
            name: outfit.city,
            lat: null,
            lng: null
          },
          weather: outfit.weather,
          innerLayers: Array.from(outfit.innerLayers),
          outerLayers: Array.from(outfit.outerLayers)
        }
      }
    });
    toast.success('Loading saved outfit...');
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <SnowBackground />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">Please sign in to view your saved outfits.</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <SnowBackground />
        <div className="relative z-10 container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <SnowBackground />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Saved Outfits
            </h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          {outfits.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
              <p className="text-white">No saved outfits yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outfits.map((outfit) => (
                <Card key={outfit.id} className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">{outfit.city}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenOutfit(outfit)}
                        className="text-white hover:text-blue-400 hover:bg-blue-500/10"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => outfit.id && handleDelete(outfit.id)}
                        className="text-white hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <Cloud className="h-5 w-5" />
                      <span>
                        {outfit.weather.temp}°C, {outfit.weather.condition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white">
                      <Shirt className="h-5 w-5" />
                      <div className="text-sm">
                        <div>Inner: {outfit.innerLayers.join(', ') || 'None'}</div>
                        <div>Outer: {outfit.outerLayers.join(', ') || 'None'}</div>
                      </div>
                    </div>

                    <div className="text-sm text-white/60">
                      Saved on {format(outfit.createdAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 