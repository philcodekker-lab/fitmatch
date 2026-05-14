'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Logo from './Logo';

// We render the open menu via a React portal at document.body level rather
// than as a child of the Navbar. The Navbar uses `backdrop-blur`, which on
// some browsers (notably WebKit) establishes a containing block for
// fixed-positioned descendants — so without the portal, the menu would only
// cover the navbar strip and the page would bleed through. Portaling escapes
// that ancestor entirely.

export default function MobileNav({ user, links }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const sheet = (
    <div
      className="md:hidden fixed inset-0 z-[100] flex flex-col bg-surface"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface">
        <Logo href="/" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink-900 hover:bg-surface2"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col px-6 py-8 gap-2 text-lg font-display bg-surface">
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
  );

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

      {open && mounted && typeof document !== 'undefined'
        ? createPortal(sheet, document.body)
        : null}
    </>
  );
}
