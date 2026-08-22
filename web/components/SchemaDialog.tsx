'use client';

import { useEffect } from 'react';
import SchemaReference from './SchemaReference';
import CopySchemaButton from './CopySchemaButton';
export default function SchemaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in-up" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold tracking-tight text-zinc-900">Invoice schema</h3>
              <CopySchemaButton />
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">
              Every field the JSON editor accepts. Line-item keys must match the <code className="font-mono bg-zinc-100 px-1 rounded">columns</code> array.
              Text fields support markdown - use the Md ? control on form sections, or see{' '}
              <a href="/developers#markdown" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                /developers#markdown
              </a>
              .
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 p-1">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <SchemaReference />
        </div>
      </div>
    </div>
  );
}
