import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Celite Market',
    short_name: 'Celite Market',
    description: "India's Premier Pay-Per-Product Creative Marketplace for After Effects Templates, SFX, 3D & Web Assets",
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0284c7',
    icons: [
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon/fav.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
