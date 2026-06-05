"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getRoomByCode,
  getRoomPlayers,
} from "@/features/multiplayer/multiplayer.service";
import type { Room, RoomPlayer } from "@/types/multiplayer";

type RoomLobbyClientProps = {
  code: string;
};

export function RoomLobbyClient({ code }: RoomLobbyClientProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copier le code");
  const [isLoading, setIsLoading] = useState(true);

  const loadLobby = useCallback(async () => {
    setIsLoading(true);
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
      void loadLobby();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadLobby]);

  async function handleCopyCode() {
    if (!room) {
      return;
    }

    await navigator.clipboard.writeText(room.code);
    setCopyLabel("Code copie");
    window.setTimeout(() => setCopyLabel("Copier le code"), 1400);
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
        <Badge>Lobby</Badge>
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
          Hote : {room.hostName} - Statut : {room.status}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {players.map((player) => (
          <div
            className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.045] p-4"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-fit" onClick={handleCopyCode}>
          {copyLabel}
        </Button>
        <Button className="w-full sm:w-fit" onClick={() => void loadLobby()} variant="secondary">
          Rafraichir
        </Button>
        <button
          className="min-h-14 rounded-full border border-white/10 bg-white/[0.03] px-6 text-base font-semibold text-zinc-500"
          disabled
          type="button"
        >
          Demarrer bientot
        </button>
      </div>
    </div>
  );
}
