"use client";

/**
 * AudioPlayer Component
 * =====================
 * Custom-styled HTML5 audio player with progress bar,
 * play/pause, and time display.
 */

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src?: string;
  title?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // RTL: calculate from right
    const clickX = rect.right - e.clientX;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] dark:from-[var(--color-bg-dark-surface)] dark:to-[var(--color-bg-dark-elevated)] rounded-2xl p-6 shadow-[var(--shadow-medium)]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      {title && (
        <p className="text-white/80 text-sm font-medium mb-4 text-center font-[var(--font-family-heading)]">
          🎵 {title}
        </p>
      )}

      {/* Progress Bar */}
      <div
        className="w-full h-2 rounded-full bg-white/20 cursor-pointer mb-4 relative group"
        onClick={seekTo}
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-light)] transition-all relative"
          style={{ width: `${progress}%` }}
        >
          {/* Thumb */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--color-accent)] shadow-[var(--shadow-glow-gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between text-white/60 text-xs mb-4">
        <span>{formatTime(duration - currentTime)}</span>
        <span>{formatTime(currentTime)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          onClick={restart}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          aria-label="إعادة من البداية"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center shadow-[var(--shadow-glow-gold)] hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "إيقاف" : "تشغيل"}
        >
          {isPlaying ? (
            <Pause size={22} className="text-white" />
          ) : (
            <Play size={22} className="text-white mr-0.5" />
          )}
        </button>
      </div>

      {/* No audio message */}
      {!src && (
        <p className="text-center text-white/40 text-sm mt-4">
          لا يوجد تسجيل صوتي متاح حالياً
        </p>
      )}
    </div>
  );
}
