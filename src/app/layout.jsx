import './globals.css';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';

// Every page reads cookies via Navbar/getCurrentUser, so nothing is safely
// static. Forcing dynamic rendering avoids accidental build-time DB calls.
export const dynamic = 'force-dynamic';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const sans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'FindMyPT — Find the right PT for your goals',
  description:
    'A modern marketplace that matches you with personal trainers based on your goals, training style and budget.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-bg text-ink-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8">
            <div className="flex items-center gap-2 font-display text-lg">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-ink-900 text-lime font-mono text-sm font-semibold">
                F<span className="text-lime">•</span>
              </span>
              FindMyPT
            </div>
            <nav className="flex items-center gap-6 text-sm text-ink-500">
              <a href="/" className="hover:text-ink-900">Home</a>
              <a href="/quiz" className="hover:text-ink-900">Find a trainer</a>
              <a href="/pt/signup" className="hover:text-ink-900">For trainers</a>
            </nav>
            <p className="mono-meta sm:ml-auto">© {new Date().getFullYear()} · MVP demo</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
