import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { decodeProfile } from '@/lib/profile';
import ProfileEditor from '@/components/ProfileEditor';
import Mono from '@/components/Mono';

export const dynamic = 'force-dynamic';

export default async function PTDashboardPage() {
  const user = await requireRole('PT');
  if (!user) redirect('/pt/login');

  const profile = decodeProfile(user.trainerProfile);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <Mono rule>Trainer dashboard</Mono>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-4 text-ink-900">
            Your profile.
          </h1>
          <p className="text-ink-700 mt-2">
            Keep this up to date — it&apos;s what we show to potential clients in matches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile.approved ? (
            <span className="pill-lime">● Live</span>
          ) : (
            <span className="pill-muted">Pending review</span>
          )}
          {profile.approved && (
            <Link href={`/pts/${profile.id}`} className="btn-secondary text-sm">
              View public profile →
            </Link>
          )}
        </div>
      </div>

      {!profile.approved && (
        <div className="card-flat p-5 text-ink-700 text-sm mb-6">
          Your profile is pending review by the FindMyPT team. You can keep editing — once
          approved it will start appearing in match results.
        </div>
      )}

      <ProfileEditor initial={profile} />
    </div>
  );
}
