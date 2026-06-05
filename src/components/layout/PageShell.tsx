import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <section className="relative isolate flex min-h-dvh items-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,#050611_0%,#0a0d21_44%,#13071f_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(34,211,238,0.06)_48%,transparent_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.75),rgba(217,70,239,0.7),transparent)]" />
        <div className="absolute inset-x-6 bottom-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.45),transparent)]" />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {children}
        </div>
      </section>
    </main>
  );
}
