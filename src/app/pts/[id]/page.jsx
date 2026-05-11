import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import { SPECIALISM_LABELS, TRAINING_STYLES, EXPERIENCE_LEVELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function buildSocialLinks(t) {
  const out = [];
  if (t.socialInstagram) {
    const handle = t.socialInstagram.replace(/^@/, '').trim();
    if (handle) out.push({ id: 'ig', label: 'Instagram', href: `https://instagram.com/${handle}` });
  }
  if (t.socialTiktok) {
    const handle = t.socialTiktok.replace(/^@/, '').trim();
    if (handle) out.push({ id: 'tt', label: 'TikTok', href: `https://www.tiktok.com/@${handle}` });
  }
  if (t.socialFacebook) {
    const url = t.socialFacebook.trim();
    if (url) out.push({ id: 'fb', label: 'Facebook', href: url.startsWith('http') ? url : `https://${url}` });
  }
  if (t.socialWebsite) {
    const url = t.socialWebsite.trim();
    if (url) out.push({ id: 'web', label: 'Website', href: url.startsWith('http') ? url : `https://${url}` });
  }
  return out;
}

// Small icon component — uses inline SVGs so no extra library needed.
function SocialIcon({ id }) {
  const common = 'w-4 h-4';
  switch (id) {
    case 'ig':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'tt':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8.5a6.5 6.5 0 0 1-4-1.4V15a5.5 5.5 0 1 1-5.5-5.5h.5v3h-.5A2.5 2.5 0 1 0 12 15V2h3a3.5 3.5 0 0 0 3.5 3.5h.5v3z" />
        </svg>
      );
    case 'fb':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2H17V2.1A30 30 0 0 0 14.4 2C11.9 2 10 3.5 10 6.9V10H7v4h3v8h3z" />
        </svg>
      );
    case 'web':
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
  }
}

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

  const socials = buildSocialLinks(t);

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
        <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold text-2xl shrink-0 overflow-hidden">
          {t.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-semibold text-slate-900">{t.name}</h1>
            {t.featured && <span className="pill bg-amber-100 text-amber-800">Featured</span>}
          </div>
          <p className="text-slate-500 mt-1">
            {t.location || 'Location not set'} · £{t.priceMin}–£{t.priceMax}/session
          </p>

          {socials.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                  title={s.label}
                >
                  <SocialIcon id={s.id} />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">About</h2>
            <p className="text-slate-700 mt-2 whitespace-pre-line">{t.bio || 'No bio yet.'}</p>
          </div>

          {(t.caseStudies || (t.caseStudyMedia && t.caseStudyMedia.length > 0)) && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900">Case studies</h2>
              {t.caseStudies && (
                <p className="text-slate-700 mt-2 whitespace-pre-line">{t.caseStudies}</p>
              )}
              {t.caseStudyMedia && t.caseStudyMedia.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {t.caseStudyMedia.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
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
