import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import Logo from './Logo';
import MobileNav from './MobileNav';

export default async function Navbar() {
  const user = await getCurrentUser();

  const links = [
    { href: '/quiz', label: 'Find a trainer' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/pt/signup', label: 'For trainers' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Logo />

        <div className="hidden md:flex items-center gap-6 text-sm text-ink-700">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink-900">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!user && (
            <>
              <Link href="/pt/login" className="btn-ghost text-sm">
                Trainer login
              </Link>
              <Link href="/quiz" className="btn-primary text-sm">
                Start the quiz →
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

        <MobileNav user={user} links={links} />
      </nav>
    </header>
  );
}
