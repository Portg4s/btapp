import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLDivElement>;

export function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.07] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)] ${className}`}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.85)]" />
      {children}
    </div>
  );
}
