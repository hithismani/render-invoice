'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { listTemplates, saveTemplate, deleteTemplate, type Template } from '@/lib/storage';
import type { Invoice } from '@/schema/invoiceSchema';

export default function TemplatesDialog({
  open, onClose, current, currentName, onLoad,
}: {
  open: boolean; onClose: () => void; current: Invoice; currentName: string; onLoad: (inv: Invoice) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('');

  const refresh = async () => setTemplates(await listTemplates());

  useEffect(() => {
    if (!open) return;
    setName(currentName);
    void refresh();
  }, [open, currentName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onSave = async () => {
    const n = name.trim() || `Invoice ${new Date().toLocaleString()}`;
    await saveTemplate(n, current);
    await refresh();
  };
  const onDelete = async (id: string) => { await deleteTemplate(id); await refresh(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in-up" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-zinc-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">My Templates</h3>
            <p className="text-sm text-zinc-500">Saved locally in your browser. Never leaves your device.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 p-1">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
          <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Save current invoice as</label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
            <Button onClick={onSave} variant="primary">Save</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-500">
              No saved templates yet. Save the current invoice above to reuse it later.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg">
              {templates.map((t) => (
                <li key={t.id} className="p-3 hover:bg-zinc-50 flex items-center justify-between gap-3 transition-colors">
                  <button onClick={() => onLoad(t.invoice)} className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm text-zinc-900 truncate">{t.name}</div>
                    <div className="text-xs text-zinc-500">{new Date(t.updatedAt).toLocaleString()}</div>
                  </button>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => onLoad(t.invoice)}>Load</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(t.id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
