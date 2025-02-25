import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Analyzer from "./pages/Index";
import { SavedOutfits } from "./pages/SavedOutfits";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <Toaster />
    <BrowserRouter basename="/weather-wear">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/saved-outfits" element={<SavedOutfits />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
