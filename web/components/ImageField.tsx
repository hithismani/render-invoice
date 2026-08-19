'use client';

import { useRef, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { fileToDataUrl, estimateDataUrlKb } from '@/lib/image';

interface Props {
  url?: string;
  width?: number;
  height?: number;
  onChange: (url: string | undefined, size?: { width: number; height: number }) => void;
  label: string;
  maxW?: number;
  maxH?: number;
}

export default function ImageField({ url, width, height, onChange, label, maxW = 600, maxH = 300 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (f: File) => {
    setErr(null);
    setBusy(true);
    try {
      const { dataUrl, width: w, height: h } = await fileToDataUrl(f, maxW, maxH);
      onChange(dataUrl, { width: w, height: h });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const kb = url?.startsWith('data:') ? estimateDataUrlKb(url) : null;
  const isDataUrl = url?.startsWith('data:');

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={`${label} URL (https://…)`}
          value={isDataUrl ? '' : (url || '')}
          onChange={(e) => onChange(e.target.value || undefined)}
          disabled={busy}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ''; }}
        />
        <Button type="button" variant="secondary" size="md" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? 'Reading…' : 'Upload'}
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="md" className="text-red-600 hover:bg-red-50" onClick={() => onChange(undefined)} aria-label="Clear">
            ✕
          </Button>
        )}
      </div>

      {isDataUrl && (
        <div className="flex items-center gap-3 p-2 rounded-md bg-zinc-50 border border-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="size-10 object-contain bg-white border border-zinc-100 rounded" />
          <div className="flex-1 text-xs text-zinc-600">
            <div><span className="font-medium text-zinc-900">Embedded</span> · {width}×{height}px · ~{kb}KB</div>
            {kb && kb > 150 && <div className="text-amber-700">Large images bloat share URLs. Consider a smaller file or a hosted URL.</div>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Width (px)" value={width || ''} onChange={(e) => onChange(url, { width: Number(e.target.value), height: height ?? 0 })} />
        <Input type="number" placeholder="Height (px)" value={height || ''} onChange={(e) => onChange(url, { width: width ?? 0, height: Number(e.target.value) })} />
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
