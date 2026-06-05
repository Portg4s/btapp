"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioEqualizer } from "@/components/audio/AudioEqualizer";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAudioPreview } from "@/features/game/useAudioPreview";
import { searchItunesTracks } from "@/features/music/musicProvider";
import {
  getRecentTrackKeys,
  saveRecentPartyTracks,
} from "@/features/music/recentTracksStorage";
import type { MusicTrack, PlaylistDifficulty } from "@/types/music";

type PartyGameClientProps = {
  apiCategories?: string[];
  apiCategory?: string;
  apiSearchTerm?: string;
  apiTrackLimit?: number;
  difficulty: PlaylistDifficulty;
  guessDurationSeconds: number;
  revealDurationSeconds: number;
  tracks: MusicTrack[];
  selectedCategories: string[];
};

type PartyPhase = "ready" | "guessing" | "reveal" | "finished";

const partyPreparationRequests = new Map<
  string,
  ReturnType<typeof searchItunesTracks>
>();

function shuffleTracksOnce(tracks: MusicTrack[]) {
  const shuffledTracks = [...tracks];

  for (let index = shuffledTracks.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentTrack = shuffledTracks[index];
    shuffledTracks[index] = shuffledTracks[swapIndex];
    shuffledTracks[swapIndex] = currentTrack;
  }

  return shuffledTracks;
}

function getPartyPreparationRequest(
  sessionKey: string,
  options: Parameters<typeof searchItunesTracks>[0],
) {
  const currentRequest = partyPreparationRequests.get(sessionKey);

  if (currentRequest) {
    return currentRequest;
  }

  const nextRequest = searchItunesTracks(options).finally(() => {
    partyPreparationRequests.delete(sessionKey);
  });

  partyPreparationRequests.set(sessionKey, nextRequest);
  return nextRequest;
}

