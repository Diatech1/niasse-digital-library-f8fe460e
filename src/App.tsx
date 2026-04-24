import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "./pages/Index";
import Library from "./pages/Library";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import AudioPlayer from "./pages/AudioPlayer";
import AudioLibrary from "./pages/AudioLibrary";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Reader breaks out of max-w-lg to use full screen */}
            <Route path="/read/:id" element={<Reader />} />
            <Route path="*" element={
              <div className="max-w-lg mx-auto relative">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/listen/:id" element={<AudioPlayer />} />
                  <Route path="/audio" element={<AudioLibrary />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
