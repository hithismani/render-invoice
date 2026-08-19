import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Invoicely',
    short_name: 'Invoicely',
    description: 'Free, un-opinionated invoice generator. 100% browser-side.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
  };
}