export function PartyGameClient({
  apiCategories,
  apiCategory,
  apiSearchTerm,
  apiTrackLimit,
  difficulty,
  guessDurationSeconds,
  revealDurationSeconds,
  tracks,
  selectedCategories,
}: PartyGameClientProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<PartyPhase>("ready");
  const [secondsRemaining, setSecondsRemaining] = useState(
    guessDurationSeconds,
  );
  const [revealSecondsRemaining, setRevealSecondsRemaining] = useState(
    revealDurationSeconds,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [autoplayRequest, setAutoplayRequest] = useState(0);
  const [shuffledLocalTracks] = useState(() => shuffleTracksOnce(tracks));
  const [providerTracks, setProviderTracks] = useState<MusicTrack[]>([]);
  const [providerStatus, setProviderStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >(apiCategory ? "loading" : "idle");
  const [providerError, setProviderError] = useState<string | null>(null);
  const isAdvancingRef = useRef(false);
  const completedSessionKeyRef = useRef<string | null>(null);
  const isProviderLoading = providerStatus === "loading";
  const activeTracks =
    providerTracks.length > 0 ? providerTracks : shuffledLocalTracks;
  const currentTrack = activeTracks[roundIndex];
  const mainAnswer = currentTrack?.answerTitle ?? currentTrack?.title;
  const sourceLabel = currentTrack?.sourceTitle ?? currentTrack?.album;
  const hasDistinctSource =
    sourceLabel &&
    sourceLabel.toLowerCase() !== (mainAnswer ?? "").toLowerCase() &&
    sourceLabel.toLowerCase() !== (currentTrack?.title ?? "").toLowerCase();
  const revealImageUrl =
    currentTrack?.artworkUrl?.replace("100x100bb", "600x600bb") ??
    currentTrack?.revealImageUrl;
  const {
    pause: pauseAudio,
    play: playAudio,
    reset: resetAudio,
    status: audioStatus,
  } = useAudioPreview(currentTrack?.audioPreviewUrl ?? "");
  const progress = Math.round(
    ((guessDurationSeconds - secondsRemaining) / guessDurationSeconds) * 100,
  );
  const categoriesLabel = useMemo(
    () => selectedCategories.join(" + "),
    [selectedCategories],
  );
  const audioMotionState = isPaused
    ? "paused"
    : phase === "guessing"
      ? "playing"
      : phase === "reveal"
        ? "reveal"
        : "ready";
  const isAudioMotionActive =
    !isPaused && (phase === "guessing" || phase === "reveal");

  useEffect(() => {
    let isCancelled = false;

    if (!apiCategory) {
      return;
    }

    const recentTrackKeys = getRecentTrackKeys();
    const preparationKey = JSON.stringify({
      apiCategories,
      apiCategory,
      apiSearchTerm,
      apiTrackLimit,
      difficulty,
      guessDurationSeconds,
      recentTrackKeys,
      revealDurationSeconds,
    });

    if (completedSessionKeyRef.current === preparationKey) {
      return;
    }

    void getPartyPreparationRequest(preparationKey, {
      categories: apiCategories,
      category: apiCategory,
      difficulty,
      limit: apiTrackLimit,
      recentTrackKeys,
      term: apiSearchTerm,
    }).then((result) => {
      if (isCancelled) {
        return;
      }

      const requestedTrackCount = apiTrackLimit ?? result.tracks.length;

      if (result.tracks.length < requestedTrackCount) {
        setProviderStatus("error");
        setProviderError(
          result.error ??
            "Impossible de charger assez d extraits pour ces categories.",
        );
        completedSessionKeyRef.current = preparationKey;
        return;
      }

      const apiTracks = shuffleTracksOnce(result.tracks);
      const nextProviderTracks = apiTracks.slice(0, requestedTrackCount);

      setProviderTracks(nextProviderTracks);
      saveRecentPartyTracks(nextProviderTracks);
      setProviderStatus("ready");
      setProviderError(null);
      completedSessionKeyRef.current = preparationKey;
      setRoundIndex(0);
      setPhase("ready");
      setSecondsRemaining(guessDurationSeconds);
      setRevealSecondsRemaining(revealDurationSeconds);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    apiCategory,
    apiCategories,
    apiSearchTerm,
    apiTrackLimit,
    difficulty,
    guessDurationSeconds,
    revealDurationSeconds,
  ]);

  const handleNextRound = useCallback(() => {
    if (isAdvancingRef.current) {
      return;
    }

    isAdvancingRef.current = true;
    resetAudio();

    if (roundIndex >= activeTracks.length - 1) {
      setPhase("finished");
      return;
    }

    setRoundIndex((currentIndex) => currentIndex + 1);
    setSecondsRemaining(guessDurationSeconds);
    setRevealSecondsRemaining(revealDurationSeconds);
    setAudioNotice(null);
    setIsPaused(false);
    setPhase("guessing");
    setAutoplayRequest((request) => request + 1);
    window.setTimeout(() => {
      isAdvancingRef.current = false;
    }, 0);
  }, [
    guessDurationSeconds,
    resetAudio,
    revealDurationSeconds,
    roundIndex,
    activeTracks.length,
  ]);

  useEffect(() => {
    if (phase !== "guessing" || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(interval);
          setPhase("reveal");
          setRevealSecondsRemaining(revealDurationSeconds);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPaused, phase, resetAudio, revealDurationSeconds]);

  useEffect(() => {
    if (phase !== "reveal" || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setRevealSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(interval);
          handleNextRound();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [handleNextRound, isPaused, phase]);

  useEffect(() => {
    if (phase !== "guessing" || isPaused || autoplayRequest === 0) {
      return;
    }

    void playAudio().then((didPlay) => {
      if (!didPlay) {
        setAudioNotice(
          "Lecture bloquee. Appuie sur Reprendre pour relancer l extrait.",
        );
      }
    });
  }, [autoplayRequest, isPaused, phase, playAudio]);

  async function startRound() {
    if (isProviderLoading) {
      setAudioNotice(
        "Recherche iTunes en cours. La partie demarrera avec les previews API.",
      );
      return;
    }

    setAudioNotice(null);
    setIsPaused(false);
    setSecondsRemaining(guessDurationSeconds);
    setRevealSecondsRemaining(revealDurationSeconds);
    setPhase("guessing");

    const didPlay = await playAudio();

    if (!didPlay) {
      setAudioNotice(
        "Lecture bloquee. Appuie sur Reprendre pour relancer l extrait.",
      );
    }
  }

  function handlePauseToggle() {
    if (isPaused) {
      setIsPaused(false);

      if (phase === "guessing" || phase === "reveal") {
        void playAudio().then((didPlay) => {
          if (!didPlay) {
            setAudioNotice(
              "Extrait temporairement indisponible. Reessaie ou passe au suivant.",
            );
          }
        });
      }

      return;
    }

    setIsPaused(true);
    pauseAudio();
  }

  function handleReplay() {
    resetAudio();
    setRoundIndex(0);
    isAdvancingRef.current = false;
    setSecondsRemaining(guessDurationSeconds);
    setRevealSecondsRemaining(revealDurationSeconds);
    setAudioNotice(null);
    setIsPaused(false);
    setPhase("ready");
  }

  if (!currentTrack && apiCategory && providerStatus === "loading") {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-5 border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
        >
          <Badge>Chargement</Badge>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Preparation des extraits.
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-300">
            Recherche de previews musicales en cours pour {categoriesLabel}.
          </p>
        </Card>
      </PageShell>
    );
  }

  if (!currentTrack && apiCategory && providerStatus === "error") {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-5 border-fuchsia-300/20 bg-fuchsia-300/[0.045] lg:col-span-2"
        >
          <Badge>Extraits indisponibles</Badge>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Impossible de lancer cette selection.
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-300">
            {providerError ??
              "Impossible de charger assez d extraits pour ces categories."}
          </p>
          <Button className="w-full sm:w-fit" href="/party/setup">
            Changer les themes
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (!currentTrack || phase === "finished") {
    return (
      <PageShell>
        <Card
          as="section"
          className="flex max-w-2xl flex-col gap-6 border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2"
        >
          <Badge>Blindtest termine</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Fin de la session soiree.
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300">
              {activeTracks.length} extraits joues dans le mix {categoriesLabel}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-fit" onClick={handleReplay}>
              Rejouer
            </Button>
            <Button className="w-full sm:w-fit" href="/" variant="secondary">
              Retour a l&apos;accueil
            </Button>
            <Button
              className="w-full sm:w-fit"
              href="/party/setup"
              variant="secondary"
            >
              Changer les themes
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-3 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Button className="px-3 py-2 text-sm sm:w-fit" href="/party/setup" variant="ghost">
            Quitter
          </Button>
          <Badge>
            {phase === "ready"
              ? "Pret"
              : isPaused
                ? "Pause"
                : phase === "guessing"
                  ? "Devinez"
                  : "Reveal"}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Theme
          </p>
          <h1 className="text-4xl font-semibold leading-none text-white drop-shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:text-6xl">
            {currentTrack.category ?? "Blindtest"}
          </h1>
          <p className="text-sm leading-6 text-zinc-300 sm:text-base">
            Extrait {roundIndex + 1}/{activeTracks.length}
          </p>
        </div>
      </div>

      <Card className="relative flex flex-col gap-4 overflow-hidden border-cyan-300/20 bg-cyan-300/[0.045] lg:col-span-2">
        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,#67e8f9,#f0abfc,transparent)]" />

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {phase === "reveal" ? "Reveal" : "Timer"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-white">
              {phase === "reveal" ? `${revealSecondsRemaining}s` : `${secondsRemaining}s`}
            </p>
          </div>
          {phase === "ready" ? (
            <Button className="min-h-11 px-4" onClick={() => void startRound()}>
              Demarrer
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="min-h-11 px-4" onClick={handlePauseToggle}>
                {isPaused ? "Reprendre" : "Pause"}
              </Button>
              {phase === "reveal" ? (
                <Button
                  className="min-h-11 px-4"
                  onClick={handleNextRound}
                  variant="secondary"
                >
                  {roundIndex >= activeTracks.length - 1 ? "Terminer" : "Suivant"}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#c084fc,#f0abfc)] shadow-[0_0_22px_rgba(34,211,238,0.45)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {phase === "reveal" ? (
          <div className="grid grid-cols-[104px_1fr] gap-3 sm:grid-cols-[160px_1fr] sm:items-start">
            {revealImageUrl ? (
              <div
                aria-label="Visuel de la reponse"
                className="bt-audio-disc aspect-square w-full rounded-2xl border border-cyan-300/15 bg-cover bg-center shadow-[0_0_34px_rgba(34,211,238,0.16)] sm:rounded-3xl"
                data-state={audioMotionState}
                role="img"
                style={{ backgroundImage: `url(${revealImageUrl})` }}
              />
            ) : (
              <div
                className="bt-audio-disc flex aspect-square w-full items-center justify-center rounded-2xl border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.16),rgba(217,70,239,0.14),rgba(15,23,42,0.94))] sm:rounded-3xl"
                data-state={audioMotionState}
              >
                <div className="bt-audio-disc-core h-14 w-14 rounded-full border-[12px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_26px_rgba(34,211,238,0.24)]" />
              </div>
            )}

            <div className="min-w-0 space-y-2">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
                  Reponse
                </p>
                <h2 className="mt-1 line-clamp-2 text-2xl font-semibold leading-tight text-white sm:text-5xl">
                  {mainAnswer}
                </h2>
              </div>

              <div className="grid gap-1.5">
                <RevealDetail label="Morceau" value={currentTrack.title} />
                <RevealDetail label="Artiste" value={currentTrack.artist} />
                <RevealDetail
                  label="Categorie"
                  value={currentTrack.category ?? "Blindtest"}
                />
                {hasDistinctSource ? (
                  <RevealDetail label="Source" value={sourceLabel} />
                ) : null}
              </div>
              <div className="rounded-2xl border border-cyan-300/10 bg-black/15 px-3 py-1.5">
                <AudioEqualizer isActive={isAudioMotionActive} size="compact" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex aspect-[4/3] max-h-[42vh] items-center justify-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.22),transparent_34%),linear-gradient(145deg,rgba(34,211,238,0.16),rgba(15,23,42,0.94))] shadow-[inset_0_0_58px_rgba(34,211,238,0.08)] sm:aspect-square">
            <div
              className="bt-audio-disc relative flex h-32 w-32 items-center justify-center rounded-full border border-cyan-200/20 bg-black/30 sm:h-44 sm:w-44"
              data-state={audioMotionState}
            >
              <div className="absolute h-52 w-52 rounded-full border border-cyan-300/10 sm:h-60 sm:w-60" />
              <div className="absolute h-40 w-40 rounded-full border border-fuchsia-300/10 sm:h-48 sm:w-48" />
              <div className="bt-audio-disc-core h-20 w-20 rounded-full border-[14px] border-cyan-100 border-r-fuchsia-300 shadow-[0_0_32px_rgba(34,211,238,0.28)] sm:h-24 sm:w-24 sm:border-[18px]" />
            </div>
            <div className="absolute bottom-3 rounded-full border border-cyan-300/10 bg-black/20 px-4 py-1">
              <AudioEqualizer isActive={isAudioMotionActive} size="compact" />
            </div>
          </div>
        )}

        {phase === "ready" ? (
          <p className="text-sm leading-6 text-zinc-400">
            Appuie sur Demarrer pour autoriser l audio et lancer le premier extrait.
          </p>
        ) : null}
        {phase === "guessing" ? (
          <p className="text-sm leading-6 text-zinc-400">
            La reponse reste cachee jusqu a la fin des {guessDurationSeconds}s.
          </p>
        ) : null}
        {audioStatus === "error" ? (
          <p className="text-sm leading-6 text-fuchsia-200">
            Extrait temporairement indisponible. Reessaie ou passe au suivant.
          </p>
        ) : null}
        {audioNotice ? (
          <p className="text-sm leading-6 text-cyan-100">{audioNotice}</p>
        ) : null}
        {providerStatus === "loading" ? (
          <p className="text-sm leading-6 text-cyan-100">
            Recherche de previews musicales en cours.
          </p>
        ) : null}
        {providerStatus === "error" && providerError ? (
          <p className="text-sm leading-6 text-fuchsia-200">
            {providerError}
          </p>
        ) : null}
        {isPaused ? (
          <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1 text-xs font-semibold text-cyan-100">
            Pause
          </span>
        ) : null}
      </Card>
    </PageShell>
  );
}

type RevealDetailProps = {
  label: string;
  value?: string;
};

function RevealDetail({ label, value }: RevealDetailProps) {
  return (
    <div className="grid grid-cols-[72px_1fr] items-center gap-2 rounded-xl border border-cyan-300/12 bg-cyan-300/[0.045] px-2.5 py-1.5 sm:grid-cols-[92px_1fr]">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cyan-200">
        {label}
      </p>
      <p className="truncate text-xs font-semibold leading-5 text-white sm:text-sm">
        {value ?? "Inconnue"}
      </p>
    </div>
  );
}
