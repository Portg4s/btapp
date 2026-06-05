const equalizerBars = [14, 24, 18, 30, 22, 28, 16];

type AudioEqualizerProps = {
  isActive: boolean;
  size?: "compact" | "default";
};

export function AudioEqualizer({
  isActive,
  size = "default",
}: AudioEqualizerProps) {
  const barClassName =
    size === "compact"
      ? "bt-eq-bar w-1 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.75)]"
      : "bt-eq-bar w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.8)]";
  const heightScale = size === "compact" ? 0.72 : 1;

  return (
    <div
      aria-hidden="true"
      className="flex h-8 items-end justify-center gap-1"
    >
      {equalizerBars.map((height, index) => (
        <span
          className={barClassName}
          key={`${height}-${index}`}
          style={{
            animationDelay: `${index * 90}ms`,
            animationPlayState: isActive ? "running" : "paused",
            height: Math.round(height * heightScale),
          }}
        />
      ))}
    </div>
  );
}
