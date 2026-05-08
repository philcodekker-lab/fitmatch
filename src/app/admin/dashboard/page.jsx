import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import AdminTrainerRow from '@/components/AdminTrainerRow';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = await requireRole('ADMIN');
  if (!admin) redirect('/admin/login');

  const profiles = await prisma.trainerProfile.findMany({
    orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
    include: { user: { select: { email: true } } },
  });
  const trainers = profiles.map((p) => ({
    ...decodeProfile(p),
    email: p.user.email,
  }));

  const pending = trainers.filter((t) => !t.approved);
  const approved = trainers.filter((t) => t.approved);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Admin dashboard</h1>
        <p className="text-slate-600 mt-1">
          Approve or remove trainers and toggle who appears as featured.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="card p-6 text-slate-500 text-sm">No pending profiles. ✨</div>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <AdminTrainerRow key={t.id} trainer={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Live trainers ({approved.length})
        </h2>
        <div className="space-y-3">
          {approved.map((t) => (
            <AdminTrainerRow key={t.id} trainer={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
