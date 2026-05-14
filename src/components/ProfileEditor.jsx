'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Mono from './Mono';
import {
  SPECIALISM_OPTIONS,
  SPECIALISM_LABELS,
  TRAINING_STYLES,
  EXPERIENCE_LEVELS,
} from '@/lib/constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function linesToArray(text) {
  return (text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}
function arrayToLines(arr) {
  return (arr || []).join('\n');
}
function csvToArray(text) {
  return (text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
function arrayToCsv(arr) {
  return (arr || []).join(', ');
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INTENSITY_OPTIONS = [
  { id: 'high', label: 'High intensity' },
  { id: 'mid', label: 'Mid intensity' },
  { id: 'low', label: 'Light / recovery' },
  { id: 'rest', label: 'Rest day' },
];

function withDefaultWeek(week) {
  if (Array.isArray(week) && week.length === 7) return week;
  return DAYS.map((label) => ({ label, intensity: 'rest' }));
}

// ─── Reusable bits ──────────────────────────────────────────────────────────

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
            className={selected ? 'pill-dark' : 'pill-outline hover:border-ink-300'}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ value, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <span
        className={
          'mt-0.5 inline-flex w-11 h-6 rounded-full transition-colors shrink-0 relative ' +
          (value ? 'bg-brand-600' : 'bg-line')
        }
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={
            'absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-all ' +
            (value ? 'left-[22px]' : 'left-0.5')
          }
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {description && (
          <span className="block text-xs text-ink-500 mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
}

function PhotoUploader({ value, onChange, name }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-50 text-brand-700 grid place-items-center font-display font-semibold text-xl shrink-0">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{initialsOf(name)}</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <label className="btn-secondary text-sm cursor-pointer">
            {busy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFile}
              disabled={busy}
            />
          </label>
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-sm text-warn hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-warn">{error}</p>}
        <p className="text-xs text-ink-500">JPEG / PNG / WebP / GIF · max 5MB.</p>
      </div>
    </div>
  );
}

function GalleryUploader({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    const next = [...value];
    for (const file of files) {
      if (next.length >= 10) {
        setError('Maximum 10 case-study photos.');
        break;
      }
      try {
        const url = await uploadFile(file);
        next.push(url);
      } catch (err) {
        setError(err.message);
        break;
      }
    }
    onChange(next);
    setBusy(false);
    e.target.value = '';
  }

  function remove(i) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="relative aspect-square rounded-xl overflow-hidden bg-surface2 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-surface/95 hover:bg-surface text-ink-900 rounded-full w-6 h-6 grid place-items-center text-xs shadow"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-line grid place-items-center cursor-pointer hover:border-ink-300 text-ink-500 text-xs text-center px-2">
            {busy ? 'Uploading…' : '+ Add image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFiles}
              disabled={busy}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-warn">{error}</p>}
      <p className="text-xs text-ink-500">
        Up to 10 photos · JPEG / PNG / WebP / GIF · max 5MB each.
      </p>
    </div>
  );
}

function SocialField({ label, prefix, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="label">{label}</label>
      {prefix ? (
        <div className="flex items-stretch rounded-xl border border-line bg-surface focus-within:border-ink-700 focus-within:ring-2 focus-within:ring-ink-900/10 overflow-hidden">
          <span className="pl-3 pr-1 self-center text-ink-500 text-sm whitespace-nowrap">
            {prefix}
          </span>
          <input
            type={type}
            className="flex-1 px-2 py-3 bg-transparent focus:outline-none text-ink-900 min-w-0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <input
          type={type}
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

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
    photoUrl: initial.photoUrl ?? '',
    socialInstagram: initial.socialInstagram ?? '',
    socialTiktok: initial.socialTiktok ?? '',
    socialFacebook: initial.socialFacebook ?? '',
    socialWebsite: initial.socialWebsite ?? '',
    caseStudyMedia: initial.caseStudyMedia ?? [],

    // Practice details (Phase 2)
    responseTimeHours: initial.responseTimeHours ?? 24,
    acceptingClients: initial.acceptingClients ?? true,
    credentials: initial.credentials ?? [],
    pricingTiers: {
      single: initial.pricingTiers?.single ?? 0,
      sixPack: initial.pricingTiers?.sixPack ?? 0,
      twelvePack: initial.pricingTiers?.twelvePack ?? 0,
      monthlyOnline: initial.pricingTiers?.monthlyOnline ?? 0,
    },
    weeklySchedule: withDefaultWeek(initial.weeklySchedule),
    languages: initial.languages ?? [],
    gymLocations: initial.gymLocations ?? [],
  });

  // Local-only text representations so the textareas can be edited freely
  // without re-parsing on every keystroke.
  const [credentialsText, setCredentialsText] = useState(arrayToLines(form.credentials));
  const [gymsText, setGymsText] = useState(arrayToLines(form.gymLocations));
  const [languagesText, setLanguagesText] = useState(arrayToCsv(form.languages));

  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  function set(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }));
  }

  function setTier(key, value) {
    setForm((f) => ({
      ...f,
      pricingTiers: { ...f.pricingTiers, [key]: Number(value) || 0 },
    }));
  }

  function setDayIntensity(idx, intensity) {
    setForm((f) => {
      const next = f.weeklySchedule.map((d, i) =>
        i === idx ? { ...d, intensity } : d,
      );
      return { ...f, weeklySchedule: next };
    });
  }

  async function save(e) {
    e.preventDefault();
    setStatus({ kind: 'saving', message: '' });
    const payload = {
      ...form,
      credentials: linesToArray(credentialsText),
      gymLocations: linesToArray(gymsText),
      languages: csvToArray(languagesText),
    };
    const res = await fetch('/api/pt/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ kind: 'error', message: data.error || 'Could not save.' });
      return;
    }
    setStatus({ kind: 'saved', message: 'Saved.' });
    // Keep the in-memory form in sync with the parsed arrays
    setForm((f) => ({
      ...f,
      credentials: linesToArray(credentialsText),
      gymLocations: linesToArray(gymsText),
      languages: csvToArray(languagesText),
    }));
    router.refresh();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Identity */}
      <div className="card p-6 sm:p-8 grid gap-6">
        <Mono>Identity</Mono>
        <div>
          <label className="label">Profile photo</label>
          <PhotoUploader value={form.photoUrl} onChange={set('photoUrl')} name={form.name} />
        </div>
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
          <label className="label">Case studies (free text)</label>
          <textarea
            className="input min-h-[120px]"
            placeholder="A few results, transformations, or the kinds of clients you've worked with."
            value={form.caseStudies}
            onChange={(e) => set('caseStudies')(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Case-study photos</label>
          <GalleryUploader value={form.caseStudyMedia} onChange={set('caseStudyMedia')} />
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

      {/* What you do */}
      <div className="card p-6 sm:p-8 grid gap-5">
        <Mono>What you do</Mono>
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

      {/* Practice details */}
      <div className="card p-6 sm:p-8 grid gap-5">
        <Mono>Practice details</Mono>
        <p className="text-sm text-ink-500 -mt-3">
          These power the public profile sidebar (replies, accepting-new badge, credentials, languages, gyms).
        </p>

        <Toggle
          value={form.acceptingClients}
          onChange={set('acceptingClients')}
          label="Currently accepting new clients"
          description='Shows the green "Accepting new" badge on your profile and matches.'
        />

        <div>
          <label className="label">Typical reply time (hours)</label>
          <input
            type="number"
            className="input max-w-[160px]"
            min={1}
            max={168}
            value={form.responseTimeHours}
            onChange={(e) => set('responseTimeHours')(Number(e.target.value) || 24)}
          />
          <p className="text-xs text-ink-500 mt-1">
            Shown as &ldquo;Replies within ~{form.responseTimeHours}h&rdquo; on your profile.
          </p>
        </div>

        <div>
          <label className="label">Languages</label>
          <input
            type="text"
            className="input"
            placeholder="English, Polish, Spanish"
            value={languagesText}
            onChange={(e) => setLanguagesText(e.target.value)}
          />
          <p className="text-xs text-ink-500 mt-1">Comma-separated.</p>
        </div>

        <div>
          <label className="label">Where you train</label>
          <textarea
            className="input min-h-[80px]"
            placeholder={'Fitness First, London Bridge\nIndependent studio (Brixton)\nClient home (Greater London)'}
            value={gymsText}
            onChange={(e) => setGymsText(e.target.value)}
          />
          <p className="text-xs text-ink-500 mt-1">One location per line.</p>
        </div>

        <div>
          <label className="label">Credentials</label>
          <textarea
            className="input min-h-[100px]"
            placeholder={'Level 4 Personal Trainer (CIMSPA)\nPre / post-natal certified\nSports Massage Level 3'}
            value={credentialsText}
            onChange={(e) => setCredentialsText(e.target.value)}
          />
          <p className="text-xs text-ink-500 mt-1">One credential per line. 3–6 works well.</p>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="card p-6 sm:p-8 grid gap-5">
        <Mono>Pricing breakdown</Mono>
        <p className="text-sm text-ink-500 -mt-3">
          What each package costs in £. Leave at 0 to hide a row from the public pricing card.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Single session</label>
            <input
              type="number"
              className="input"
              min={0}
              value={form.pricingTiers.single}
              onChange={(e) => setTier('single', e.target.value)}
            />
          </div>
          <div>
            <label className="label">6-pack</label>
            <input
              type="number"
              className="input"
              min={0}
              value={form.pricingTiers.sixPack}
              onChange={(e) => setTier('sixPack', e.target.value)}
            />
          </div>
          <div>
            <label className="label">12-pack</label>
            <input
              type="number"
              className="input"
              min={0}
              value={form.pricingTiers.twelvePack}
              onChange={(e) => setTier('twelvePack', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Online / month</label>
            <input
              type="number"
              className="input"
              min={0}
              value={form.pricingTiers.monthlyOnline}
              onChange={(e) => setTier('monthlyOnline', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="card p-6 sm:p-8 grid gap-5">
        <Mono>A typical week</Mono>
        <p className="text-sm text-ink-500 -mt-3">
          How a normal week of yours looks. Surfaces as a 7-day strip on your public profile.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {form.weeklySchedule.map((d, i) => (
            <div key={d.label} className="rounded-xl border border-line p-3 bg-surface">
              <p className="mono-meta">{d.label}</p>
              <select
                className="mt-2 w-full text-sm py-1.5 px-2 rounded-lg border border-line bg-surface focus:outline-none focus:border-ink-700 focus:ring-2 focus:ring-ink-900/10"
                value={d.intensity}
                onChange={(e) => setDayIntensity(i, e.target.value)}
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div className="card p-6 sm:p-8 grid gap-5">
        <Mono>Social links</Mono>
        <p className="text-sm text-ink-500 -mt-3">
          Optional — only fill in what you actually want to share.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <SocialField
            label="Instagram"
            prefix="instagram.com/"
            placeholder="yourhandle"
            value={form.socialInstagram}
            onChange={set('socialInstagram')}
          />
          <SocialField
            label="TikTok"
            prefix="tiktok.com/@"
            placeholder="yourhandle"
            value={form.socialTiktok}
            onChange={set('socialTiktok')}
          />
          <SocialField
            label="Facebook"
            placeholder="https://facebook.com/your-page"
            value={form.socialFacebook}
            onChange={set('socialFacebook')}
            type="url"
          />
          <SocialField
            label="Personal website"
            placeholder="https://your-site.com"
            value={form.socialWebsite}
            onChange={set('socialWebsite')}
            type="url"
          />
        </div>
      </div>

      {/* Pricing range + location */}
      <div className="card p-6 sm:p-8 grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3"><Mono>Matching info</Mono></div>
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
        <p className="sm:col-span-3 text-xs text-ink-500 -mt-2">
          These two numbers control where you appear in matches by budget. The detailed
          pricing breakdown above is what we display on your profile.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={logout} className="btn-ghost text-sm">
          Sign out
        </button>
        <div className="flex items-center gap-3">
          {status.kind === 'saved' && <span className="mono-meta text-brand-600">Saved ✓</span>}
          {status.kind === 'error' && (
            <span className="text-sm text-warn">{status.message}</span>
          )}
          <button type="submit" className="btn-primary" disabled={status.kind === 'saving'}>
            {status.kind === 'saving' ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
