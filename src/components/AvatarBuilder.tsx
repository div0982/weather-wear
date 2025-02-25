import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shirt, ShirtIcon, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ClothingItem {
  id: string;
  name: string;
  type: 'inner' | 'outer';
  icon: any;
}

const INNER_LAYERS: ClothingItem[] = [
  { id: 'undershirt', name: 'Undershirt', type: 'inner', icon: ShirtIcon },
  { id: 'thermals', name: 'Thermals', type: 'inner', icon: ShirtIcon },
  { id: 'underpants', name: 'Underpants', type: 'inner', icon: ShirtIcon },
  { id: 'socks', name: 'Socks', type: 'inner', icon: ShirtIcon },
  { id: 'vest', name: 'Thermal Vest', type: 'inner', icon: ShirtIcon },
];

const OUTER_LAYERS: ClothingItem[] = [
  { id: 'hoodie', name: 'Hoodie', type: 'outer', icon: Shirt },
  { id: 'jeans', name: 'Jeans', type: 'outer', icon: ShirtIcon },
  { id: 'tshirt', name: 'T-Shirt', type: 'outer', icon: Shirt },
];

interface AvatarBuilderProps {
  onInnerLayersChange: (layers: Set<string>) => void;
  onOuterLayersChange: (layers: Set<string>) => void;
  onAnalyze: () => void;
  onSave: () => void;
  isAuthenticated: boolean;
  initialInnerLayers?: Set<string>;
  initialOuterLayers?: Set<string>;
}

