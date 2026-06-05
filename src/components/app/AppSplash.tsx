"use client";

import { useEffect, useState } from "react";
import { AudioEqualizer } from "@/components/audio/AudioEqualizer";

const SPLASH_SESSION_KEY = "bt-splash-seen";

export function AppSplash() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      return;
    }

    window.sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const showTimeout = window.setTimeout(() => {
      setShouldShow(true);
    }, 0);

    const hideTimeout = window.setTimeout(() => {
      setShouldShow(false);
    }, prefersReducedMotion ? 450 : 1100);

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="bt-session-splash pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#050611]/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="bt-audio-disc flex h-28 w-28 items-center justify-center rounded-[2rem] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(34,211,238,0.18),rgba(217,70,239,0.14),rgba(5,6,17,0.96))]">
          <div className="bt-audio-disc-core h-16 w-16 rounded-full border-[14px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_32px_rgba(34,211,238,0.28)]" />
        </div>
        <div className="text-center">
          <p className="text-4xl font-black tracking-normal text-white">BT</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Blindtest
          </p>
        </div>
        <AudioEqualizer isActive />
      </div>
    </div>
  );
}
