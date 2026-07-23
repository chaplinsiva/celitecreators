import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CeliteCreators — Pay-Per-Product Creator Asset Marketplace',
  description: 'Buy premium digital assets, video templates, 3D models, and sound effects on demand without subscriptions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased min-h-screen selection:bg-[#0284C7] selection:text-white">
        {children}
      </body>
    </html>
  );
}
