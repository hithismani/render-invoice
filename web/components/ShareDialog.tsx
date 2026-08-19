'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Invoice } from '@/schema/invoiceSchema';
import { shareUrl } from '@/lib/share';

export default function ShareDialog({ invoice, open, onClose }: { invoice: Invoice; open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const u = shareUrl(invoice);
    setUrl(u);
    QRCode.toDataURL(u, { width: 280, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [open, invoice]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Share this invoice</h3>
            <p className="text-sm text-gray-600">All data travels in the URL without passing through a server.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {qr && <img src={qr} alt="QR code" className="mx-auto rounded-lg border border-gray-100" />}

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-500">Share link</label>
          <div className="mt-1 flex gap-2">
            <input readOnly value={url} className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-md bg-gray-50" />
            <button onClick={copy} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">URL length: {url.length} chars. Some chat apps clip URLs beyond ~2000.</p>
        </div>
      </div>
    </div>
  );
}
