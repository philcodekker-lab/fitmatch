import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import AdminTrainerRow from '@/components/AdminTrainerRow';
import Mono from '@/components/Mono';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      <header>
        <Mono rule>Internal</Mono>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-4 text-ink-900">
          Admin dashboard.
        </h1>
        <p className="text-ink-700 mt-2">
          Approve or remove trainers and toggle who appears as featured.
        </p>
      </header>

      <section>
        <Mono>Pending approval · {pending.length}</Mono>
        <h2 className="font-display text-2xl mt-2 mb-5 text-ink-900">Waiting on review</h2>
        {pending.length === 0 ? (
          <div className="card-flat p-6 text-ink-500 text-sm">No pending profiles. ✨</div>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <AdminTrainerRow key={t.id} trainer={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <Mono>Live trainers · {approved.length}</Mono>
        <h2 className="font-display text-2xl mt-2 mb-5 text-ink-900">Currently listed</h2>
        <div className="space-y-3">
          {approved.map((t) => (
            <AdminTrainerRow key={t.id} trainer={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
