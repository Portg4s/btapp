"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createRoom } from "@/features/multiplayer/multiplayer.service";

export function CreateRoomClient() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createRoom({
      hostName,
      settings: {
        source: "multiplayer-lobby-v1",
      },
    });

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error);
      return;
    }

    router.push(`/multiplayer/room/${result.data.code}`);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Pseudo hote
        </span>
        <input
          className="min-h-14 w-full rounded-2xl border border-cyan-300/15 bg-black/25 px-4 text-base font-semibold text-white outline-none transition focus:border-cyan-200/60"
          maxLength={32}
          onChange={(event) => setHostName(event.target.value)}
          placeholder="Ton pseudo"
          value={hostName}
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] px-4 py-3 text-sm leading-6 text-fuchsia-100">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creation..." : "Creer la session"}
      </Button>
    </form>
  );
}
