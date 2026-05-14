import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import {
  SPECIALISM_LABELS,
  TRAINING_STYLES,
  EXPERIENCE_LEVELS,
} from '@/lib/constants';
import Mono from '@/components/Mono';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';

export const dynamic = 'force-dynamic';

// -----------------------------------------------------------------------------
// TODO — when we add these to the Prisma schema, replace these stub helpers
// with real values from the row. See the bottom of the PR brief for the full
// list of fields to add.
// -----------------------------------------------------------------------------

// Deterministic stub helpers — derive plausible values from the trainer id so
// each profile feels distinct without persisting anything to the DB yet.
function hash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function stubResponseHours(t) {
  return 2 + (hash(t.id) % 8);
}
function stubAccepting(t) {
  return (hash(t.id + 'a') % 7) !== 0;
}
function stubCredentials(t) {
  const pool = [
    'Level 4 Personal Trainer (CIMSPA)',
    'Strength &amp; Conditioning (UKSCA)',
    'Pre / Post-natal certified',
    'Olympic lifting Level 1',
    'Sports Massage Level 3',
    'Nutrition coaching (Precision Nutrition)',
    'CPR / First Aid certified',
    'Mobility specialist (FRC)',
  ];
  const seed = hash(t.id + 'c');
  const count = 3 + (seed % 3);
  return pool.slice(0, count);
}
function stubPricing(t) {
  const base = Math.max(40, t.priceMin || 60);
  return {
    single: base,
    sixPack: Math.round(base * 5.5),
    twelvePack: Math.round(base * 10),
    monthlyOnline: Math.round(Math.max(30, base * 0.4)) * 4,
  };
}
function stubWeekly(t) {
  // 7 day grid Mon-Sun. ~3 work, ~2 rest, ~2 light.
  const seed = hash(t.id + 'w');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const intensities = ['high', 'rest', 'mid', 'high', 'mid', 'rest', 'rest'];
  // shift the rest days a little for variety
  const offset = seed % 7;
  return days.map((label, i) => ({
    label,
    intensity: intensities[(i + offset) % 7],
  }));
}
function stubLanguages(t) {
  const pool = ['English', 'Polish', 'Spanish', 'French', 'Mandarin'];
  const seed = hash(t.id + 'l');
  const count = 1 + (seed % 2);
  return pool.slice(0, count);
}
function stubGyms(t) {
  const pool = [
    'Fitness First, London Bridge',
    'PureGym, Old Street',
    'Equinox, St James',
    'Independent studio (Manchester Northern Quarter)',
    'Client home (Greater London)',
  ];
  const seed = hash(t.id + 'g');
  return pool.slice(seed % 2, (seed % 2) + 1 + (seed % 2));
}
// -----------------------------------------------------------------------------

function buildSocialLinks(t) {
  const out = [];
  if (t.socialInstagram) {
    const h = t.socialInstagram.replace(/^@/, '').trim();
    if (h) out.push({ id: 'ig', label: 'Instagram', href: `https://instagram.com/${h}` });
  }
  if (t.socialTiktok) {
    const h = t.socialTiktok.replace(/^@/, '').trim();
    if (h) out.push({ id: 'tt', label: 'TikTok', href: `https://www.tiktok.com/@${h}` });
  }
  if (t.socialFacebook) {
    const u = t.socialFacebook.trim();
    if (u) out.push({ id: 'fb', label: 'Facebook', href: u.startsWith('http') ? u : `https://${u}` });
  }
  if (t.socialWebsite) {
    const u = t.socialWebsite.trim();
    if (u) out.push({ id: 'web', label: 'Website', href: u.startsWith('http') ? u : `https://${u}` });
  }
  return out;
}

