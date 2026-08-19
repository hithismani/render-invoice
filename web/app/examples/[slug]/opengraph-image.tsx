import { ImageResponse } from 'next/og';
import { TEMPLATES, getTemplate } from '@/lib/templates';

export const dynamic = 'force-static';
export const alt = 'Invoice example';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Per-example OG image. Each /examples/<slug> page gets its own social card
 * built via Satori (next/og's ImageResponse). When someone shares an example
 * link on Twitter/Slack/LinkedIn, the preview shows that specific example's
 * name + tagline + accent color instead of the generic homepage card.
 */
export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export default async function OgImage({ params }: { params: { slug: string } }) {
  const t = getTemplate(params.slug);
  if (!t) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <div style={{ fontSize: 48, color: '#111827' }}>Example not found</div>
        </div>
      ),
      size,
    );
  }
  const accent = t.invoice.accentColor || '#2563eb';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, ${accent}1A 100%)`,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700 }}>I</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: '#111827' }}>Invoicely</div>
          <div style={{ marginLeft: 20, fontSize: 16, color: '#6b7280', padding: '6px 14px', borderRadius: 999, background: '#f3f4f6' }}>Invoice example</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#111827', letterSpacing: -2, lineHeight: 1 }}>{t.name}</div>
          <div style={{ fontSize: 34, fontWeight: 500, color: accent, letterSpacing: -0.5 }}>{t.tagline}</div>
          <div style={{ display: 'flex', fontSize: 22, color: '#4b5563', maxWidth: 900, lineHeight: 1.4 }}>
            {t.description.slice(0, 160) + (t.description.length > 160 ? '…' : '')}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {t.keywords.slice(0, 4).map((k) => (
              <div key={k} style={{ fontSize: 16, color: '#374151', padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#ffffff' }}>{k}</div>
            ))}
          </div>
          <div style={{ display: 'flex', fontSize: 18, color: '#6b7280' }}>{`invoicely.app/examples/${t.slug}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
