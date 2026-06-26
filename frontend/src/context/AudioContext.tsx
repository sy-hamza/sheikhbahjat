"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Poem } from "@/lib/api";

interface AudioContextType {
  currentTrack: Poem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Poem) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Poem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Ref on mount (client-side only)
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Handle track source change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.audio_path) {
      const wasPlaying = isPlaying;
      audio.src = currentTrack.audio_path;
      audio.load();
      
      if (wasPlaying) {
        audio.play().catch((err) => console.error("Playback failed:", err));
      }
    } else {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Sync volume and mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const playTrack = (track: Poem) => {
    if (!track.audio_path) return;

    if (currentTrack?.id === track.id) {
      // Just resume if it's the same track
      audioRef.current?.play().catch((err) => console.error("Playback failed:", err));
      setIsPlaying(true);
    } else {
      // Load and play new track
      setCurrentTrack(track);
      setIsPlaying(true);
      // Play is triggered in the source change effect, but we call it here to guarantee trigger
      setTimeout(() => {
        audioRef.current?.play().catch((err) => console.error("Playback failed:", err));
      }, 50);
    }
  };

  const pauseTrack = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      audioRef.current?.play().catch((err) => console.error("Playback failed:", err));
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    const safeVol = Math.max(0, Math.min(1, vol));
    setVolumeState(safeVol);
    if (safeVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const stopTrack = () => {
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playTrack,
        pauseTrack,
        stopTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
