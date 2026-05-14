import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "./pages/Index";
import Library from "./pages/Library";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import AudioPlayer from "./pages/AudioPlayer";
import AudioLibrary from "./pages/AudioLibrary";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import DesktopNav from "./components/desktop/DesktopNav";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AudioPlayerProvider>
            <Routes>
              {/* Reader breaks out of max-w-lg to use full screen, no DesktopNav */}
              <Route path="/read/:id" element={
                <>
                  <Reader />
                  <MiniPlayer />
                </>
              } />
              {/* Home breaks out of max-w-lg so the desktop hero can go full-bleed */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="/" element={
                <div className="relative">
                  <DesktopNav />
                  <Index />
                  <MiniPlayer />
                  <div className="max-w-lg mx-auto lg:hidden">
                    <BottomNav />
                  </div>
                </div>
              } />
              <Route path="*" element={
                <div className="relative">
                  <DesktopNav />
                  <div className="lg:pt-20">
                    <div className="max-w-lg mx-auto lg:max-w-none">
                      <Routes>
                        <Route path="/library" element={<Library />} />
                        <Route path="/book/:id" element={<BookDetail />} />
                        <Route path="/listen/:id" element={<AudioPlayer />} />
                        <Route path="/audio" element={<AudioLibrary />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <MiniPlayer />
                    <div className="max-w-lg mx-auto lg:hidden">
                      <BottomNav />
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </AudioPlayerProvider>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
