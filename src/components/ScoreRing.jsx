// Circular match-score indicator. Conic gradient draws the arc, inner disc
// covers the centre so the score sits on the surface colour.
export default function ScoreRing({ score = 0, size = 56, label = 'match' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      role="img"
      aria-label={`${clamped}% ${label}`}
      className="grid place-items-center rounded-full relative shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#1A5640 ${clamped}%, #E5DFD0 0)`,
      }}
    >
      <div className="absolute inset-1 rounded-full bg-surface" />
      <span className="relative font-semibold text-ink-900" style={{ fontSize: Math.round(size * 0.32) }}>
        {clamped}
      </span>
    </div>
  );
}
