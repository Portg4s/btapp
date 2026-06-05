"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioPreviewStatus = "idle" | "playing" | "paused" | "error";

export function useAudioPreview(audioPreviewUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<{
    sourceUrl: string;
    status: AudioPreviewStatus;
  }>({
    sourceUrl: audioPreviewUrl,
    status: "idle",
  });
  const status =
    audioState.sourceUrl === audioPreviewUrl ? audioState.status : "idle";

  useEffect(() => {
    if (!audioPreviewUrl) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(audioPreviewUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    function handleEnded() {
      setAudioState({ sourceUrl: audioPreviewUrl, status: "idle" });
    }

    function handleError() {
      setAudioState({ sourceUrl: audioPreviewUrl, status: "error" });
    }

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [audioPreviewUrl]);

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      setAudioState({ sourceUrl: audioPreviewUrl, status: "error" });
      return false;
    }

    try {
      await audio.play();
      setAudioState({ sourceUrl: audioPreviewUrl, status: "playing" });
      return true;
    } catch {
      setAudioState({ sourceUrl: audioPreviewUrl, status: "error" });
      return false;
    }
  }, [audioPreviewUrl]);

  const pause = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setAudioState({ sourceUrl: audioPreviewUrl, status: "paused" });
  }, [audioPreviewUrl]);

  const reset = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      setAudioState({ sourceUrl: audioPreviewUrl, status: "idle" });
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setAudioState({ sourceUrl: audioPreviewUrl, status: "idle" });
  }, [audioPreviewUrl]);

  return {
    pause,
    play,
    reset,
    status,
  };
}
