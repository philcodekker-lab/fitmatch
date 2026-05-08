import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { decodeProfile } from '@/lib/profile';
import ProfileEditor from '@/components/ProfileEditor';

export default async function PTDashboardPage() {
  const user = await requireRole('PT');
  if (!user) redirect('/pt/login');

  const profile = decodeProfile(user.trainerProfile);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your profile</h1>
          <p className="text-slate-600 mt-1">
            Keep this up to date — it's what we show to potential clients in matches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile.approved ? (
            <span className="pill bg-emerald-100 text-emerald-800">Live</span>
          ) : (
            <span className="pill bg-amber-100 text-amber-800">Pending review</span>
          )}
          {profile.approved && (
            <Link href={`/pts/${profile.id}`} className="btn-secondary text-sm">
              View public profile →
            </Link>
          )}
        </div>
      </div>

      {!profile.approved && (
        <div className="card p-4 bg-amber-50 border-amber-200 text-amber-900 text-sm mb-6">
          Your profile is pending review by the FitMatch team. You can keep editing — once
          approved it will start appearing in match results.
        </div>
      )}

      <ProfileEditor initial={profile} />
    </div>
  );
}
