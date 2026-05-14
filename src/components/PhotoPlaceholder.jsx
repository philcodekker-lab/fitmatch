// Striped diagonal placeholder used wherever imagery is missing.
// 135° repeating ink stripes at 6% alpha on a warm surface.
export default function PhotoPlaceholder({ label, className = '', children }) {
  return (
    <div
      className={`relative overflow-hidden bg-surface2 ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(20,18,12,0.06) 0px, rgba(20,18,12,0.06) 1px, transparent 1px, transparent 12px)',
      }}
      aria-hidden={label ? undefined : true}
    >
      {children}
      {label && (
        <span className="absolute bottom-2.5 left-3 mono-meta text-ink-400">{label}</span>
      )}
    </div>
  );
}
