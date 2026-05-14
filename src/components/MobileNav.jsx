'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function MobileNav({ user, links }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink-900"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-bg flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <Logo href="/" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink-900"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex flex-col px-6 py-8 gap-2 text-lg font-display">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 border-b border-line text-ink-900"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-2 pt-6">
              {!user && (
                <>
                  <Link
                    href="/pt/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary justify-center"
                  >
                    Trainer login
                  </Link>
                  <Link
                    href="/quiz"
                    onClick={() => setOpen(false)}
                    className="btn-accent justify-center"
                  >
                    Start the quiz →
                  </Link>
                </>
              )}
              {user?.role === 'PT' && (
                <Link
                  href="/pt/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-primary justify-center"
                >
                  My profile
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-primary justify-center"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
