import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Cloud, Shirt } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface WeatherAnalysisProps {
  city: string;
  weather: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  selectedInnerLayers: Set<string>;
  selectedOuterLayers: Set<string>;
}

interface AnalysisResult {
  hypothermiaRisk: string;
  frostbiteRisk: string;
  safeExposure: string;
  improvements: string[];
}

export const WeatherAnalysis = ({ city, weather, selectedInnerLayers, selectedOuterLayers }: WeatherAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const clothingList = [
          ...[...selectedInnerLayers].map(layer => `Inner Layer: ${layer}`),
          ...[...selectedOuterLayers].map(layer => `Outer Layer: ${layer}`)
        ].join(", ");

        const prompt = `You are a highly accurate weather safety and clothing recommendation system. Analyze the following weather and clothing combination with extreme attention to safety and appropriate clothing layers:

City: ${city}
Weather Conditions:
- Temperature: ${weather.temp}°C
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} m/s

Current Clothing:
${[...selectedInnerLayers].length > 0 ? 'Inner Layers: ' + [...selectedInnerLayers].join(', ') : 'No inner layers'}
${[...selectedOuterLayers].length > 0 ? 'Outer Layers: ' + [...selectedOuterLayers].join(', ') : 'No outer layers'}

Provide a detailed safety analysis following these strict guidelines:
1. For temperatures below 10°C, always recommend multiple layers
2. For temperatures below 0°C, require both inner and outer layers
3. For temperatures below -5°C, require thermal layers and heavy outerwear
4. Consider wind chill factor when wind speed is above 3 m/s
5. Consider humidity's effect on perceived temperature
6. Be very strict about safety in extreme conditions

Return ONLY a JSON object with this EXACT structure (no other text):
{
  "hypothermiaRisk": "Risk Level (High/Medium/Low): detailed explanation including wind chill and humidity factors",
  "frostbiteRisk": "Risk Level (High/Medium/Low): detailed explanation including exposure time considerations",
  "safeExposure": "Maximum recommended exposure time with current clothing",
  "improvements": ["specific clothing recommendation 1", "specific clothing recommendation 2", "etc"]
}`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 1
            }
          })
        });

        const data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok) {
          throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
        }
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid API response format');
        }

        const analysisText = data.candidates[0].content.parts[0].text;
        console.log('Analysis Text:', analysisText);
        
        try {
          // Clean the response text to ensure it's valid JSON
          const cleanedText = analysisText.trim().replace(/^```json\s*|\s*```$/g, '');
          const analysisData = JSON.parse(cleanedText);
          
          // Validate the response structure
          if (!analysisData.hypothermiaRisk || !analysisData.frostbiteRisk || 
              !analysisData.safeExposure || !Array.isArray(analysisData.improvements)) {
            throw new Error('Invalid analysis data structure');
          }
          
          setAnalysis(analysisData);
        } catch (parseError) {
          console.error('Error parsing analysis JSON:', parseError, '\nRaw text:', analysisText);
          throw new Error('Failed to parse analysis response');
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze outfit');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [city, weather, selectedInnerLayers, selectedOuterLayers]);
  
  if (loading) {
    return (
      <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="ml-2 text-white">Analyzing outfit...</span>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
      {/* Location and Weather Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5" />
          <span className="text-lg font-semibold">{city}</span>
        </div>
        
        <div className="flex items-center gap-2 text-white">
          <Cloud className="h-5 w-5" />
          <span>
            {weather.temp}°C, {weather.condition}, 
            Humidity: {weather.humidity}%, 
            Wind: {weather.windSpeed} m/s
          </span>
        </div>

        <div className="flex items-center gap-2 text-white">
          <Shirt className="h-5 w-5" />
          <div>
            <div>Inner Layers: {[...selectedInnerLayers].join(", ") || "None"}</div>
            <div>Outer Layers: {[...selectedOuterLayers].join(", ") || "None"}</div>
          </div>
        </div>
      </div>

      <Separator className="bg-white/20 my-4" />
      
      {/* Analysis Results */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Health Risk Analysis</h2>
        
        <div className="space-y-4">
          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <h3 className="font-medium text-red-400 mb-2">Hypothermia Risk</h3>
            <p className="text-sm text-gray-200">{analysis.hypothermiaRisk}</p>
          </div>
          
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h3 className="font-medium text-blue-400 mb-2">Frostbite Risk</h3>
            <p className="text-sm text-gray-200">{analysis.frostbiteRisk}</p>
          </div>
          
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <h3 className="font-medium text-green-400 mb-2">Safe Exposure Time</h3>
            <p className="text-sm text-gray-200">{analysis.safeExposure}</p>
          </div>
          
          <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
            <h3 className="font-medium text-purple-400 mb-2">Recommended Improvements</h3>
            <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}; 