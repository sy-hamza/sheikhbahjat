"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X, Music, ChevronUp, ChevronDown } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function FloatingAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    stopTrack,
  } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // RTL layout: calculate click ratio from the right boundary
    const clickX = rect.right - e.clientX;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percentage * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.right - e.clientX;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
  };

  const handleClose = () => {
    stopTrack();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="fixed bottom-6 right-6 left-6 md:right-auto md:left-6 md:w-96 z-40"
        dir="rtl"
      >
        <div className="glass-panel border border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 rounded-2xl shadow-xl overflow-hidden bg-white/95 dark:bg-[var(--color-bg-dark-surface)]/95 backdrop-blur-md">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]/20 dark:border-[var(--color-border-dark)]/20 bg-[var(--color-primary)]/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center animate-spin-slow">
                <Music size={12} />
              </div>
              <span className="text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] font-[var(--font-family-heading)] line-clamp-1 max-w-[180px] md:max-w-[200px]">
                {currentTrack.title}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-muted)] transition-colors"
                title={isMinimized ? "توسيع" : "تصغير"}
              >
                {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-[var(--color-text-muted)] transition-colors"
                title="إغلاق المشغل"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Player controls */}
          <motion.div
            animate={{ height: isMinimized ? 0 : "auto" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3.5">
              {/* Progress and time */}
              <div className="space-y-1.5">
                <div
                  className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer relative group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-light)] relative transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[var(--color-accent)] shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls row */}
              <div className="flex items-center justify-between gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20 text-white flex items-center justify-center transition-all duration-300 transform active:scale-95"
                >
                  {isPlaying ? (
                    <Pause size={18} className="fill-current" />
                  ) : (
                    <Play size={18} className="fill-current translate-x-[-1px]" />
                  )}
                </button>

                {/* Volume Section */}
                <div className="flex items-center gap-2 flex-grow max-w-[120px]">
                  <button
                    onClick={toggleMute}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] dark:hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <div
                    className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 flex-grow cursor-pointer relative group"
                    onClick={handleVolumeClick}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--color-text-muted)] group-hover:bg-[var(--color-accent)] transition-all"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
