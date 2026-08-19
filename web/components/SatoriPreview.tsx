'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Invoice } from '@/schema/invoiceSchema';
import { initSatori, renderSvg } from '@/lib/satoriRender';

interface Props {
  invoice: Invoice;
}

export default function SatoriPreview({ invoice }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const render = useCallback(async (data: Invoice) => {
    try {
      setLoading(true);
      setError(null);
      await initSatori();
      const svgString = await renderSvg(data, 900);
      setSvg(svgString);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void render(invoice);
    }, 100);
    return () => window.clearTimeout(id);
  }, [invoice, render]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
        <strong className="font-semibold">Render error</strong>
        <div className="mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && !svg && (
        <div className="flex items-center justify-center py-20 text-sm text-zinc-400">
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
          Rendering…
        </div>
      )}
      {svg && (
        <div
          className="w-full overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-zinc-200/60"
          style={{ lineHeight: 0 }}
          dangerouslySetInnerHTML={{
            __html: svg.replace(
              '<svg',
              '<svg style="width:100%;height:auto;display:block;"'
            ),
          }}
        />
      )}
    </div>
  );
}
