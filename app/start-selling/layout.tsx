import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Templates & Earn 80% Payout | Celite Market',
  description: 'Join Celite Market as a creator. Sell your After Effects templates, sound effects, 3D models, and digital assets. Earn 80% direct revenue payout to your bank or UPI.',
  openGraph: {
    title: 'Sell Your Templates & Earn 80% Payout | Celite Market',
    description: 'Join Celite Market as a creator. Sell your templates and earn 80% direct revenue.',
    url: 'https://celitemarket.in/start-selling',
    siteName: 'Celite Market',
    type: 'website',
  },
};

export default function StartSellingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
