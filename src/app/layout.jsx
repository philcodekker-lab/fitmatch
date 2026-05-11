export const dynamic = 'force-dynamic';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'FitMatch — Find the right PT for your goals',
  description:
    'A simple, modern marketplace that matches people with personal trainers based on their goals, training style and budget.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} FitMatch — MVP demo
        </footer>
      </body>
    </html>
  );
}
