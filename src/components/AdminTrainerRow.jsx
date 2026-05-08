'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SPECIALISM_LABELS } from '@/lib/constants';

export default function AdminTrainerRow({ trainer }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function patch(body) {
    setError('');
    const res = await fetch(`/api/admin/pts/${trainer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Action failed.');
    }
  }

  async function remove() {
    if (!confirm(`Remove ${trainer.name}? This deletes their account.`)) return;
    const res = await fetch(`/api/admin/pts/${trainer.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not remove trainer.');
      return;
    }
  }

  function run(action) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="font-semibold text-slate-900">{trainer.name}</h3>
          {trainer.approved ? (
            <span className="pill bg-emerald-100 text-emerald-800">Approved</span>
          ) : (
            <span className="pill bg-amber-100 text-amber-800">Pending</span>
          )}
          {trainer.featured && <span className="pill bg-brand-100 text-brand-800">Featured</span>}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          {trainer.email} · {trainer.location || '—'} · £{trainer.priceMin}–£{trainer.priceMax}
        </p>
        {trainer.specialisms?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {trainer.specialisms.map((s) => (
              <span key={s} className="pill bg-slate-100 text-slate-700">
                {SPECIALISM_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {trainer.approved && (
          <Link href={`/pts/${trainer.id}`} className="btn-ghost text-sm">
            View
          </Link>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => patch({ approved: !trainer.approved }))}
          className="btn-secondary text-sm"
        >
          {trainer.approved ? 'Unapprove' : 'Approve'}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => patch({ featured: !trainer.featured }))}
          className="btn-secondary text-sm"
        >
          {trainer.featured ? 'Unfeature' : 'Feature'}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(remove)}
          className="btn text-sm text-red-700 hover:bg-red-50 border border-red-200"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
