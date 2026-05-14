'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Mono from '@/components/Mono';
import ScoreRing from '@/components/ScoreRing';
import MatchCard from '@/components/MatchCard';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';
import {
  GOALS,
  TRAINING_STYLES,
  EXPERIENCE_LEVELS,
  BUDGET_RANGES,
  SPECIALISM_LABELS,
} from '@/lib/constants';

const FILTER_DEFS = [
  { id: 'goal', label: 'Goal', options: GOALS },
  { id: 'experience', label: 'Experience', options: EXPERIENCE_LEVELS },
  { id: 'trainingStyle', label: 'Training', options: TRAINING_STYLES },
  { id: 'budget', label: 'Budget', options: BUDGET_RANGES },
];

function labelFor(list, id) {
  return list.find((x) => x.id === id)?.label ?? id;
}

function FilterChip({ def, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-line bg-surface text-sm text-ink-900 hover:border-ink-300"
      >
        <Mono>{def.label}</Mono>
        <span className="font-medium">{labelFor(def.options, value) || '—'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
        </svg>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute z-20 mt-2 w-64 card p-2 shadow-lift">
            {def.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={
                  'w-full text-left px-3 py-2 rounded-lg text-sm ' +
                  (value === opt.id
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-900 hover:bg-surface2')
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ranksWith(reasons, score) {
  // Synthesise a weighted breakdown for the hero card: split the score across
  // the reasons in decreasing chunks.
  if (!reasons || reasons.length === 0) return [];
  const total = Math.max(20, Math.min(100, score));
  const weights = [Math.round(total * 0.45), Math.round(total * 0.32), Math.round(total * 0.23)];
  return reasons.slice(0, 3).map((r, i) => ({ text: r, weight: weights[i] || 8 }));
}

function HeroMatch({ trainer }) {
  if (!trainer) return null;
  const breakdown = ranksWith(trainer.reasons, trainer.score);
  const firstName = trainer.name.split(' ')[0];
  const initials = trainer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="card overflow-hidden grid md:grid-cols-[420px_1fr]">
      <div className="aspect-[4/5] md:aspect-auto md:h-full bg-surface2 relative">
        {trainer.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trainer.photoUrl} alt={trainer.name} className="w-full h-full object-cover" />
        ) : (
          <PhotoPlaceholder className="w-full h-full min-h-[420px]" label={initials} />
        )}
        {trainer.featured && (
          <span className="absolute top-4 left-4 pill-lime">● Featured</span>
        )}
      </div>

      <div className="p-6 sm:p-10 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Mono>Best match · No.01</Mono>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight mt-3 text-ink-900 leading-tight">
              {trainer.name}
            </h2>
            <p className="text-ink-500 mt-2">
              {trainer.location || '—'} · £{trainer.priceMin}–£{trainer.priceMax}/session
            </p>
          </div>
          <ScoreRing score={trainer.score} size={84} />
        </div>

        <blockquote className="font-display text-xl sm:text-2xl text-ink-900 leading-snug border-l-2 border-brand-600 pl-5">
          “{trainer.bio || 'A coach who fits your goals.'}”
        </blockquote>

        {breakdown.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-3">
            {breakdown.map((b) => (
              <div key={b.text} className="card-flat p-4">
                <span className="font-mono text-sm font-semibold text-brand-600">
                  +{b.weight}
                </span>
                <p className="text-sm text-ink-900 mt-1">{b.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {trainer.specialisms.slice(0, 5).map((s) => (
            <span key={s} className="pill-outline">
              {SPECIALISM_LABELS[s] ?? s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 mt-auto">
          <Link href={`/pts/${trainer.id}#contact`} className="btn-primary">
            Contact {firstName} →
          </Link>
          <Link href={`/pts/${trainer.id}`} className="btn-secondary">
            View full profile
          </Link>
          <button
            type="button"
            className="btn-ghost inline-flex items-center justify-center w-11 h-11 p-0 rounded-full border border-line"
            aria-label="Save"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [quiz, setQuiz] = useState({
    goal: params.get('goal') || '',
    experience: params.get('experience') || '',
    trainingStyle: params.get('trainingStyle') || '',
    budget: params.get('budget') || '',
    location: params.get('location') || '',
  });
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  async function runMatch(q) {
    setLoading(true);
    setError('');
    setShowMore(false);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load matches.');
      setMatches(data.matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runMatch(quiz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilter(id, value) {
    const next = { ...quiz, [id]: value };
    setQuiz(next);
    const url = new URL(window.location.href);
    url.searchParams.set(id, value);
    router.replace(url.pathname + url.search, { scroll: false });
    runMatch(next);
  }

  function widen(kind) {
    if (kind === 'budget') updateFilter('budget', '100_plus');
    else if (kind === 'remote') updateFilter('trainingStyle', 'online');
    else if (kind === 'retake') router.push('/quiz');
  }

  const top = matches[0];
  const highlighted = matches.slice(1, 3); // #2 and #3
  const additional = matches.slice(3); // #4 onwards (up to 10)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-32">
      <div>
        <Mono rule>Your top matches · {today}</Mono>
        <h1 className="font-display text-4xl sm:text-6xl tracking-tight mt-5 text-ink-900 leading-[1.05]">
          Three coaches who fit.
        </h1>
      </div>

      {/* Filter chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {FILTER_DEFS.map((def) => (
          <FilterChip
            key={def.id}
            def={def}
            value={quiz[def.id]}
            onChange={(v) => updateFilter(def.id, v)}
          />
        ))}
        {quiz.location && (
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-line bg-surface text-sm text-ink-900">
            <Mono>Near</Mono>
            <span className="font-medium">{quiz.location}</span>
          </span>
        )}
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-dashed border-line text-sm text-ink-500 hover:text-ink-900 hover:border-ink-300"
        >
          ↻ Retake quiz
        </Link>
      </div>

      {loading && (
        <div className="mt-10 grid gap-5">
          <div className="card h-96 animate-pulse" />
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card h-56 animate-pulse" />
            <div className="card h-56 animate-pulse" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mt-10 card-flat p-6 text-warn">
          <p className="font-medium">Sorry — something went wrong.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="mt-10 card p-8 text-center">
          <p className="text-ink-700">
            No trainers matched your criteria yet. Try widening your budget or training-style
            preferences.
          </p>
          <Link href="/quiz" className="btn-primary mt-4 inline-flex">
            Adjust answers
          </Link>
        </div>
      )}

      {!loading && !error && top && (
        <>
          <div className="mt-10">
            <HeroMatch trainer={top} />
          </div>

          {highlighted.length > 0 && (
            <div className="mt-6 grid md:grid-cols-2 gap-5">
              {highlighted.map((t, i) => (
                <MatchCard key={t.id} trainer={t} rank={i + 2} />
              ))}
            </div>
          )}

          {/* Show-more toggle for matches #4+ */}
          {additional.length > 0 && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="btn-secondary w-full justify-center"
                aria-expanded={showMore}
              >
                {showMore
                  ? 'Show fewer matches'
                  : `Show ${additional.length} more match${additional.length === 1 ? '' : 'es'} →`}
              </button>

              {showMore && (
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mono>More matches</Mono>
                    <span className="text-xs text-ink-500">
                      Ranked by how well they fit your answers
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {additional.map((t, i) => (
                      <MatchCard key={t.id} trainer={t} rank={i + 4} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <section className="mt-12 card-flat p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <Mono>Widen the search</Mono>
              <h2 className="font-display text-xl text-ink-900 mt-1">Not seeing the right fit?</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => widen('budget')} className="btn-secondary text-sm">
                Adjust budget
              </button>
              <button type="button" onClick={() => widen('remote')} className="btn-secondary text-sm">
                Open to remote
              </button>
              <button type="button" onClick={() => widen('retake')} className="btn-secondary text-sm">
                Retake quiz
              </button>
            </div>
          </section>
        </>
      )}

      {/* Mobile sticky CTA */}
      {!loading && top && (
        <div className="md:hidden fixed bottom-0 inset-x-0 p-3 bg-gradient-to-t from-bg to-transparent">
          <Link
            href={`/pts/${top.id}#contact`}
            className="btn-primary w-full justify-center shadow-lift"
          >
            Contact {top.name.split(' ')[0]} →
          </Link>
        </div>
      )}
    </div>
  );
}
