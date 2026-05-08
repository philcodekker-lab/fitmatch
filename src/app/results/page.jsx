'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PTCard from '@/components/PTCard';
import { GOALS, TRAINING_STYLES, EXPERIENCE_LEVELS, BUDGET_RANGES } from '@/lib/constants';

function labelFor(list, id) {
  return list.find((x) => x.id === id)?.label ?? id;
}

export default function ResultsPage() {
  const params = useSearchParams();
  const quiz = {
    goal: params.get('goal') || '',
    experience: params.get('experience') || '',
    trainingStyle: params.get('trainingStyle') || '',
    budget: params.get('budget') || '',
    location: params.get('location') || '',
  };

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function go() {
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quiz),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load matches.');
        if (!cancelled) setMatches(data.matches);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    go();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">Your top matches</h1>
        <p className="text-slate-600 mt-2">
          Based on your answers — {labelFor(GOALS, quiz.goal)},{' '}
          {labelFor(EXPERIENCE_LEVELS, quiz.experience).toLowerCase()},{' '}
          {labelFor(TRAINING_STYLES, quiz.trainingStyle).toLowerCase()},{' '}
          {labelFor(BUDGET_RANGES, quiz.budget).toLowerCase()}
          {quiz.location ? `, near ${quiz.location}` : ''}.
        </p>
        <Link href="/quiz" className="text-sm text-brand-700 hover:underline mt-2 inline-block">
          ↻ Retake the quiz
        </Link>
      </div>

      {loading && (
        <div className="grid md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-6 animate-pulse h-72" />
          ))}
        </div>
      )}

      {error && (
        <div className="card p-6 border-red-200 bg-red-50 text-red-800">
          <p className="font-medium">Sorry — something went wrong.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-slate-700">
            No trainers matched your criteria yet. Try widening your budget or training-style
            preferences.
          </p>
          <Link href="/quiz" className="btn-primary mt-4 inline-flex">
            Adjust answers
          </Link>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          {matches.map((m) => (
            <PTCard key={m.id} trainer={m} reasons={m.reasons} />
          ))}
        </div>
      )}
    </div>
  );
}
