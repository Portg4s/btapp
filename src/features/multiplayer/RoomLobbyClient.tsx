"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { mockPlaylists } from "@/data/mockPlaylists";
import { searchItunesTracks } from "@/features/music/musicProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getRoomByCode,
  getRoomPlayers,
  startMultiplayerGame,
} from "@/features/multiplayer/multiplayer.service";
import type { MiniGameMode } from "@/types/game";
import type {
  MultiplayerGameSettings,
  Room,
  RoomPlayer,
} from "@/types/multiplayer";
import type { Playlist, PlaylistDifficulty } from "@/types/music";

type RoomLobbyClientProps = {
  code: string;
  initialPlayerId?: string;
};

const modeLabels: Record<MiniGameMode, string> = {
  artist: "Devine l'artiste",
  track: "Devine le morceau",
};
const difficultyLabels: Record<PlaylistDifficulty, string> = {
  easy: "Facile",
  hard: "Difficile",
  medium: "Moyen",
};
const difficultyOptions: Array<{ label: string; value: PlaylistDifficulty }> = [
  { label: "Facile", value: "easy" },
  { label: "Moyen", value: "medium" },
  { label: "Difficile", value: "hard" },
];
const questionOptions = [10, 15];
const defaultThemeIds = mockPlaylists.slice(0, 3).map((theme) => theme.id);

function getThemeCategories(themes: Playlist[]) {
  return themes.flatMap((theme) =>
    theme.categories && theme.categories.length > 0
      ? theme.categories
      : [theme.name],
  );
}

function getStoredPlayerId(code: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(`bt-room-player-${code}`) ?? "";
}

