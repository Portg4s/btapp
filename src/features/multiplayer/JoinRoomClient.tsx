"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { joinRoom } from "@/features/multiplayer/multiplayer.service";

type JoinRoomClientProps = {
  initialCode?: string;
};

export function JoinRoomClient({ initialCode = "" }: JoinRoomClientProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await joinRoom({ code, nickname });

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error);
      return;
    }

    window.sessionStorage.setItem(
      `bt-room-player-${result.data.room.code}`,
      result.data.player.id,
    );
    router.push(
      `/multiplayer/room/${result.data.room.code}?playerId=${result.data.player.id}`,
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Code session
        </span>
        <input
          className="min-h-14 w-full rounded-2xl border border-cyan-300/15 bg-black/25 px-4 text-base font-semibold uppercase tracking-[0.12em] text-white outline-none transition focus:border-cyan-200/60"
          maxLength={8}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="ABC123"
          value={code}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Pseudo joueur
        </span>
        <input
          className="min-h-14 w-full rounded-2xl border border-cyan-300/15 bg-black/25 px-4 text-base font-semibold text-white outline-none transition focus:border-cyan-200/60"
          maxLength={32}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Ton pseudo"
          value={nickname}
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-3 text-sm leading-6 text-fuchsia-100">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Connexion..." : "Rejoindre la session"}
      </Button>
    </form>
  );
}
