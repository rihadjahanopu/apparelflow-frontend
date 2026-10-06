import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApparelFlow ERP - Cutting Operations & Gatekeeper Verification Terminal',
  description: 'Production-grade apparel manufacturing ERP with Hard-Stop Gatekeeper verification matrix.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col relative antialiased selection:bg-blue-500 selection:text-white">
        {/* Ambient Glassmorphic Background Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute top-1/4 -right-40 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-indigo-600/15 rounded-full blur-[140px] mix-blend-screen" />
          <div className="absolute -bottom-40 left-1/3 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>

        {/* Main Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
