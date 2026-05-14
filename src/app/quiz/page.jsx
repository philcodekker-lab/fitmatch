'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Mono from '@/components/Mono';
import {
  GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_STYLES,
  BUDGET_RANGES,
} from '@/lib/constants';

// Helper text per step, used in the right-rail "what this affects" callouts.
const STEPS = [
  {
    id: 'goal',
    title: "What's your main fitness goal?",
    options: GOALS,
    affects: 'The biggest single signal in our scoring — worth up to 40 points of the match.',
  },
  {
    id: 'experience',
    title: 'How would you describe your training experience?',
    options: EXPERIENCE_LEVELS,
    affects: "Filters for coaches who explicitly work with people at your level.",
  },
  {
    id: 'trainingStyle',
    title: 'How would you like to train?',
    options: TRAINING_STYLES,
    affects: "Online, in-person or a mix. Hybrid is flexible by default.",
  },
  {
    id: 'budget',
    title: "What's your budget per session?",
    options: BUDGET_RANGES,
    affects: "Used to surface coaches whose pricing overlaps yours.",
  },
  {
    id: 'location',
    title: 'Where are you based? (optional)',
    type: 'text',
    affects: "Lifts local matches. Remote coaches get partial credit for any location.",
  },
];

const STEP_LABELS = {
  goal: 'Goal',
  experience: 'Experience',
  trainingStyle: 'Style',
  budget: 'Budget',
  location: 'Location',
};

function optionLabelFor(stepId, value) {
  if (!value) return '—';
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) return value;
  if (step.type === 'text') return value;
  const opt = step.options.find((o) => o.id === value);
  return opt ? opt.label : value;
}

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
  const remainingSeconds = Math.max(15, (STEPS.length - step) * 12);

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
      sessionStorage.setItem('fm_quiz', JSON.stringify(answers));
      const params = new URLSearchParams(answers);
      router.push(`/results?${params.toString()}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Header bar */}
      <div className="border-b border-line bg-bg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Mono className="hidden sm:inline-flex">
              Question {String(step + 1).padStart(2, '0')} / 05
            </Mono>
            <Mono className="hidden sm:inline-flex">~{remainingSeconds}s left</Mono>
            <Link href="/" className="btn-ghost text-sm">
              Save &amp; exit
            </Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3">
          <div className="grid grid-cols-5 gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${i <= step ? 'bg-ink-900' : 'bg-line'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[1fr_320px]">
        {/* ───────────────────── Question pane ───────────────────── */}
        <form
          onSubmit={handleNext}
          className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14"
        >
          <Mono rule>Question {String(step + 1).padStart(2, '0')}</Mono>
          <h1 className="font-display text-3xl sm:text-5xl tracking-tight mt-4 text-ink-900 leading-tight">
            {current.title}
          </h1>

          <div className="mt-8 space-y-3">
            {current.type === 'text' ? (
              <input
                type="text"
                className="input text-lg"
                placeholder="e.g. London, Manchester, or leave blank for any"
                value={value}
                onChange={(e) => pick(e.target.value)}
                autoFocus
              />
            ) : (
              current.options.map((opt, i) => {
                const selected = value === opt.id;
                const key = String.fromCharCode(65 + i);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => pick(opt.id)}
                    className={
                      'w-full min-h-[60px] flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition ' +
                      (selected
                        ? 'bg-ink-900 text-white border-ink-900'
                        : 'bg-surface text-ink-900 border-line hover:border-ink-300')
                    }
                  >
                    <span
                      className={
                        'inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono text-sm font-semibold shrink-0 ' +
                        (selected
                          ? 'bg-lime text-brand-900'
                          : 'bg-line2 text-ink-700')
                      }
                    >
                      {key}
                    </span>
                    <span className="font-medium text-base sm:text-lg">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-30"
            >
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <span className="mono-meta hidden sm:inline">↵ ENTER</span>
              <button
                type="submit"
                disabled={!canAdvance || submitting}
                className="btn-primary"
              >
                {isLast ? (submitting ? 'Finding matches…' : 'See matches →') : 'Continue →'}
              </button>
            </div>
          </div>
        </form>

        {/* ───────────────────── Summary rail ───────────────────── */}
        <aside className="hidden lg:block bg-surface border-l border-line">
          <div className="sticky top-24 px-8 py-10">
            <Mono rule>Your answers</Mono>
            <ul className="mt-6 space-y-4">
              {STEPS.map((s, i) => {
                const v = answers[s.id];
                const isCurrent = i === step;
                const labelText = v ? optionLabelFor(s.id, v) : isCurrent ? 'Answering now' : '—';
                return (
                  <li key={s.id} className="border-b border-line2 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="mono-meta">{STEP_LABELS[s.id]}</span>
                      <span
                        className={
                          'mono-meta ' +
                          (v
                            ? 'text-brand-600'
                            : isCurrent
                              ? 'text-ink-900'
                              : 'text-ink-400')
                        }
                      >
                        0{i + 1} / 05
                      </span>
                    </div>
                    <p
                      className={
                        'mt-1 text-sm ' +
                        (v ? 'text-ink-900 font-medium' : 'text-ink-400')
                      }
                    >
                      {labelText}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 p-5 rounded-2xl bg-surface2 border border-line2">
              <Mono>What this affects</Mono>
              <p className="text-sm text-ink-700 mt-2">{current.affects}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
