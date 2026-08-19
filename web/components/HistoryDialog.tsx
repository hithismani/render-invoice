'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { listHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import type { Invoice } from '@/schema/invoiceSchema';

export default function HistoryDialog({
  open, onClose, onRestore,
}: {
  open: boolean; onClose: () => void; onRestore: (inv: Invoice) => void;
}) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const refresh = async () => setEntries(await listHistory());

  useEffect(() => { if (open) void refresh(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onClear = async () => {
    if (!window.confirm('Clear all auto-saved snapshots? This cannot be undone.')) return;
    await clearHistory();
    await refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in-up" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">History</h3>
            <p className="text-sm text-zinc-500">
              Rolling auto-save snapshots · last {entries.length} kept locally. Open any to restore that version.
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 p-1">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-500">
              No history yet. As you edit, snapshots are captured automatically.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg">
              {entries.map((e) => (
                <li key={e.id} className="p-3 hover:bg-zinc-50 flex items-center justify-between gap-3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-zinc-900 truncate">{e.label}</div>
                    <div className="text-xs text-zinc-500">{new Date(e.at).toLocaleString()}</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => { onRestore(e.invoice); onClose(); }}>
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Snapshots stay in your browser and are never uploaded.</span>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={onClear}>Clear history</Button>
          </div>
        )}
      </div>
    </div>
  );
}