export const AvatarBuilder = ({ 
  onInnerLayersChange, 
  onOuterLayersChange, 
  onAnalyze,
  onSave,
  isAuthenticated,
  initialInnerLayers = new Set(),
  initialOuterLayers = new Set()
}: AvatarBuilderProps) => {
  const [selectedInnerLayers, setSelectedInnerLayers] = useState<Set<string>>(new Set(Array.from(initialInnerLayers)));
  const [selectedOuterLayers, setSelectedOuterLayers] = useState<Set<string>>(new Set(Array.from(initialOuterLayers)));
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const mannequinRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const isRotating = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rotationSpeed = 0.5; // Adjust for faster/slower rotation

  // Only update state when initial layers actually change
  useEffect(() => {
    const newInnerLayers = new Set(Array.from(initialInnerLayers));
    const newOuterLayers = new Set(Array.from(initialOuterLayers));
    
    // Only update if the sets are actually different
    if (!setsAreEqual(selectedInnerLayers, newInnerLayers)) {
      setSelectedInnerLayers(newInnerLayers);
    }
    if (!setsAreEqual(selectedOuterLayers, newOuterLayers)) {
      setSelectedOuterLayers(newOuterLayers);
    }
  }, [initialInnerLayers, initialOuterLayers]);

  // Helper function to compare sets
  const setsAreEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    return Array.from(a).every(value => b.has(value));
  };

  // Notify parent of changes only when the sets actually change
  useEffect(() => {
    const newInnerLayers = new Set(Array.from(selectedInnerLayers));
    const newOuterLayers = new Set(Array.from(selectedOuterLayers));
    
    if (!setsAreEqual(initialInnerLayers, newInnerLayers)) {
      onInnerLayersChange(newInnerLayers);
    }
    if (!setsAreEqual(initialOuterLayers, newOuterLayers)) {
      onOuterLayersChange(newOuterLayers);
    }
  }, [selectedInnerLayers, selectedOuterLayers]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mannequinRef.current || !isRotating.current) return;
      
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      // Update the continuous rotation
      rotationRef.current = {
        x: rotationRef.current.x + (deltaY * rotationSpeed),
        y: rotationRef.current.y + (deltaX * rotationSpeed),
        z: rotationRef.current.z
      };

      // Apply the rotation with modulo 360 to keep values in check
      setRotation({
        x: rotationRef.current.x % 360,
        y: rotationRef.current.y % 360,
        z: rotationRef.current.z % 360
      });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isRotating.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      isRotating.current = false;
    };

    const mannequin = mannequinRef.current;
    if (mannequin) {
      mannequin.addEventListener('mouseenter', handleMouseEnter);
      mannequin.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (mannequin) {
        mannequin.removeEventListener('mouseenter', handleMouseEnter);
        mannequin.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const resetRotation = () => {
    isRotating.current = false;
    rotationRef.current = { x: 0, y: 0, z: 0 };
    setRotation({ x: 0, y: 0, z: 0 });
  };

  const toggleInnerLayer = (itemId: string) => {
    const newLayers = new Set(selectedInnerLayers);
    if (newLayers.has(itemId)) {
      newLayers.delete(itemId);
    } else {
      newLayers.add(itemId);
    }
    setSelectedInnerLayers(newLayers);
    onInnerLayersChange(newLayers);
  };

  const toggleOuterLayer = (itemId: string) => {
    const newLayers = new Set(selectedOuterLayers);
    if (newLayers.has(itemId)) {
      newLayers.delete(itemId);
    } else {
      newLayers.add(itemId);
    }
    setSelectedOuterLayers(newLayers);
    onOuterLayersChange(newLayers);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Mannequin Display */}
        <div className="flex-1 relative min-h-[250px] bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center perspective-[2000px]">
            {/* Reset Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
              onClick={resetRotation}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            {/* Base Mannequin */}
            <div 
              ref={mannequinRef}
              className="mannequin relative w-24 h-48 flex flex-col items-center transition-transform duration-150 ease-out preserve-3d cursor-move"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
              }}
            >
              {/* Head - 3D */}
              <div className="relative w-10 h-10 -mt-2 preserve-3d">
                {/* Front face */}
                <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu preserve-3d" style={{ transform: 'translateZ(5px)' }} />
                {/* Back face */}
                <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu preserve-3d" style={{ transform: 'translateZ(-5px)' }} />
                {/* Side cylinder */}
                <div className="absolute inset-0 h-full w-full">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full w-[2px] bg-gray-300 origin-center"
                      style={{
                        transform: `rotateY(${i * 30}deg) translateZ(5px)`,
                        left: '50%',
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Neck - 3D */}
              <div className="relative w-4 h-3 preserve-3d">
                <div className="absolute inset-0 bg-gray-300 transform-gpu" style={{ transform: 'translateZ(2px)' }} />
                <div className="absolute inset-0 bg-gray-300 transform-gpu" style={{ transform: 'translateZ(-2px)' }} />
                {/* Side faces */}
                <div className="absolute inset-y-0 left-0 w-[4px] bg-gray-300 origin-left transform-gpu" style={{ transform: 'rotateY(-90deg) translateX(-2px)' }} />
                <div className="absolute inset-y-0 right-0 w-[4px] bg-gray-300 origin-right transform-gpu" style={{ transform: 'rotateY(90deg) translateX(2px)' }} />
              </div>
              
              {/* Body - 3D */}
              <div className="relative w-16 h-16 preserve-3d">
                {/* Main body cube */}
                <div className="absolute inset-0 bg-gray-300 rounded-xl transform-gpu" style={{ transform: 'translateZ(8px)' }} />
                <div className="absolute inset-0 bg-gray-300 rounded-xl transform-gpu" style={{ transform: 'translateZ(-8px)' }} />
                {/* Side faces */}
                <div className="absolute inset-y-0 left-0 w-[16px] bg-gray-300 origin-left transform-gpu" style={{ transform: 'rotateY(-90deg) translateX(-8px)' }} />
                <div className="absolute inset-y-0 right-0 w-[16px] bg-gray-300 origin-right transform-gpu" style={{ transform: 'rotateY(90deg) translateX(8px)' }} />
                
                {/* Arms - 3D */}
                <div className="absolute -left-2 top-0 flex flex-col items-center preserve-3d">
                  <div className="relative w-3 h-6 preserve-3d">
                    {/* Shoulder */}
                    <div className="absolute w-3 h-6 bg-gray-300 rounded-l-full transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                    <div className="absolute w-3 h-6 bg-gray-300 rounded-l-full transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                    {/* Arm */}
                    <div className="absolute right-0 top-3 w-3 h-8 bg-gray-300 preserve-3d">
                      <div className="absolute inset-0 transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                      <div className="absolute inset-0 transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                      <div className="absolute inset-y-0 left-0 w-[3px] bg-gray-300 origin-left transform-gpu" style={{ transform: 'rotateY(-90deg) translateX(-1.5px)' }} />
                    </div>
                  </div>
                  {/* Hand - 3D sphere */}
                  <div className="relative w-3 h-3 -mt-0.5 preserve-3d">
                    <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu" style={{ transform: 'translateZ(1.5px)' }} />
                    <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu" style={{ transform: 'translateZ(-1.5px)' }} />
                  </div>
                </div>
                
                {/* Mirror for right arm */}
                <div className="absolute -right-2 top-0 flex flex-col items-center preserve-3d">
                  <div className="relative w-3 h-6 preserve-3d">
                    {/* Shoulder */}
                    <div className="absolute w-3 h-6 bg-gray-300 rounded-r-full transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                    <div className="absolute w-3 h-6 bg-gray-300 rounded-r-full transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                    {/* Arm */}
                    <div className="absolute left-0 top-3 w-3 h-8 bg-gray-300 preserve-3d">
                      <div className="absolute inset-0 transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                      <div className="absolute inset-0 transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                      <div className="absolute inset-y-0 right-0 w-[3px] bg-gray-300 origin-right transform-gpu" style={{ transform: 'rotateY(90deg) translateX(1.5px)' }} />
                    </div>
                  </div>
                  {/* Hand - 3D sphere */}
                  <div className="relative w-3 h-3 -mt-0.5 preserve-3d">
                    <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu" style={{ transform: 'translateZ(1.5px)' }} />
                    <div className="absolute inset-0 bg-gray-300 rounded-full transform-gpu" style={{ transform: 'translateZ(-1.5px)' }} />
                  </div>
                </div>
              </div>
              
              {/* Legs - 3D */}
              <div className="flex gap-1 -mt-1 preserve-3d">
                {/* Left leg */}
                <div className="relative w-6 h-20 preserve-3d">
                  <div className="absolute inset-0 bg-gray-300 rounded-b-xl transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                  <div className="absolute inset-0 bg-gray-300 rounded-b-xl transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                  <div className="absolute inset-y-0 left-0 w-[6px] bg-gray-300 origin-left transform-gpu" style={{ transform: 'rotateY(-90deg) translateX(-3px)' }} />
                  <div className="absolute inset-y-0 right-0 w-[6px] bg-gray-300 origin-right transform-gpu" style={{ transform: 'rotateY(90deg) translateX(3px)' }} />
                </div>
                {/* Right leg */}
                <div className="relative w-6 h-20 preserve-3d">
                  <div className="absolute inset-0 bg-gray-300 rounded-b-xl transform-gpu" style={{ transform: 'translateZ(3px)' }} />
                  <div className="absolute inset-0 bg-gray-300 rounded-b-xl transform-gpu" style={{ transform: 'translateZ(-3px)' }} />
                  <div className="absolute inset-y-0 left-0 w-[6px] bg-gray-300 origin-left transform-gpu" style={{ transform: 'rotateY(-90deg) translateX(-3px)' }} />
                  <div className="absolute inset-y-0 right-0 w-[6px] bg-gray-300 origin-right transform-gpu" style={{ transform: 'rotateY(90deg) translateX(3px)' }} />
                </div>
              </div>
              
              {/* Clothing Layers */}
              {selectedOuterLayers.has('tshirt') && (
                <div className="absolute top-10 flex flex-col items-center">
                  {/* T-shirt collar */}
                  <div className="w-8 h-2 bg-blue-400 rounded-full -mb-0.5" />
                  {/* T-shirt body */}
                  <div className="w-16 h-16 bg-blue-400 rounded-xl opacity-95 relative">
                    {/* T-shirt wrinkles */}
                    <div className="absolute inset-x-2 top-4 h-0.5 bg-blue-500/20 rounded-full" />
                    <div className="absolute inset-x-2 top-8 h-0.5 bg-blue-500/20 rounded-full" />
                    {/* Sleeve hints - with longer arms */}
                    <div className="absolute -left-2 top-0 flex flex-col items-center">
                      <div className="relative w-3 h-6">
                        <div className="absolute w-3 h-6 bg-blue-400 rounded-l-full" /> {/* Compact shoulder */}
                        <div className="absolute right-0 top-3 w-3 h-6 bg-blue-400" /> {/* Longer sleeve */}
                      </div>
                    </div>
                    <div className="absolute -right-2 top-0 flex flex-col items-center">
                      <div className="relative w-3 h-6">
                        <div className="absolute w-3 h-6 bg-blue-400 rounded-r-full" /> {/* Compact shoulder */}
                        <div className="absolute left-0 top-3 w-3 h-6 bg-blue-400" /> {/* Longer sleeve */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedOuterLayers.has('hoodie') && (
                <div className="absolute top-8 flex flex-col items-center">
                  {/* Hood */}
                  <div className="relative w-14 h-6">
                    <div className="absolute inset-x-0 h-4 bg-gray-600 rounded-t-2xl" /> {/* Hood back */}
                    <div className="absolute bottom-0 inset-x-1 h-3 bg-gray-600 rounded-full" /> {/* Hood opening */}
                  </div>
                  {/* Hoodie body */}
                  <div className="w-16 h-16 bg-gray-600 rounded-xl relative -mt-1">
                    {/* Hoodie ribbing at bottom */}
                    <div className="absolute bottom-0 inset-x-0 h-2 bg-gray-700/30 rounded-b-xl" />
                    
                    {/* Center pocket */}
                    <div className="absolute inset-x-2 bottom-3 h-4 bg-gray-700/30 rounded-lg" />
                    
                    {/* Drawstrings */}
                    <div className="absolute left-5 top-0 h-3 w-0.5 bg-gray-500/40 transform rotate-12" />
                    <div className="absolute right-5 top-0 h-3 w-0.5 bg-gray-500/40 transform -rotate-12" />
                    
                    {/* Sleeve details - with longer arms */}
                    <div className="absolute -left-2 top-0 flex flex-col items-center">
                      <div className="relative w-3 h-6">
                        <div className="absolute w-3 h-6 bg-gray-600 rounded-l-full" /> {/* Compact shoulder */}
                        <div className="absolute right-0 top-3 w-3 h-9 bg-gray-600" /> {/* Longer sleeve */}
                        <div className="absolute right-0 bottom-0.5 w-3 h-2 bg-gray-700/30 rounded-bl-lg" /> {/* Cuff */}
                      </div>
                    </div>
                    <div className="absolute -right-2 top-0 flex flex-col items-center">
                      <div className="relative w-3 h-6">
                        <div className="absolute w-3 h-6 bg-gray-600 rounded-r-full" /> {/* Compact shoulder */}
                        <div className="absolute left-0 top-3 w-3 h-9 bg-gray-600" /> {/* Longer sleeve */}
                        <div className="absolute left-0 bottom-0.5 w-3 h-2 bg-gray-700/30 rounded-br-lg" /> {/* Cuff */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedOuterLayers.has('jeans') && (
                <div className="absolute bottom-0 flex gap-1">
                  {/* Left leg */}
                  <div className="w-6 h-20 bg-blue-600 rounded-b-xl opacity-95 relative">
                    {/* Jean seams and details */}
                    <div className="absolute inset-x-1 top-2 h-0.5 bg-blue-700/20 rounded-full" />
                    <div className="absolute inset-x-1 top-8 h-0.5 bg-blue-700/20 rounded-full" />
                    <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-blue-700/20" />
                  </div>
                  {/* Right leg */}
                  <div className="w-6 h-20 bg-blue-600 rounded-b-xl opacity-95 relative">
                    <div className="absolute inset-x-1 top-2 h-0.5 bg-blue-700/20 rounded-full" />
                    <div className="absolute inset-x-1 top-8 h-0.5 bg-blue-700/20 rounded-full" />
                    <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-blue-700/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Inner Layers</h3>
            <div className="grid grid-cols-2 gap-2">
              {INNER_LAYERS.map((item) => (
                  <Button
                  key={item.id}
                  variant={selectedInnerLayers.has(item.id) ? "default" : "outline"}
                  onClick={() => toggleInnerLayer(item.id)}
                  className="justify-start"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Outer Layers</h3>
            <div className="grid grid-cols-2 gap-2">
              {OUTER_LAYERS.map((item) => (
                  <Button
                  key={item.id}
                  variant={selectedOuterLayers.has(item.id) ? "default" : "outline"}
                  onClick={() => toggleOuterLayer(item.id)}
                  className="justify-start"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        {isAuthenticated && (
          <Button 
            className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={onSave}
          >
            Save Outfit
          </Button>
        )}
        <Button 
          className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onAnalyze}
        >
          Analyze Outfit
        </Button>
      </div>
    </div>
  );
};
