import Link from 'next/link';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import { SPECIALISM_LABELS } from '@/lib/constants';
import Mono from '@/components/Mono';
import TrainerCard from '@/components/TrainerCard';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';

export const dynamic = 'force-dynamic';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Tell us your goal',
    body: 'A 60-second quiz: what you want to change, how you like to train, what you can spend.',
  },
  {
    n: '02',
    title: 'We score every trainer',
    body: 'Specialism, training style, experience level, budget, location — all weighted to your answers.',
  },
  {
    n: '03',
    title: 'Pick from the top three',
    body: 'See the strongest matches with the reasons they ranked. Message anyone who fits.',
  },
];

function HeroPreviewStack({ trainers }) {
  // Up to three trainers fed in; pad to keep the visual rhythm.
  const data = trainers.slice(0, 3);
  const rotations = ['-rotate-3', 'rotate-[2.5deg]', '-rotate-1'];
  const offsets = ['top-0 left-0', 'top-16 left-12', 'top-32 left-0'];
  const fills = ['bg-surface', 'bg-ink-900 text-white', 'bg-surface'];

  return (
    <div className="relative hidden lg:block h-[480px]">
      {data.map((t, i) => (
        <div
          key={t.id}
          className={`absolute w-[300px] rounded-card shadow-lift border border-line p-5 ${fills[i]} ${rotations[i]} ${offsets[i]}`}
        >
          <div className="flex items-center justify-between">
            <Mono>No.0{i + 1}</Mono>
            <div className="flex items-center gap-2">
              {t.featured && (
                <span className="pill-lime text-[10px] py-0.5 px-2">● Featured</span>
              )}
              <span className={`mono-meta ${i === 1 ? 'text-lime' : 'text-brand-600'}`}>
                {88 - i * 6}% match
              </span>
            </div>
          </div>
          <div className="mt-4 aspect-[4/3] rounded-xl overflow-hidden">
            {t.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <PhotoPlaceholder className="w-full h-full" label={t.name.split(' ')[0]} />
            )}
          </div>
          <p className={`font-display text-lg mt-3 font-semibold ${i === 1 ? 'text-white' : 'text-ink-900'}`}>
            {t.name}
          </p>
          <p className={`text-xs mt-0.5 ${i === 1 ? 'text-white/70' : 'text-ink-500'}`}>
            {t.location} · £{t.priceMin}–£{t.priceMax}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {t.specialisms.slice(0, 2).map((s) => (
              <span
                key={s}
                className={
                  'pill text-[10px] py-0.5 px-2 ' +
                  (i === 1
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'bg-line2 text-ink-700')
                }
              >
                {SPECIALISM_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function LandingPage() {
  const all = await prisma.trainerProfile.findMany({
    where: { approved: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 8,
  });
  const trainers = all.map(decodeProfile);
  const featured = trainers.filter((t) => t.featured).slice(0, 3);
  const heroStack = (featured.length > 0 ? featured : trainers).slice(0, 3);
  const featuredForGrid = (featured.length > 0 ? featured : trainers).slice(0, 3);

  return (
    <>
      {/* ────────────────────── 1. HERO ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid gap-12 lg:gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div>
            <Mono rule>Find the right PT for your goals</Mono>
            <h1 className="font-display text-[44px] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight mt-5 text-ink-900">
              Your goals are{' '}
              <em className="not-italic font-medium text-brand-600">specific.</em>{' '}
              Your trainer should be too.
            </h1>
            <p className="text-ink-700 text-lg mt-6 max-w-xl">
              Take a 60-second quiz. We score every trainer against your answers and surface
              the strongest three matches — with the reasons they fit.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link href="/quiz" className="btn-accent text-base">
                Start the quiz →
              </Link>
              <a href="#how-it-works" className="btn-ghost text-base">
                How matching works
              </a>
            </div>

            <dl className="mt-10 pt-6 border-t border-line grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="mono-meta">Trainers</dt>
                <dd className="font-display text-2xl font-semibold mt-1">217</dd>
              </div>
              <div>
                <dt className="mono-meta">Quiz time</dt>
                <dd className="font-display text-2xl font-semibold mt-1">60s</dd>
              </div>
              <div>
                <dt className="mono-meta">To browse</dt>
                <dd className="font-display text-2xl font-semibold mt-1">£0</dd>
              </div>
            </dl>
          </div>

          <HeroPreviewStack trainers={heroStack} />
        </div>
      </section>

      {/* ────────────────────── 2. HOW IT WORKS ────────────────────── */}
      <section id="how-it-works" className="bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Mono rule>How it works</Mono>
              <h2 className="font-display text-3xl sm:text-5xl tracking-tight mt-4 text-ink-900 max-w-xl">
                Three steps. About a minute. Better than browsing for hours.
              </h2>
            </div>
          </div>

          <div className="mt-10 rounded-card overflow-hidden bg-line grid sm:grid-cols-3 gap-px">
            {HOW_STEPS.map((s) => (
              <div key={s.n} className="bg-surface p-6 sm:p-8 flex flex-col gap-5">
                <span className="font-mono text-sm font-semibold text-lime-dark">{s.n}</span>
                <h3 className="font-display text-2xl font-semibold leading-snug text-ink-900">
                  {s.title}
                </h3>
                <p className="text-ink-700">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── 3. FEATURED TRAINERS ────────────────────── */}
      {featuredForGrid.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Mono rule>This week&apos;s featured</Mono>
              <h2 className="font-display text-3xl sm:text-5xl tracking-tight mt-4 text-ink-900">
                People you might match with.
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                className="w-11 h-11 rounded-full border border-line text-ink-700 hover:border-ink-300 grid place-items-center"
                aria-label="Previous"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="w-11 h-11 rounded-full bg-ink-900 text-white hover:bg-brand-700 grid place-items-center"
                aria-label="Next"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredForGrid.map((t, i) => (
              <TrainerCard key={t.id} trainer={t} index={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ────────────────────── 4. FOR TRAINERS STRIP ────────────────────── */}
      <section className="bg-ink-900 text-white relative overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 bg-lime/10 blur-3xl rounded-full"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-end">
            <div>
              <Mono className="text-ink-300">For trainers</Mono>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-tight tracking-tight mt-4">
                List your profile.{' '}
                <em className="not-italic font-medium text-lime">Get matched</em> with people
                actually looking for what you do.
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/pt/signup" className="btn-accent">
                  Join as a trainer
                </Link>
                <Link
                  href="/pt/login"
                  className="btn-ghost text-white hover:bg-white/10 hover:text-white"
                >
                  Trainer login
                </Link>
              </div>
            </div>
            <ul className="space-y-0 lg:pl-12">
              {[
                'Free to list while we&apos;re in early access.',
                'Specialism-first matching — no &quot;personal trainer near me&quot; SEO race.',
                'Direct enquiries by email. No platform fees in the MVP.',
              ].map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 py-4 border-t border-white/10 first:border-t-0"
                >
                  <span className="text-lime mt-0.5">✓</span>
                  <span
                    className="text-white/85 text-base"
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ────────────────────── 5. FINAL CTA ────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <Mono>Ready when you are</Mono>
        <h2 className="font-display text-4xl sm:text-6xl tracking-tight mt-5 leading-[1.05]">
          Find a trainer who actually <em className="not-italic font-medium text-brand-600">fits.</em>
        </h2>
        <p className="text-ink-700 mt-5 text-lg">
          The quiz takes about a minute. No account needed to see your matches.
        </p>
        <div className="mt-8">
          <Link href="/quiz" className="btn-accent text-base">
            Take the quiz →
          </Link>
        </div>
      </section>
    </>
  );
}
