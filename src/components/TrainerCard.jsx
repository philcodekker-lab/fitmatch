import Link from 'next/link';
import { SPECIALISM_LABELS } from '@/lib/constants';
import PhotoPlaceholder from './PhotoPlaceholder';

// Featured-trainers card used on the landing page. Photo on top (4:3),
// indexed label (No.0N) + featured pill, name, location, pricing, bio,
// specialism pills along a divider.
export default function TrainerCard({ trainer, index = 1 }) {
  const idx = String(index).padStart(2, '0');
  const initials = trainer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="card overflow-hidden flex flex-col">
      <Link href={`/pts/${trainer.id}`} className="group block">
        <div className="aspect-[4/3] relative">
          {trainer.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trainer.photoUrl}
              alt={trainer.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <PhotoPlaceholder
              label={initials}
              className="w-full h-full"
            />
          )}
        </div>
      </Link>

      <div className="p-5 sm:p-6 flex flex-col gap-3 grow">
        <div className="flex items-center justify-between">
          <span className="mono-meta">No.{idx}</span>
          {trainer.featured && <span className="pill-lime">● Featured</span>}
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-ink-900 leading-tight">
            <Link href={`/pts/${trainer.id}`} className="hover:underline">
              {trainer.name}
            </Link>
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            {trainer.location || 'Location not set'} · £{trainer.priceMin}–£{trainer.priceMax}/session
          </p>
        </div>

        <p className="text-sm text-ink-700 line-clamp-3">{trainer.bio}</p>

        <div className="pt-3 mt-auto border-t border-line2 flex flex-wrap gap-1.5">
          {trainer.specialisms.slice(0, 3).map((s) => (
            <span key={s} className="pill-muted">
              {SPECIALISM_LABELS[s] ?? s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
