import Link from 'next/link';
import { SPECIALISM_LABELS } from '@/lib/constants';

export default function PTCard({ trainer, reasons }) {
  const initials = trainer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="card p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold text-lg shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{trainer.name}</h3>
            {trainer.featured && (
              <span className="pill bg-amber-100 text-amber-800">Featured</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {trainer.location || 'Location not set'} · £{trainer.priceMin}–£{trainer.priceMax}/session
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-700 line-clamp-3">{trainer.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {trainer.specialisms.slice(0, 4).map((s) => (
          <span key={s} className="pill bg-slate-100 text-slate-700">
            {SPECIALISM_LABELS[s] ?? s}
          </span>
        ))}
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="text-xs text-slate-600 space-y-1">
          {reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-start gap-1.5">
              <span className="text-brand-600 mt-0.5">✓</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Link href={`/pts/${trainer.id}`} className="btn-secondary text-sm flex-1">
          View profile
        </Link>
      </div>
    </article>
  );
}
