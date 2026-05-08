'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_STYLES,
  BUDGET_RANGES,
} from '@/lib/constants';

const STEPS = [
  { id: 'goal', title: "What's your main fitness goal?", options: GOALS },
  { id: 'experience', title: "How would you describe your training experience?", options: EXPERIENCE_LEVELS },
  { id: 'trainingStyle', title: "How would you like to train?", options: TRAINING_STYLES },
  { id: 'budget', title: "What's your budget per session?", options: BUDGET_RANGES },
  { id: 'location', title: "Where are you based? (optional)", type: 'text' },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '',
    experience: '',
    trainingStyle: '',
    budget: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const value = answers[current.id];
  const canAdvance = current.type === 'text' ? true : Boolean(value);
  const progress = ((step + 1) / STEPS.length) * 100;

  function pick(option) {
    setAnswers((a) => ({ ...a, [current.id]: option }));
  }

  async function handleNext(e) {
    e?.preventDefault();
    if (!canAdvance) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      // Persist answers in sessionStorage so the results page can re-render
      // them if the user refreshes (no DB row needed for the quiz response).
      sessionStorage.setItem('fm_quiz', JSON.stringify(answers));
      const params = new URLSearchParams(answers);
      router.push(`/results?${params.toString()}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-slate-500 hover:text-slate-800 disabled:opacity-30"
            disabled={step === 0}
          >
            ← Back
          </button>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleNext} className="card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">
          {current.title}
        </h1>

        {current.type === 'text' ? (
          <input
            type="text"
            className="input"
            placeholder="e.g. London, Manchester, Remote — leave blank if you don't mind"
            value={value}
            onChange={(e) => pick(e.target.value)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {current.options.map((opt) => {
              const selected = value === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pick(opt.id)}
                  className={
                    'text-left rounded-xl border-2 px-4 py-3 transition ' +
                    (selected
                      ? 'border-brand-600 bg-brand-50 text-brand-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white')
                  }
                >
                  <span className="font-medium block">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end">
          <button
            type="submit"
            disabled={!canAdvance || submitting}
            className="btn-primary text-base px-6 py-3"
          >
            {isLast ? (submitting ? 'Finding matches…' : 'See my matches →') : 'Continue →'}
          </button>
        </div>
      </form>
    </div>
  );
}
