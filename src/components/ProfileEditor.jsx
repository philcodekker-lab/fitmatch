'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SPECIALISM_OPTIONS,
  SPECIALISM_LABELS,
  TRAINING_STYLES,
  EXPERIENCE_LEVELS,
} from '@/lib/constants';

function MultiSelect({ value, onChange, options, getLabel }) {
  function toggle(id) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? getLabel(id) : opt.label;
        const selected = value.includes(id);
        return (
          <button
            type="button"
            key={id}
            onClick={() => toggle(id)}
            className={
              'pill border ' +
              (selected
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400')
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileEditor({ initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name ?? '',
    bio: initial.bio ?? '',
    caseStudies: initial.caseStudies ?? '',
    currentOffer: initial.currentOffer ?? '',
    specialisms: initial.specialisms ?? [],
    trainingStyles: initial.trainingStyles ?? [],
    experienceLevels: initial.experienceLevels ?? [],
    priceMin: initial.priceMin ?? 0,
    priceMax: initial.priceMax ?? 0,
    location: initial.location ?? '',
  });
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function set(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }));
  }

  async function save(e) {
    e.preventDefault();
    setStatus({ kind: 'saving', message: '' });
    const res = await fetch('/api/pt/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error || 'Could not save.' });
      return;
    }
    setStatus({ kind: 'saved', message: 'Saved.' });
    router.refresh();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="card p-6 grid gap-4">
        <div>
          <label className="label">Display name</label>
          <input
            type="text"
            className="input"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            className="input min-h-[120px]"
            placeholder="A short, punchy intro — who do you coach and what do they get?"
            value={form.bio}
            onChange={(e) => set('bio')(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Case studies</label>
          <textarea
            className="input min-h-[120px]"
            placeholder="A few results, transformations, or the kinds of clients you've worked with."
            value={form.caseStudies}
            onChange={(e) => set('caseStudies')(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Current offer</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Free consultation + 4-week starter plan for £99"
            value={form.currentOffer}
            onChange={(e) => set('currentOffer')(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-6 grid gap-4">
        <div>
          <label className="label">Specialisms</label>
          <MultiSelect
            value={form.specialisms}
            onChange={set('specialisms')}
            options={SPECIALISM_OPTIONS}
            getLabel={(id) => SPECIALISM_LABELS[id] ?? id}
          />
        </div>
        <div>
          <label className="label">Training styles you offer</label>
          <MultiSelect
            value={form.trainingStyles}
            onChange={set('trainingStyles')}
            options={TRAINING_STYLES}
          />
        </div>
        <div>
          <label className="label">Experience levels you work with</label>
          <MultiSelect
            value={form.experienceLevels}
            onChange={set('experienceLevels')}
            options={EXPERIENCE_LEVELS}
          />
        </div>
      </div>

      <div className="card p-6 grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Price min (£/session)</label>
          <input
            type="number"
            className="input"
            min={0}
            value={form.priceMin}
            onChange={(e) => set('priceMin')(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Price max (£/session)</label>
          <input
            type="number"
            className="input"
            min={0}
            value={form.priceMax}
            onChange={(e) => set('priceMax')(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. London or Remote (UK)"
            value={form.location}
            onChange={(e) => set('location')(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={logout} className="btn-ghost text-sm">
          Sign out
        </button>
        <div className="flex items-center gap-3">
          {status.kind === 'saved' && <span className="text-sm text-emerald-600">Saved ✓</span>}
          {status.kind === 'error' && <span className="text-sm text-red-600">{status.message}</span>}
          <button type="submit" className="btn-primary" disabled={status.kind === 'saving'}>
            {status.kind === 'saving' ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
