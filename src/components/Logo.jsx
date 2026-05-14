import Link from 'next/link';

// F• monogram (the dot reads as a locator pin), in a dark rounded square,
// followed by the wordmark in the display face.
export default function Logo({ size = 'md', href = '/' }) {
  const dims =
    size === 'sm' ? 'w-7 h-7 text-sm' : size === 'lg' ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-base';
  const wordSize = size === 'lg' ? 'text-2xl' : 'text-[22px]';

  return (
    <Link href={href} className="inline-flex items-center gap-2 font-display font-semibold text-ink-900">
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-ink-900 text-lime font-mono font-semibold ${dims}`}
        aria-hidden="true"
      >
        <span className="leading-none">
          F<span className="text-lime">•</span>
        </span>
      </span>
      <span className={`${wordSize} leading-none tracking-tight`}>FindMyPT</span>
    </Link>
  );
}
