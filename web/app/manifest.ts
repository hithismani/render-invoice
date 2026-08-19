import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RenderInvoice',
    short_name: 'RenderInvoice',
    description: 'Unopinionated invoice generator. Web app and Cloudflare Worker.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
  };
}
