import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'RenderInvoice — Unopinionated Invoice Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700 }}>R</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#111827' }}>RenderInvoice</div>
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, color: '#111827', letterSpacing: -2, lineHeight: 1 }}>
          Un-opinionated invoices.
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, color: '#2563eb', letterSpacing: -2, lineHeight: 1 }}>
          You bring the data.
        </div>
        <div style={{ fontSize: 32, color: '#4b5563', marginTop: 32, maxWidth: 900 }}>
          Free, browser-side PDF invoice generator. No backend. No signup.
        </div>
      </div>
    ),
    size,
  );
}
