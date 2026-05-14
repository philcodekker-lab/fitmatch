import Link from 'next/link';
import ScoreRing from './ScoreRing';

// Compact match card used for the #2/#3 highlighted slots and for the
// expanded "more matches" grid (#4 onwards). The Contact CTA deep-links into
// the trainer profile, where the actual mailto: lives — we don't expose
// emails on the /api/match payload.
export default function MatchCard({ trainer, rank }) {
  const initials = trainer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const firstName = trainer.name.split(' ')[0];
  const rankLabel = `No.${String(rank).padStart(2, '0')}`;

  return (
    <article className="card p-5 sm:p-6 flex flex-col gap-4 h-full">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-brand-50 grid place-items-center shrink-0">
          {trainer.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trainer.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-brand-700 font-semibold">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="mono-meta">{rankLabel}</span>
            {trainer.featured && <span className="pill-lime">● Featured</span>}
          </div>
          <h3 className="font-display text-lg font-semibold text-ink-900 mt-1 truncate">
            {trainer.name}
          </h3>
          <p className="text-sm text-ink-500">
            {trainer.location || '—'} · £{trainer.priceMin}–£{trainer.priceMax}
          </p>
        </div>
        <ScoreRing score={trainer.score} size={56} />
      </div>

      <p className="text-sm text-ink-700 line-clamp-2">{trainer.bio}</p>

      {trainer.reasons && trainer.reasons.length > 0 && (
        <ul className="text-xs text-ink-700 space-y-1">
          {trainer.reasons.slice(0, 2).map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="text-brand-600 mt-0.5">✓</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Link href={`/pts/${trainer.id}`} className="btn-secondary text-sm flex-1 justify-center">
          View
        </Link>
        <Link href={`/pts/${trainer.id}#contact`} className="btn-primary text-sm flex-1 justify-center">
          Contact {firstName}
        </Link>
      </div>
    </article>
  );
}
