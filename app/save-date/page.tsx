import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// --- agent-notes ---
// ctx: SEO redirect from /save-date to subcategory landing page
// deps: next/navigation
// state: active
// last: antigravity@2026-08-04
// ---

export const metadata: Metadata = {
  title: 'Save the Date Video Templates for After Effects | Celite Market',
  description:
    'Download premium Save the Date video templates for Adobe After Effects. Beautiful wedding invitation templates, romantic motion graphics, and customizable wedding video intros on Celite Market.',
  alternates: {
    canonical: 'https://celitemarket.in/video-templates/after-effects/save-date',
  },
};

export default function SaveDatePage() {
  redirect('/video-templates/after-effects/save-date');
}
