import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import { SPECIALISM_LABELS, TRAINING_STYLES, EXPERIENCE_LEVELS } from '@/lib/constants';

export default async function TrainerProfilePage({ params }) {
  const profile = await prisma.trainerProfile.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } } },
  });
  if (!profile || !profile.approved) notFound();

  const t = decodeProfile(profile);
  const initials = t.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function labelMany(list, ids) {
    return ids.map((id) => list.find((x) => x.id === id)?.label ?? id).join(', ');
  }

  const subject = encodeURIComponent(`PT enquiry from FitMatch — ${t.name}`);
  const body = encodeURIComponent(
    `Hi ${t.name.split(' ')[0]},\n\nI found you on FitMatch and would love to chat about training.\n\nThanks!`,
  );
  const mailto = `mailto:${profile.user.email}?subject=${subject}&body=${body}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link href="/quiz" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back
      </Link>

      <header className="mt-4 flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold text-2xl shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-semibold text-slate-900">{t.name}</h1>
            {t.featured && <span className="pill bg-amber-100 text-amber-800">Featured</span>}
          </div>
          <p className="text-slate-500 mt-1">
            {t.location || 'Location not set'} · £{t.priceMin}–£{t.priceMax}/session
          </p>
        </div>
      </header>

      <section className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">About</h2>
            <p className="text-slate-700 mt-2 whitespace-pre-line">{t.bio || 'No bio yet.'}</p>
          </div>

          {t.caseStudies && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900">Case studies</h2>
              <p className="text-slate-700 mt-2 whitespace-pre-line">{t.caseStudies}</p>
            </div>
          )}

          {t.currentOffer && (
            <div className="card p-6 bg-brand-50 border-brand-200">
              <h2 className="font-semibold text-brand-900">Current offer</h2>
              <p className="text-brand-900/90 mt-2 whitespace-pre-line">{t.currentOffer}</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Specialisms</h3>
            <div className="flex flex-wrap gap-1.5">
              {t.specialisms.length ? (
                t.specialisms.map((s) => (
                  <span key={s} className="pill bg-slate-100 text-slate-700">
                    {SPECIALISM_LABELS[s] ?? s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">Not listed.</span>
              )}
            </div>
          </div>

          <div className="card p-6 space-y-3 text-sm">
            <div>
              <div className="text-slate-500">Training style</div>
              <div className="text-slate-900">
                {labelMany(TRAINING_STYLES, t.trainingStyles) || '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Works with</div>
              <div className="text-slate-900">
                {labelMany(EXPERIENCE_LEVELS, t.experienceLevels) || '—'}
              </div>
            </div>
          </div>

          <a href={mailto} className="btn-primary w-full">
            Contact {t.name.split(' ')[0]}
          </a>
        </aside>
      </section>
    </div>
  );
}