function SocialIcon({ id }) {
  const c = 'w-4 h-4';
  if (id === 'ig')
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  if (id === 'tt')
    return (
      <svg className={c} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 8.5a6.5 6.5 0 0 1-4-1.4V15a5.5 5.5 0 1 1-5.5-5.5h.5v3h-.5A2.5 2.5 0 1 0 12 15V2h3a3.5 3.5 0 0 0 3.5 3.5h.5v3z" />
      </svg>
    );
  if (id === 'fb')
    return (
      <svg className={c} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2H17V2.1A30 30 0 0 0 14.4 2C11.9 2 10 3.5 10 6.9V10H7v4h3v8h3z" />
      </svg>
    );
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function WeeklyGrid({ days }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const restful = d.intensity === 'rest';
        return (
          <div
            key={d.label}
            className={
              'rounded-xl p-3 text-center text-xs ' +
              (restful
                ? 'bg-surface2 text-ink-400 border border-line2'
                : 'bg-brand-50 text-brand-700 border border-brand-100')
            }
          >
            <p className="mono-meta">{d.label}</p>
            <p className="mt-1 capitalize font-medium">{restful ? 'Rest' : d.intensity}</p>
          </div>
        );
      })}
    </div>
  );
}

export default async function TrainerProfilePage({ params }) {
  const row = await prisma.trainerProfile.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } } },
  });
  if (!row || !row.approved) notFound();

  const t = decodeProfile(row);
  const contactEmail = row.user.email;

  const initials = t.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const firstName = t.name.split(' ')[0];

  const socials = buildSocialLinks(t);
  const responseHours = stubResponseHours(t);
  const accepting = stubAccepting(t);
  const credentials = stubCredentials(t);
  const pricing = stubPricing(t);
  const week = stubWeekly(t);
  const languages = stubLanguages(t);
  const gyms = stubGyms(t);

  const subject = encodeURIComponent(`PT enquiry from FindMyPT — ${t.name}`);
  const body = encodeURIComponent(
    `Hi ${firstName},\n\nI found you on FindMyPT and would love to chat about training.\n\nThanks!`,
  );
  const mailto = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

  function labelMany(list, ids) {
    return ids.map((id) => list.find((x) => x.id === id)?.label ?? id).join(', ') || '—';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 pb-32">
      <Link href="/quiz" className="mono-meta text-ink-500 hover:text-ink-900">
        ← Back to matches
      </Link>

      {/* HERO */}
      <header className="mt-6 grid gap-8 md:grid-cols-[440px_1fr] items-start">
        <div className="aspect-[4/5] relative rounded-card overflow-hidden bg-surface2">
          {t.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
          ) : (
            <PhotoPlaceholder className="w-full h-full" label={initials} />
          )}
          {t.featured && (
            <span className="absolute top-4 left-4 pill-lime">● Featured</span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <Mono>PT profile · No.{t.id.slice(-4).toUpperCase()}</Mono>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[88px] leading-[1.02] tracking-tight mt-3 text-ink-900">
              {t.name}
            </h1>
          </div>

          <dl className="grid grid-cols-3 gap-4 max-w-md">
            <div>
              <dt className="mono-meta">Location</dt>
              <dd className="text-ink-900 mt-1 text-base font-medium">
                {t.location || '—'}
              </dd>
            </div>
            <div>
              <dt className="mono-meta">From</dt>
              <dd className="text-ink-900 mt-1 text-base font-medium">
                £{t.priceMin}/session
              </dd>
            </div>
            <div>
              <dt className="mono-meta">Replies</dt>
              <dd className="text-ink-900 mt-1 text-base font-medium">
                Within ~{responseHours}h
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-1.5">
            {t.specialisms.slice(0, 6).map((s) => (
              <span key={s} className="pill-outline">
                {SPECIALISM_LABELS[s] ?? s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href={mailto} id="contact" className="btn-primary">
              Contact {firstName}
            </a>
            <a href={mailto} className="btn-secondary">
              Book intro call
            </a>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-line text-ink-700 hover:border-ink-300"
              aria-label="Save"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-line text-ink-700 hover:border-ink-300"
              aria-label="Share"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
          </div>

          {socials.length > 0 && (
            <>
              <hr className="border-line2" />
              <div className="flex flex-wrap items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line text-ink-700 hover:border-ink-300 text-xs"
                  >
                    <SocialIcon id={s.id} />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* BODY */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div className="card p-6 sm:p-8">
            <Mono>About</Mono>
            <blockquote className="font-display text-2xl sm:text-3xl text-ink-900 leading-snug mt-3">
              “{t.bio.split(/[.!?]/)[0] || t.bio || 'A coach who fits your goals.'}”
            </blockquote>
            {t.bio && (
              <p className="text-ink-700 mt-4 whitespace-pre-line">
                {t.bio}
              </p>
            )}
          </div>

          {(t.caseStudies || (t.caseStudyMedia && t.caseStudyMedia.length > 0)) && (
            <div className="card p-6 sm:p-8">
              <Mono>Case studies</Mono>
              {t.caseStudies && (
                <p className="text-ink-700 mt-3 whitespace-pre-line">{t.caseStudies}</p>
              )}
              {t.caseStudyMedia && t.caseStudyMedia.length > 0 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {t.caseStudyMedia.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-surface2 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                      </div>
                      <p className="mono-meta text-ink-500">
                        Case 0{i + 1} · transformation
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card p-6 sm:p-8">
            <Mono>A typical week</Mono>
            <p className="text-ink-700 mt-2 text-sm">
              Sessions {t.name.split(' ')[0]} typically schedules with clients.
            </p>
            <div className="mt-5">
              <WeeklyGrid days={week} />
            </div>
          </div>
        </div>

        {/* Right column (sticky) */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <Mono>Pricing</Mono>
              {accepting && <span className="pill-lime">● Accepting new</span>}
            </div>
            <p className="mt-2 font-display text-4xl text-ink-900">
              From £{pricing.single}
            </p>
            <p className="mono-meta mt-1">Per session</p>

            <table className="w-full mt-5 text-sm">
              <tbody>
                <tr className="border-t border-line2">
                  <td className="py-2.5 text-ink-700">Single session</td>
                  <td className="py-2.5 text-right font-medium">£{pricing.single}</td>
                </tr>
                <tr className="border-t border-line2">
                  <td className="py-2.5 text-ink-700">6-pack</td>
                  <td className="py-2.5 text-right font-medium">£{pricing.sixPack}</td>
                </tr>
                <tr className="border-t border-line2">
                  <td className="py-2.5 text-ink-700">12-pack</td>
                  <td className="py-2.5 text-right font-medium">£{pricing.twelvePack}</td>
                </tr>
                <tr className="border-t border-line2">
                  <td className="py-2.5 text-ink-700">Online / month</td>
                  <td className="py-2.5 text-right font-medium">£{pricing.monthlyOnline}</td>
                </tr>
              </tbody>
            </table>

            <a href={mailto} className="btn-primary w-full justify-center mt-5">
              Contact {firstName}
            </a>
            <p className="text-xs text-ink-500 text-center mt-2">
              Opens your email app — no platform fees on the MVP.
            </p>
          </div>

          {t.currentOffer && (
            <div className="card-flat p-6">
              <Mono>Current offer</Mono>
              <p className="text-ink-900 mt-2 font-medium whitespace-pre-line">
                {t.currentOffer}
              </p>
            </div>
          )}

          <div className="card p-6">
            <Mono>Credentials</Mono>
            <ul className="mt-3 space-y-2 text-sm text-ink-900">
              {credentials.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="text-brand-600 mt-0.5">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: line }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <Mono>Works with</Mono>
            <dl className="mt-3 text-sm">
              <div className="flex items-start justify-between gap-4 border-t border-line2 py-2.5">
                <dt className="text-ink-500">Levels</dt>
                <dd className="text-right text-ink-900 font-medium">
                  {labelMany(EXPERIENCE_LEVELS, t.experienceLevels)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-line2 py-2.5">
                <dt className="text-ink-500">Style</dt>
                <dd className="text-right text-ink-900 font-medium">
                  {labelMany(TRAINING_STYLES, t.trainingStyles)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-line2 py-2.5">
                <dt className="text-ink-500">Languages</dt>
                <dd className="text-right text-ink-900 font-medium">
                  {languages.join(', ')}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-line2 py-2.5">
                <dt className="text-ink-500">Gyms</dt>
                <dd className="text-right text-ink-900 font-medium">
                  {gyms.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      {/* Mobile sticky contact bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 bg-gradient-to-t from-bg to-transparent">
        <a href={mailto} className="btn-primary w-full justify-center shadow-lift">
          Contact {firstName}
        </a>
      </div>
    </div>
  );
}
