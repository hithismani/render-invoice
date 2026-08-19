'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Dropdown, MenuItem, MenuLabel, MenuSeparator } from './ui/dropdown';
import { IDownload, IShare, IArrowRight } from './Icons';
import type { Invoice } from '@/schema/invoiceSchema';
import { blankInvoice } from '@/schema/invoiceSchema';
import LogoRibbon from './LogoRibbon';
import ShareDialog from './ShareDialog';
import TemplatesDialog from './TemplatesDialog';
import HistoryDialog from './HistoryDialog';
import {
  listTemplates,
  saveTemplate,
  exportTemplatesJson,
  importTemplatesJson,
} from '@/lib/storage';

interface Props {
  invoice: Invoice;
  docName: string;
  onDocNameChange: (name: string) => void;
  onLoad: (inv: Invoice) => void;
  onDownload: () => void;
  onDownloadSvg?: () => void;
  onDownloadRasterPdf?: () => void;
  downloading: boolean;
  savedAt?: number | null;
  onFlash?: (msg: string) => void;
  storageOk?: boolean;
  autosaveError?: string | null;
}

export default function PlaygroundNav({
  invoice, docName, onDocNameChange, onLoad, onDownload, onDownloadSvg, onDownloadRasterPdf,
  downloading, savedAt, onFlash,
  storageOk = true, autosaveError = null,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedLabel, setSavedLabel] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => {
      if (!savedAt) return setSavedLabel('');
      const s = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
      setSavedLabel(s < 5 ? 'Saved just now' : s < 60 ? `Saved ${s}s ago` : `Saved ${Math.floor(s / 60)}m ago`);
    };
    update();
    const id = window.setInterval(update, 5000);
    return () => window.clearInterval(id);
  }, [savedAt]);

  const flash = (msg: string) => onFlash?.(msg);

  const onStartFresh = () => {
    if (!window.confirm('Start from scratch? Your current draft will be replaced with a blank invoice.\n\nTip: saved templates and the history log are not affected.')) return;
    onLoad(blankInvoice);
    flash('Started fresh');
  };

  const onSaveTemplate = async () => {
    const name = window.prompt('Template name', docName || 'Untitled');
    if (!name) return;
    await saveTemplate(name, invoice);
    flash(`Saved "${name}"`);
  };

  const onExportCurrent = () => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${docName || 'invoice'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('JSON exported');
  };

  const onExportAll = async () => {
    const list = await listTemplates();
    if (list.length === 0) return flash('No saved templates to back up');
    const json = await exportTemplatesJson();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `invoicely-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash(`Backed up ${list.length} template(s)`);
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      try {
        const maybeInvoice = JSON.parse(text);
        if (Array.isArray(maybeInvoice) && maybeInvoice.every((t) => t?.invoice)) {
          const n = await importTemplatesJson(text);
          flash(`Imported ${n} template(s)`);
          return;
        }
        onLoad(maybeInvoice);
        flash('Invoice loaded from JSON');
      } catch {
        flash('Invalid JSON');
      }
    } catch (e) {
      flash(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <>
      <ShareDialog invoice={invoice} open={shareOpen} onClose={() => setShareOpen(false)} />
      <HistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} onRestore={(inv) => { onLoad(inv); flash('Restored from history'); }} />
      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        current={invoice}
        currentName={docName}
        onLoad={(inv) => { onLoad(inv); setTemplatesOpen(false); }}
      />
      <input ref={fileRef} type="file" accept="application/json" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void onImportFile(f); e.target.value = ''; }}
      />

      <header className="sticky top-0 z-40 h-12 bg-zinc-950 text-zinc-100 border-b border-zinc-800/80 flex items-center px-3 gap-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors">
          <div className="size-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center shadow-sm shadow-blue-500/30">
            <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">Invoicely</span>
          <LogoRibbon dark className="hidden md:inline-flex" />
        </Link>

        {/* File menu */}
        <Dropdown
          align="start"
          trigger={
            <button className="px-2.5 py-1.5 rounded-md text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1">
              File
              <svg className="size-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          }
        >
          <MenuLabel>This invoice</MenuLabel>
          <MenuItem icon={<IconSparkles />} onClick={onStartFresh}>Start from scratch…</MenuItem>
          <MenuItem icon={<IconBookmark />} onClick={onSaveTemplate}>Save as template…</MenuItem>
          <MenuItem icon={<IconDownload />} onClick={onExportCurrent} shortcut=".json">Export JSON</MenuItem>
          {onDownloadSvg && <MenuItem icon={<IconDownload />} onClick={onDownloadSvg} shortcut=".svg">Export SVG (searchable)</MenuItem>}
          {onDownloadRasterPdf && <MenuItem icon={<IconDownload />} onClick={onDownloadRasterPdf} shortcut=".pdf">Export raster PDF (image-only)</MenuItem>}
          <MenuItem icon={<IconShare />} onClick={() => setShareOpen(true)}>Share link / QR…</MenuItem>
          <MenuSeparator />
          <MenuLabel>Templates</MenuLabel>
          <MenuItem icon={<IconLibrary />} onClick={() => setTemplatesOpen(true)}>My templates…</MenuItem>
          <MenuItem icon={<IconClock />} onClick={() => setHistoryOpen(true)}>History…</MenuItem>
          <MenuItem icon={<IconUpload />} onClick={() => fileRef.current?.click()}>Import from .json</MenuItem>
          <MenuItem icon={<IconArchive />} onClick={onExportAll}>Back up all templates</MenuItem>
          <MenuSeparator />
          <MenuItem onClick={() => window.open('/examples', '_blank')}>Browse built-in examples ↗</MenuItem>
        </Dropdown>

        <span className="text-zinc-700">/</span>

        {/* Doc name — suppressHydrationWarning because password-manager
            extensions (LastPass, 1Password, Bitwarden) inject icon markup
            next to <input> fields and break React hydration. */}
        <div className="flex-1 min-w-0 flex items-center gap-2" suppressHydrationWarning>
          <input
            value={docName}
            onChange={(e) => onDocNameChange(e.target.value)}
            className="bg-transparent text-sm font-medium text-zinc-100 placeholder:text-zinc-500 border-0 outline-none focus:bg-white/5 rounded-md px-2 py-1 max-w-[220px] sm:max-w-xs truncate hover:bg-white/5 transition-colors"
            placeholder="Untitled invoice"
            aria-label="Invoice name"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            suppressHydrationWarning
          />
          <AutosaveIndicator storageOk={storageOk} autosaveError={autosaveError} savedLabel={savedLabel} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="How this works"
            title="How this works"
            onClick={() => window.dispatchEvent(new Event('invoicely:onboard'))}
            className="size-7 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors grid place-items-center"
          >
            ?
          </button>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <IShare className="size-3.5" /> <span className="hidden sm:inline">Share</span>
          </button>
          <Button onClick={onDownload} disabled={downloading} size="sm" variant="invert">
            {downloading ? (
              <><span className="size-3 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" /> Opening…</>
            ) : (
              <><IDownload className="size-3.5" /> <span className="hidden sm:inline">Save PDF</span></>
            )}
          </Button>
        </div>
      </header>
    </>
  );
}

function AutosaveIndicator({ storageOk, autosaveError, savedLabel }: { storageOk: boolean; autosaveError: string | null; savedLabel: string }) {
  if (!storageOk) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-amber-300" title="Your browser does not support IndexedDB. Export .json manually to avoid losing work.">
        <span className="size-1.5 rounded-full bg-amber-400" />
        Auto-save unavailable
      </span>
    );
  }
  if (autosaveError) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-red-300" title={autosaveError}>
        <span className="size-1.5 rounded-full bg-red-400" />
        Auto-save failed: hover for details
      </span>
    );
  }
  return (
    <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-zinc-400" title="Every edit is saved to your browser’s local database (IndexedDB).">
      <span className="size-1.5 rounded-full bg-emerald-400" />
      {savedLabel || 'Auto-save is on'}
    </span>
  );
}

const IconBookmark = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
  </svg>
);
const IconDownload = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconUpload = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);
const IconShare = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);
const IconLibrary = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" />
  </svg>
);
const IconArchive = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" />
  </svg>
);
const IconClock = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconSparkles = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.94 14.06 8 20l-1.94-5.94L0 12l6.06-1.94L8 4l1.94 6.06L16 12l-6.06 2.06Z" /><path d="M20 3v4M18 5h4M18 16v4M16 18h4" />
  </svg>
);
