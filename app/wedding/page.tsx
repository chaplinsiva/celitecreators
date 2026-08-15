import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// --- agent-notes ---
// ctx: SEO redirect from /wedding to subcategory landing page
// deps: next/navigation
// state: active
// last: antigravity@2026-08-04
// ---

export const metadata: Metadata = {
  title: 'Wedding Video Templates for After Effects | Celite Market',
  description:
    'Download premium wedding video templates for Adobe After Effects. Save the date invitations, wedding slideshows, romantic motion graphics, and video intros on Celite Market.',
  alternates: {
    canonical: 'https://celitemarket.in/video-templates/after-effects/save-date',
  },
};

export default function WeddingPage() {
  redirect('/video-templates/after-effects/save-date');
}
