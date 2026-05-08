import Link from 'next/link';
import { prisma } from '@/lib/db';
import { decodeProfile } from '@/lib/profile';
import PTCard from '@/components/PTCard';

export default async function LandingPage() {
  const featured = await prisma.trainerProfile.findMany({
    where: { approved: true, featured: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  const trainers = featured.map(decodeProfile);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-white" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <span className="pill bg-brand-100 text-brand-700 mb-4">
            Find the right PT for your goals
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto">
            Your goals are specific. Your trainer should be too.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            Take a 60-second quiz and we'll match you with three personal trainers who fit
            your goals, training style and budget.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/quiz" className="btn-primary text-base px-6 py-3">
              Start the quiz →
            </Link>
            <Link href="/pt/signup" className="btn-secondary text-base px-6 py-3">
              I'm a PT, list my profile
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              t: 'Goal-first matching',
              d: 'Tell us what you want to change. We score every PT against your answers and surface the top 3.',
            },
            {
              t: 'Real specialisms',
              d: 'From fat loss to powerlifting to pre/post-natal, we filter for actual expertise — not just job titles.',
            },
            {
              t: 'No noise, no spam',
              d: 'No reviews to game, no aggressive sales. Just a profile, a contact button, and a coach who fits.',
            },
          ].map((card) => (
            <div key={card.t} className="card p-6">
              <h3 className="font-semibold text-slate-900">{card.t}</h3>
              <p className="text-slate-600 mt-2 text-sm">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured PTs */}
      {trainers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Featured trainers</h2>
              <p className="text-slate-600 text-sm">
                A taste of who you might match with.
              </p>
            </div>
            <Link href="/quiz" className="text-sm font-medium text-brand-700 hover:underline">
              Get matched →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {trainers.map((t) => (
              <PTCard key={t.id} trainer={t} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Ready to find your PT?
        </h2>
        <p className="text-slate-600 mt-3">
          The quiz takes about a minute. No account needed to see your matches.
        </p>
        <div className="mt-6">
          <Link href="/quiz" className="btn-primary text-base px-6 py-3">
            Take the quiz
          </Link>
        </div>
      </section>
    </>
  );
}
