import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-block w-7 h-7 rounded-lg bg-brand-600 text-white grid place-items-center text-sm">
            FM
          </span>
          <span>FitMatch</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/quiz"
            className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
          >
            Find a PT
          </Link>
          {!user && (
            <>
              <Link href="/pt/login" className="btn-ghost text-sm">
                PT login
              </Link>
              <Link href="/pt/signup" className="btn-primary text-sm">
                Join as a PT
              </Link>
            </>
          )}
          {user?.role === 'PT' && (
            <Link href="/pt/dashboard" className="btn-secondary text-sm">
              My profile
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="btn-secondary text-sm">
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
