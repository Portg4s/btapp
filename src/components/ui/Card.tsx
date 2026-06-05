import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
};

export function Card({
  as: Component = "article",
  className = "",
  ...props
}: CardProps) {
  return (
    <Component
      className={`rounded-3xl border border-cyan-300/15 bg-slate-950/55 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-md ${className}`}
      {...props}
    />
  );
}
