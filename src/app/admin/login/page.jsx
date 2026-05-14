'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Mono from '@/components/Mono';

export default function AdminLoginPage() {
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
      if (data.role !== 'ADMIN') {
        await fetch('/api/auth/logout', { method: 'POST' });
        throw new Error('That account is not an admin.');
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <Mono rule>Internal</Mono>
      <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-4 text-ink-900">
        Admin login.
      </h1>
      <p className="text-ink-500 mt-2 text-sm">
        Demo credentials: <code className="font-mono bg-line2 px-1.5 py-0.5 rounded">admin@fitmatch.dev</code>{' '}
        / <code className="font-mono bg-line2 px-1.5 py-0.5 rounded">admin123</code>
      </p>

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
    </div>
  );
}
