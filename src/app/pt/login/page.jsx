'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Mono from '@/components/Mono';

export default function PTLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not sign in.');
      router.push(data.role === 'ADMIN' ? '/admin/dashboard' : '/pt/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <Mono rule>For trainers</Mono>
      <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-4 text-ink-900">
        Welcome back.
      </h1>
      <p className="text-ink-700 mt-2">Sign in to manage your profile.</p>

      <form onSubmit={onSubmit} className="card p-6 sm:p-8 mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-sm text-warn">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-ink-700 mt-5 text-center">
        New here?{' '}
        <Link href="/pt/signup" className="text-brand-600 hover:underline">
          Create a trainer account
        </Link>
      </p>
    </div>
  );
}