export function RoomLobbyClient({
  code,
  initialPlayerId = "",
}: RoomLobbyClientProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copier le code");
  const [shareLabel, setShareLabel] = useState("Copier le lien");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [mode, setMode] = useState<MiniGameMode>("track");
  const [selectedThemeIds, setSelectedThemeIds] = useState(defaultThemeIds);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<PlaylistDifficulty>("easy");

  const selectedThemes = useMemo(
    () => mockPlaylists.filter((theme) => selectedThemeIds.includes(theme.id)),
    [selectedThemeIds],
  );
  const currentPlayer = players.find((player) => player.id === playerId);
  const isHost = Boolean(currentPlayer?.isHost);
  const roomSettings = (room?.settings ?? {}) as Partial<MultiplayerGameSettings>;
  const displayedMode =
    room?.gameMode === "artist" || roomSettings.mode === "artist"
      ? "artist"
      : mode;
  const displayedQuestionCount = roomSettings.questionCount ?? questionCount;
  const displayedDifficulty = roomSettings.difficulty ?? difficulty;
  const displayedThemeIds =
    roomSettings.themeIds && roomSettings.themeIds.length > 0
      ? roomSettings.themeIds
      : selectedThemeIds;
  const displayedThemes = mockPlaylists.filter((theme) =>
    displayedThemeIds.includes(theme.id),
  );
  const playHref = room
    ? `/multiplayer/room/${room.code}/play?playerId=${playerId}`
    : "";

  const loadLobby = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    const roomResult = await getRoomByCode(code);

    if (roomResult.error || !roomResult.data) {
      setRoom(null);
      setPlayers([]);
      setError(roomResult.error);
      setIsLoading(false);
      return;
    }

    const playersResult = await getRoomPlayers(roomResult.data.id);

    setRoom(roomResult.data);
    setPlayers(playersResult.data ?? []);
    setError(playersResult.error);
    setIsLoading(false);
  }, [code]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPlayerId((currentPlayerId) => currentPlayerId || getStoredPlayerId(code));
      void loadLobby();
    }, 0);

    const interval = window.setInterval(() => {
      void loadLobby({ silent: true });
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [code, loadLobby]);

  async function handleCopyCode() {
    if (!room) {
      return;
    }

    await navigator.clipboard.writeText(room.code);
    setCopyLabel("Code copie");
    window.setTimeout(() => setCopyLabel("Copier le code"), 1400);
  }

  async function handleCopyInviteLink() {
    if (!room) {
      return;
    }

    const invitePath = `/multiplayer/join?code=${encodeURIComponent(room.code)}`;
    const inviteUrl =
      typeof window === "undefined"
        ? invitePath
        : `${window.location.origin}${invitePath}`;

    await navigator.clipboard.writeText(inviteUrl);
    setShareLabel("Lien copie");
    window.setTimeout(() => setShareLabel("Copier le lien"), 1400);
  }

  function toggleTheme(themeId: string) {
    setSelectedThemeIds((currentThemeIds) =>
      currentThemeIds.includes(themeId)
        ? currentThemeIds.filter((currentThemeId) => currentThemeId !== themeId)
        : [...currentThemeIds, themeId],
    );
  }

  async function handleStartGame() {
    if (!room || !isHost || selectedThemes.length === 0) {
      return;
    }

    setIsStarting(true);
    setStartError(null);

    const settings: MultiplayerGameSettings = {
      difficulty,
      mode,
      questionCount,
      themeIds: selectedThemeIds,
      themes: getThemeCategories(selectedThemes),
    };
    const result = await searchItunesTracks({
      categories: settings.themes,
      category: selectedThemes.map((theme) => theme.name).join(", "),
      difficulty,
      limit: questionCount,
    });

    if (result.tracks.length < questionCount) {
      setIsStarting(false);
      setStartError(
        result.error ??
          "Pas assez d'extraits pour cette configuration. Choisis plus de themes ou reduis le nombre de questions.",
      );
      return;
    }

    const startResult = await startMultiplayerGame({
      gameMode: mode,
      roomId: room.id,
      settings,
      tracks: result.tracks,
    });

    setIsStarting(false);

    if (startResult.error || !startResult.data) {
      setStartError(startResult.error);
      return;
    }

    router.push(`/multiplayer/room/${room.code}/play?playerId=${playerId}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Badge>Lobby</Badge>
        <p className="text-base leading-7 text-zinc-300">
          Chargement de la session {code}...
        </p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-5">
        <Badge>Lobby indisponible</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Impossible d&apos;ouvrir cette session.
          </h1>
          <p className="text-base leading-7 text-zinc-300">
            {error ?? "Session introuvable."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-fit" href="/multiplayer/join">
            Rejoindre une autre session
          </Button>
          <Button className="w-full sm:w-fit" href="/multiplayer" variant="secondary">
            Retour multijoueur
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Badge>{room.status === "lobby" ? "Lobby" : "Partie en cours"}</Badge>
        <Button className="w-full sm:w-fit" href="/multiplayer" variant="ghost">
          Retour
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Code session
        </p>
        <h1 className="text-5xl font-black tracking-[0.12em] text-white sm:text-6xl">
          {room.code}
        </h1>
        <p className="text-base leading-7 text-zinc-300">
          Hote : {room.hostName} - {players.length} joueur
          {players.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile label="Mode" value={modeLabels[displayedMode]} />
        <InfoTile label="Questions" value={String(displayedQuestionCount)} />
        <InfoTile label="Difficulte" value={difficultyLabels[displayedDifficulty]} />
        <InfoTile
          label="Themes"
          value={
            displayedThemes.length > 0
              ? displayedThemes.map((theme) => theme.name).join(", ")
              : "A choisir"
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {players.map((player) => (
          <div
            className={`rounded-2xl border p-4 ${
              player.id === currentPlayer?.id
                ? "border-cyan-200/55 bg-cyan-300/[0.12] shadow-[0_0_24px_rgba(34,211,238,0.16)]"
                : "border-cyan-300/12 bg-cyan-300/[0.045]"
            }`}
            key={player.id}
          >
            <p className="text-base font-semibold text-white">
              {player.nickname}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {player.isHost ? "Hote" : "Joueur"}
            </p>
          </div>
        ))}
      </div>

      {room.status === "lobby" ? (
        isHost ? (
          <div className="space-y-4 rounded-3xl border border-cyan-300/14 bg-black/20 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                Configuration
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Choisis le mini-jeu et les themes avant de lancer la partie.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ConfigGroup title="Mode">
                <div className="grid gap-2">
                  {(["track", "artist"] as MiniGameMode[]).map((modeOption) => (
                    <button
                      className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold ${
                        mode === modeOption
                          ? "border-cyan-200/55 bg-cyan-300/[0.14] text-white"
                          : "border-cyan-300/12 bg-cyan-300/[0.045] text-zinc-300"
                      }`}
                      key={modeOption}
                      onClick={() => setMode(modeOption)}
                      type="button"
                    >
                      {modeLabels[modeOption]}
                    </button>
                  ))}
                </div>
              </ConfigGroup>

              <ConfigGroup title="Questions">
                <div className="grid grid-cols-2 gap-2">
                  {questionOptions.map((option) => (
                    <button
                      className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                        questionCount === option
                          ? "border-fuchsia-200/55 bg-fuchsia-300/[0.14] text-white"
                          : "border-fuchsia-300/12 bg-fuchsia-300/[0.045] text-zinc-300"
                      }`}
                      key={option}
                      onClick={() => setQuestionCount(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </ConfigGroup>
            </div>

            <ConfigGroup title="Difficulte">
              <div className="grid grid-cols-3 gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    className={`rounded-2xl border px-2 py-2 text-sm font-semibold ${
                      difficulty === option.value
                        ? "border-cyan-200/55 bg-cyan-300/[0.14] text-white"
                        : "border-cyan-300/12 bg-cyan-300/[0.045] text-zinc-300"
                    }`}
                    key={option.value}
                    onClick={() => setDifficulty(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </ConfigGroup>

            <ConfigGroup title="Themes">
              <div className="grid gap-2 sm:grid-cols-3">
                {mockPlaylists.map((theme) => {
                  const isSelected = selectedThemeIds.includes(theme.id);

                  return (
                    <button
                      className={`rounded-2xl border p-3 text-left text-sm font-semibold ${
                        isSelected
                          ? "border-cyan-200/55 bg-cyan-300/[0.13] text-white"
                          : "border-white/10 bg-black/20 text-zinc-300"
                      }`}
                      key={theme.id}
                      onClick={() => toggleTheme(theme.id)}
                      type="button"
                    >
                      {theme.name}
                    </button>
                  );
                })}
              </div>
            </ConfigGroup>

            {startError ? (
              <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-3 text-sm leading-6 text-fuchsia-100">
                {startError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-base font-semibold text-white">
              En attente de l&apos;hote
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              L&apos;hote choisit le mode, les themes, puis lance la partie.
            </p>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/[0.06] p-4">
          <p className="text-base font-semibold text-white">
            La partie est lancee.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Rejoins l&apos;ecran de jeu sur cet appareil.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-fit" onClick={handleCopyCode}>
          {copyLabel}
        </Button>
        <Button className="w-full sm:w-fit" onClick={handleCopyInviteLink} variant="secondary">
          {shareLabel}
        </Button>
        <Button className="w-full sm:w-fit" onClick={() => void loadLobby()} variant="secondary">
          Rafraichir
        </Button>
        {room.status === "lobby" ? (
          isHost ? (
            <Button
              className="w-full sm:w-fit"
              disabled={isStarting || selectedThemeIds.length === 0}
              onClick={handleStartGame}
            >
              {isStarting ? "Preparation..." : "Demarrer la partie"}
            </Button>
          ) : (
            <button
              className="min-h-14 rounded-full border border-white/10 bg-white/[0.03] px-6 text-base font-semibold text-zinc-500"
              disabled
              type="button"
            >
              En attente de l&apos;hote
            </button>
          )
        ) : (
          <Button className="w-full sm:w-fit" href={playHref}>
            Rejoindre la partie
          </Button>
        )}
      </div>
    </div>
  );
}

function ConfigGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/12 bg-black/20 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-200">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">
        {value}
      </p>
    </div>
  );
}
