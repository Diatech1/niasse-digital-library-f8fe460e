import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBook } from "@/hooks/use-books";
import {
  ChevronDown, Share2, SkipBack, Play, Pause, SkipForward,
  Repeat, Moon, ListMusic, Gauge, Cast,
} from "lucide-react";

const AudioPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book } = useBook(id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(25);

  if (!book) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img src={book.cover} alt="" className="w-full h-full object-cover opacity-20 blur-3xl scale-110" />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="p-2"><ChevronDown className="w-6 h-6 text-foreground" /></button>
          <div className="text-center"><p className="text-xs text-muted-foreground uppercase tracking-wider">Now Playing</p></div>
          <button className="p-2"><Share2 className="w-5 h-5 text-foreground" /></button>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 py-6">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-glow">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="px-8 text-center mb-4">
          <h2 className="text-lg font-serif font-bold text-foreground">{book.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
        </div>

        <div className="px-8 mb-4">
          <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full h-1 accent-primary appearance-none bg-muted rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1:15:30</span><span>{book.audioDuration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <button className="p-2 text-muted-foreground"><SkipBack className="w-6 h-6" /></button>
          <button onClick={() => setPlaying(!playing)} className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center transition-transform active:scale-95">
            {playing ? <Pause className="w-7 h-7 text-secondary-foreground" /> : <Play className="w-7 h-7 text-secondary-foreground ml-1" />}
          </button>
          <button className="p-2 text-muted-foreground"><SkipForward className="w-6 h-6" /></button>
        </div>

        <div className="flex items-center justify-around px-8 pb-12 text-muted-foreground">
          <button className="p-2"><Repeat className="w-5 h-5" /></button>
          <button className="p-2"><Moon className="w-5 h-5" /></button>
          <button className="p-2"><ListMusic className="w-5 h-5" /></button>
          <button className="p-2"><Gauge className="w-5 h-5" /></button>
          <button className="p-2"><Cast className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
