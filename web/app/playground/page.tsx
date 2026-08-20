'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import InvoiceForm from '@/components/InvoiceForm';
import PlaygroundNav from '@/components/PlaygroundNav';
import SatoriPreview from '@/components/SatoriPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useLayoutEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ISparkles } from '@/components/Icons';
import SchemaDialog from '@/components/SchemaDialog';
import CopySchemaButton from '@/components/CopySchemaButton';
import { exampleInvoice, type Invoice as InvoiceData } from '@/schema/invoiceSchema';
import { resolveFilename } from '@/lib/downloadPdf';
import { decodeShareHash } from '@/lib/share';
import { loadDraft, saveDraft, clearDraft } from '@/lib/draft';
import { appendHistory, findInvoiceNumberMatch } from '@/lib/history';
import { isStorageSupported } from '@/lib/draft';
import WelcomeDialog from '@/components/WelcomeDialog';
import SiteFooter from '@/components/SiteFooter';

type Tab = 'form' | 'json';

export default function PlaygroundPage() {
  const [tab, setTab] = useState<Tab>('form');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(exampleInvoice);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(exampleInvoice, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ at: number; invoice: InvoiceData } | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const storageOk = typeof window === 'undefined' ? true : isStorageSupported();

  // Doc name is derived from the invoice itself so the nav title, the Settings
  // filename field, and the exported PDF filename are always in sync.
  const docName = resolveFilename(invoiceData);
  const setDocName = (name: string) => setInvoiceData((prev) => ({ ...prev, filename: name }));

  const flashMsg = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2000);
  };

  useEffect(() => {
    const shared = decodeShareHash(window.location.hash);
    if (shared) {
      setInvoiceData(shared);
      setJsonText(JSON.stringify(shared, null, 2));
      return;
    }
    void (async () => {
      const d = await loadDraft();
      if (d) setDraftBanner(d);
    })();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      const status = await saveDraft(invoiceData);
      if (status.ok) {
        setAutosaveError(null);
        setSavedAt(Date.now());
      } else {
        setAutosaveError(status.error);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [invoiceData]);

  // History snapshots: debounced further so minor edits don't pollute history.
  useEffect(() => {
    const id = window.setTimeout(() => { void appendHistory(invoiceData); }, 5000);
    return () => window.clearTimeout(id);
  }, [invoiceData]);

  // Warn when the invoice number collides with a previously-used one.
  useEffect(() => {
    const num = invoiceData.metaTop?.['Invoice Number'];
    if (!num) return;
    const id = window.setTimeout(async () => {
      const hit = await findInvoiceNumberMatch(num);
      if (hit) flashMsg(`#${num} was used before in ${hit.source}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [invoiceData.metaTop?.['Invoice Number']]);

  const parseJson = (text: string): InvoiceData | null => {
    try { return JSON.parse(text) as InvoiceData; }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); return null; }
  };

  const onPreviewFromJson = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = parseJson(jsonText);
    if (parsed) setInvoiceData(parsed);
  };

  const onFormChange = (next: InvoiceData) => {
    setInvoiceData(next);
    setJsonText(JSON.stringify(next, null, 2));
  };

  const loadInvoice = (inv: InvoiceData) => {
    setInvoiceData(inv);
    setJsonText(JSON.stringify(inv, null, 2));
    if (inv.filename) setDocName(inv.filename);
  };

  const switchTab = (t: Tab) => {
    if (t === 'form') {
      const parsed = parseJson(jsonText);
      if (parsed) setInvoiceData(parsed);
    } else {
      setJsonText(JSON.stringify(invoiceData, null, 2));
    }
    setTab(t);
  };

  const currentInvoice = useCallback((): InvoiceData | null => {
    const data = tab === 'json' ? parseJson(jsonText) : invoiceData;
    if (data) setInvoiceData(data);
    return data;
  }, [tab, jsonText, invoiceData]);

  // Vector PDF only (selectable text). Never PNG-in-PDF.
  const handleDownload = useCallback(async () => {
    setError(null);
    const data = currentInvoice();
    if (!data) return;
    setDownloading(true);
    try {
      const { initSatori, renderVectorPdf, renderPdf, downloadPdfBytes } = await import('@/lib/satoriRender');
      await initSatori();
      let pdfBytes: Uint8Array;
      try {
        pdfBytes = await renderVectorPdf(data);
      } catch (vectorErr) {
        console.warn('svg2pdf failed, using free-worker vector path:', vectorErr);
        pdfBytes = await renderPdf(data);
      }
      downloadPdfBytes(pdfBytes, resolveFilename(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  }, [currentInvoice]);

  // SVG export uses embedFont:false so text stays as real <text> elements
  // (ctrl-F finds words, parsers can read content). With Satori's default
  // embedFont:true, every glyph becomes an unsearchable <path>.
  const handleDownloadSvg = useCallback(async () => {
    setError(null);
    const data = currentInvoice();
    if (!data) return;
    try {
      const { initSatori, renderSvg, downloadSvg } = await import('@/lib/satoriRender');
      await initSatori();
      const svg = await renderSvg(data, 900, { forExport: true, embedFont: false });
      downloadSvg(svg, resolveFilename(data));
      flashMsg('SVG exported');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [currentInvoice]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'Enter') { e.preventDefault(); void handleDownload(); }
      if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); switchTab(tab === 'json' ? 'form' : 'json'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleDownload, tab, jsonText, invoiceData]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <PlaygroundNav
        invoice={invoiceData}
        docName={docName}
        onDocNameChange={setDocName}
        onLoad={loadInvoice}
        onDownload={handleDownload}
        onDownloadSvg={handleDownloadSvg}
        downloading={downloading}
        savedAt={savedAt}
        onFlash={flashMsg}
        storageOk={storageOk}
        autosaveError={autosaveError}
      />
      <WelcomeDialog />
      <SchemaDialog open={schemaOpen} onClose={() => setSchemaOpen(false)} />
      {flash && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in-up">
          {flash}
        </div>
      )}

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {draftBanner && (
          <Card className="mb-4 p-3.5 border-amber-200 bg-amber-50/70 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <ISparkles className="size-4" /> Unsaved draft from {new Date(draftBanner.at).toLocaleString()}.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { void clearDraft(); setDraftBanner(null); }}>Dismiss</Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => { loadInvoice(draftBanner.invoice); setDraftBanner(null); }}>
                Restore
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 sm:gap-5 items-start">
          {/* Editor — stacks on top on mobile */}
          <Card className="overflow-hidden order-1">
            <div className="px-4 sm:px-5 pt-3 flex items-center gap-1 border-b border-zinc-100 bg-white">
              <TabBtn active={tab === 'form'} onClick={() => switchTab('form')}>Form</TabBtn>
              <TabBtn active={tab === 'json'} onClick={() => switchTab('json')}>JSON</TabBtn>
              <span className="ml-auto text-xs text-zinc-400 pb-3 hidden sm:inline">
                {tab === 'form' ? 'Visual · drag to reorder' : 'Paste & go'}
              </span>
            </div>

            {tab === 'json' ? (
              <form onSubmit={onPreviewFromJson} className="flex flex-col">
                <div className="px-4 sm:px-5 pt-4">
                  <div className="mb-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <ISparkles className="size-3.5 mt-0.5 shrink-0" />
                    <div>
                      <strong className="font-semibold">This is the invoice JSON.</strong> Missing commas or invalid types will break the preview.
                      {' '}
                      <button type="button" onClick={() => switchTab('form')} className="underline underline-offset-2 font-medium hover:text-amber-950">Form view</button>
                      {' · '}
                      <button type="button" onClick={() => setSchemaOpen(true)} className="underline underline-offset-2 font-medium hover:text-amber-950">Schema</button>
                      {' · '}
                      <CopySchemaButton className="align-middle" />
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-5 pb-5">
                  <AutoGrowTextarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="font-mono text-sm leading-relaxed"
                    placeholder="Paste invoice JSON here"
                    spellCheck={false}
                    minRows={12}
                  />
                </div>
                <EditorFooter error={error}>
                  <Button type="submit" variant="secondary" size="sm">Update preview</Button>
                </EditorFooter>
              </form>
            ) : (
              <>
                <div data-form-scroll className="p-4 sm:p-5 max-h-none lg:max-h-[calc(100vh-260px)] overflow-y-auto">
                  <InvoiceForm value={invoiceData} onChange={onFormChange} />
                </div>
                <EditorFooter error={error} />
              </>
            )}
          </Card>

          {/* Preview — below editor on mobile */}
          <Card className="order-2 lg:sticky lg:top-[72px] self-start overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-1.5 shrink-0">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-medium text-zinc-600 ml-1 font-mono truncate">{docName}</span>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">Live</Badge>
            </div>
            <div className="bg-zinc-100/60 p-3 sm:p-4 max-h-[70vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-auto">
              <div className="min-w-[280px]">
                <SatoriPreview invoice={invoiceData} />
              </div>
            </div>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function AutoGrowTextarea({
  value, onChange, className, placeholder, spellCheck, minRows = 10,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  spellCheck?: boolean;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 22;
    const min = minRows * lineHeight;
    el.style.height = `${Math.max(el.scrollHeight, min)}px`;
  }, [value, minRows]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={`w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-none overflow-hidden ${className || ''}`}
      placeholder={placeholder}
      spellCheck={spellCheck}
    />
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-3.5 py-2.5 text-sm font-medium transition-colors ${active ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'}`}
    >
      {children}
      {active && <span className="absolute inset-x-2.5 -bottom-px h-0.5 bg-zinc-900 rounded-full" />}
    </button>
  );
}

function EditorFooter({ error, children }: { error: string | null; children?: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/60">
      {error && <div className="mb-2.5 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">{error}</div>}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-zinc-500">
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono mr-1">⌘↵</kbd>
          save PDF
          <span className="mx-1.5 text-zinc-300">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono mr-1">⌘J</kbd>
          switch tab
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
