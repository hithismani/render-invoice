'use client';

import { useEffect, useRef, useState } from 'react';
import type { Invoice } from '@/schema/invoiceSchema';
import { InvoiceSchema } from '@/schema/invoiceSchema';
import { nextInvoiceNumber } from '@/lib/draft';
import { SortableList, DragHandle } from './Sortable';
import ImageField from './ImageField';
import { POPULAR_FONTS, satoriFontName } from '@/lib/invoiceFonts';
import MarkdownHelpDialog, { MarkdownHelpButton } from './MarkdownHelpDialog';

interface Props {
  value: Invoice;
  onChange: (next: Invoice) => void;
}

type KV = { key: string; value: string };

const recordToKV = (r: Record<string, string> | undefined): KV[] =>
  r ? Object.entries(r).map(([key, value]) => ({ key, value: String(value ?? '') })) : [];

const kvToRecord = (arr: KV[]): Record<string, string> =>
  arr.reduce<Record<string, string>>((acc, { key, value }) => {
    if (key) acc[key] = value;
    return acc;
  }, {});

const IconPlus = () => (
  <svg className="shrink-0 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const IconTrash = () => (
  <svg className="shrink-0 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);

const addBtn = 'py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors';
const delBtn = 'py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-red-600 hover:bg-red-50 transition-colors';
const inputCls = 'w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const inputErr = 'border-red-400 focus:ring-red-500';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

type FormTab = 'content' | 'design' | 'settings';

const SECTION_TAB: Record<string, FormTab> = {
  heading: 'content', from: 'content', to: 'content',
  metaTop: 'content', columns: 'content', lineItems: 'content',
  summary: 'content', metaBottom: 'content', footer: 'content',
  design: 'design', logo: 'design', signature: 'design',
  disclaimer: 'settings', cancelled: 'settings', filename: 'settings',
};

function Section({
  title,
  description,
  children,
  defaultOpen = true,
  sectionKey,
  markdown,
  onMarkdownHelp,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  sectionKey?: string;
  /** Show markdown cheat-sheet control next to the title. */
  markdown?: boolean;
  onMarkdownHelp?: () => void;
}) {
  const formTab = sectionKey ? SECTION_TAB[sectionKey] : undefined;
  return (
    <details data-section-key={sectionKey} data-form-tab={formTab} open={defaultOpen} className="group mb-4 rounded-lg border border-gray-100 bg-white transition-colors open:border-gray-200">
      <summary className="list-none cursor-pointer p-4 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors rounded-t-lg">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {markdown && onMarkdownHelp ? <MarkdownHelpButton onClick={onMarkdownHelp} /> : null}
          </div>
          {description && <div className="mt-0.5 text-xs text-gray-500">{description}</div>}
        </div>
        <svg className="size-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function EmptyState({ message, onAdd, ctaLabel }: { message: string; onAdd: () => void; ctaLabel: string }) {
  return (
    <div className="p-6 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-500 mb-3">{message}</p>
      <button type="button" onClick={onAdd} className={addBtn}><IconPlus />{ctaLabel}</button>
    </div>
  );
}

function KVList({ items, onChange, label }: { items: KV[]; onChange: (next: KV[]) => void; label: string }) {
  const setAt = (i: number, patch: Partial<KV>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { key: '', value: '' }]);

  if (items.length === 0) return <EmptyState message="No fields yet." onAdd={add} ctaLabel={`Add ${label}`} />;

  return (
    <>
      <SortableList
        items={items}
        getId={(_, i) => `kv-${i}`}
        onReorder={onChange}
        renderItem={(it, i, handle) => (
          <div className="border border-gray-200 p-3 rounded-lg flex items-start gap-2 bg-white hover:border-gray-300 transition-colors">
            <DragHandle {...handle} />
            <div className="flex-grow">
              <input className={`${inputCls} mb-2`} placeholder="Key (e.g. Email, Address)" value={it.key} onChange={(e) => setAt(i, { key: e.target.value })} />
              <input className={inputCls} placeholder="Value" value={it.value} onChange={(e) => setAt(i, { value: e.target.value })} />
            </div>
            <button type="button" className={delBtn} onClick={() => remove(i)} aria-label="Delete"><IconTrash /></button>
          </div>
        )}
      />
      <button type="button" className={`${addBtn} mt-2`} onClick={add}><IconPlus />Add {label}</button>
    </>
  );
}

function getErrorMap(value: Invoice): Record<string, string> {
  const result = InvoiceSchema.safeParse(value);
  if (result.success) return {};
  const map: Record<string, string> = {};
  for (const issue of result.error.errors) {
    const path = issue.path.join('.');
    if (!map[path]) map[path] = issue.message;
  }
  return map;
}

export default function InvoiceForm({ value, onChange }: Props) {
  const [mdHelpOpen, setMdHelpOpen] = useState(false);
  const openMdHelp = () => setMdHelpOpen(true);
  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => onChange({ ...value, [k]: v });
  const errors = getErrorMap(value);

  const [from, setFrom] = useState<KV[]>(() => recordToKV(value.invoiceFrom));
  const [metaTop, setMetaTop] = useState<KV[]>(() => recordToKV(value.metaTop));
  const [metaBottom, setMetaBottom] = useState<KV[]>(() => recordToKV(value.metaBottom));
  const [to, setTo] = useState<KV[][]>(() => (value.invoiceTo || []).map((r) => recordToKV(r as Record<string, string>)));

  useEffect(() => { onChange({ ...value, invoiceFrom: kvToRecord(from) }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [from]);
  useEffect(() => { onChange({ ...value, metaTop: kvToRecord(metaTop) }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [metaTop]);
  useEffect(() => { onChange({ ...value, metaBottom: kvToRecord(metaBottom) }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [metaBottom]);
  useEffect(() => { onChange({ ...value, invoiceTo: to.map(kvToRecord) }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [to]);

  const setColumns = (next: string[]) => {
    const prev = value.columns || [];
    const nextItems = (value.lineItems || []).map((item) => {
      const out: Record<string, string | number> = {};
      next.forEach((c, i) => {
        const prevKey = prev[i];
        out[c] = (prevKey && prevKey in item ? item[prevKey] : item[c]) ?? '';
      });
      return out;
    });
    onChange({ ...value, columns: next, lineItems: nextItems });
  };

  const addLineItem = () =>
    set('lineItems', [...(value.lineItems || []), Object.fromEntries((value.columns || []).map((c) => [c, '']))]);
  const removeLineItem = (i: number) => set('lineItems', value.lineItems.filter((_, idx) => idx !== i));
  const setLineItemField = (i: number, col: string, v: string) =>
    set('lineItems', value.lineItems.map((item, idx) => (idx === i ? { ...item, [col]: v } : item)));

  const addSummary = () => set('summary', [...(value.summary || []), { label: '', value: '' }]);
  const removeSummary = (i: number) => set('summary', value.summary.filter((_, idx) => idx !== i));
  const setSummaryField = (i: number, field: 'label' | 'value', v: string) =>
    set('summary', value.summary.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)));

  const setFooter = (field: 'topText' | 'bottomText', v: string) =>
    set('footerText', { ...(value.footerText || {}), [field]: v });

  const setLogoSize = (field: 'width' | 'height', v: number) =>
    set('logoSize', { width: value.logoSize?.width ?? 0, height: value.logoSize?.height ?? 0, [field]: v });
  const setSigSize = (field: 'width' | 'height', v: number) =>
    set('signatureSize', { width: value.signatureSize?.width ?? 0, height: value.signatureSize?.height ?? 0, [field]: v });

  const errCount = Object.keys(errors).length;

  const [tab, setTab] = useState<FormTab>('content');
  const rootRef = useRef<HTMLDivElement>(null);

  const goTo = (t: FormTab) => {
    setTab(t);
    document.getElementById(`form-tab-${t}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabIssueCount = (t: FormTab): number => {
    let n = 0;
    for (const path of Object.keys(errors)) {
      const top = path.split('.')[0];
      const key = SECTION_TAB[top] || SECTION_TAB[path as string];
      if (key === t) n++;
    }
    return n;
  };

  useEffect(() => {
    const onSwitch = (e: Event) => {
      const t = (e as CustomEvent<FormTab>).detail;
      if (t === 'content' || t === 'design' || t === 'settings') goTo(t);
    };
    window.addEventListener('renderinvoice:form-tab', onSwitch as EventListener);
    return () => window.removeEventListener('renderinvoice:form-tab', onSwitch as EventListener);
  }, []);

  useEffect(() => {
    const root = rootRef.current?.closest('[data-form-scroll]') as HTMLElement | null;
    const ids: FormTab[] = ['content', 'design', 'settings'];
    const els = ids.map((id) => document.getElementById(`form-tab-${id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = hit?.target.getAttribute('data-form-panel') as FormTab | null;
        if (id) setTab(id);
      },
      { root, rootMargin: '-10% 0px -70% 0px', threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const TabBtn = ({ id, label }: { id: FormTab; label: string }) => {
    const n = tabIssueCount(id);
    return (
      <button
        type="button"
        onClick={() => goTo(id)}
        className={`flex-1 lg:flex-none lg:w-full text-left px-2.5 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center lg:justify-between gap-2 ${tab === id ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
      >
        {label}
        {n > 0 && <span className="size-4 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">{n}</span>}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="flex flex-col lg:flex-row gap-4 items-start">
      <MarkdownHelpDialog open={mdHelpOpen} onClose={() => setMdHelpOpen(false)} />
      <nav className="sticky top-0 z-10 w-full lg:w-[5.75rem] shrink-0 flex flex-row lg:flex-col gap-0.5">
        <TabBtn id="content" label="Content" />
        <TabBtn id="design" label="Design" />
        <TabBtn id="settings" label="Settings" />
      </nav>
      <div className="min-w-0 flex-1">
      {errCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          {errCount} issue{errCount > 1 ? 's' : ''}: check the highlighted tab to fix.
        </div>
      )}

      <div id="form-tab-content" data-form-panel="content">
        <Section title="Heading" description="Title and subtitle for the invoice." sectionKey="heading" markdown onMarkdownHelp={openMdHelp}>
        <input className={`${inputCls} mb-2`} placeholder="e.g., Invoice" value={value.invoiceHeading || ''} onChange={(e) => set('invoiceHeading', e.target.value)} />
        <input className={inputCls} placeholder="e.g., Consulting services, September 2024" value={value.invoiceDescription || ''} onChange={(e) => set('invoiceDescription', e.target.value)} />
      </Section>

      <Section title="Invoice From" description="Sender details. Drag to reorder. Wrap a key in @…@ to hide its label." sectionKey="from" markdown onMarkdownHelp={openMdHelp}>
        <KVList items={from} onChange={setFrom} label="field" />
      </Section>

      <Section title="Invoice To" description="One block per recipient. Wrap a key in @…@ to hide its label." sectionKey="to" markdown onMarkdownHelp={openMdHelp}>
        {to.length === 0 ? (
          <EmptyState message="No recipients yet." onAdd={() => setTo([[{ key: 'Bill To', value: '' }]])} ctaLabel="Add Recipient" />
        ) : (
          <>
            <div className="space-y-4">
              {to.map((rec, ri) => (
                <div key={ri} className="border border-gray-200 p-4 rounded-lg space-y-2 bg-gray-50">
                  <KVList items={rec} onChange={(next) => setTo(to.map((r, i) => (i === ri ? next : r)))} label="field" />
                  <button type="button" className={delBtn} onClick={() => setTo(to.filter((_, i) => i !== ri))}><IconTrash />Delete Recipient</button>
                </div>
              ))}
            </div>
            <button type="button" className={`${addBtn} mt-2`} onClick={() => setTo([...to, [{ key: '', value: '' }]])}><IconPlus />Add Recipient</button>
          </>
        )}
      </Section>

      <Section title="Meta (Top)" description="Invoice number, date, and due date shown above line items." sectionKey="metaTop" markdown onMarkdownHelp={openMdHelp}>
        <button
          type="button"
          onClick={async () => {
            const n = await nextInvoiceNumber('INV');
            const updated = metaTop.some((kv) => kv.key === 'Invoice Number')
              ? metaTop.map((kv) => (kv.key === 'Invoice Number' ? { ...kv, value: n } : kv))
              : [{ key: 'Invoice Number', value: n }, ...metaTop];
            setMetaTop(updated);
          }}
          className="mb-3 px-3 py-1.5 text-xs rounded-full border border-dashed border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
        >
          Auto-fill next invoice number
        </button>
        <KVList items={metaTop} onChange={setMetaTop} label="field" />
      </Section>

      <Section title="Columns" description="Column headers for the line items table. Drag to reorder." sectionKey="columns" markdown onMarkdownHelp={openMdHelp}>
        {(value.columns || []).length === 0 ? (
          <EmptyState message="No columns yet." onAdd={() => setColumns(['Description', 'Quantity', 'Price', 'Amount'])} ctaLabel="Use default columns" />
        ) : (
          <>
            <SortableList
              items={value.columns || []}
              getId={(_, i) => `col-${i}`}
              onReorder={setColumns}
              renderItem={(c, i, handle) => (
                <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-lg hover:border-gray-300 transition-colors">
                  <DragHandle {...handle} />
                  <input className={`flex-grow ${inputCls} ${errors[`columns.${i}`] ? inputErr : ''}`} placeholder="Column name" value={c} onChange={(e) => setColumns(value.columns.map((x, idx) => (idx === i ? e.target.value : x)))} />
                  <button type="button" className={delBtn} onClick={() => setColumns(value.columns.filter((_, idx) => idx !== i))} aria-label="Delete"><IconTrash /></button>
                </div>
              )}
            />
            {errors['columns'] && <FieldError msg={errors['columns']} />}
            <button type="button" className={`${addBtn} mt-2`} onClick={() => setColumns([...(value.columns || []), ''])}><IconPlus />Add Column</button>
          </>
        )}
      </Section>

      <Section title="Line Items" description="Each row is one item. Cells align with the columns above." sectionKey="lineItems" markdown onMarkdownHelp={openMdHelp}>
        {(value.lineItems || []).length === 0 ? (
          <EmptyState message="No line items yet." onAdd={addLineItem} ctaLabel="Add Line Item" />
        ) : (
          <>
            <SortableList
              items={value.lineItems || []}
              getId={(_, i) => `li-${i}`}
              onReorder={(next) => set('lineItems', next)}
              renderItem={(item, i, handle) => (
                <div className="border border-gray-200 p-3 rounded-lg flex items-start gap-2 bg-white hover:border-gray-300 transition-colors">
                  <DragHandle {...handle} />
                  <div className="flex-grow space-y-2">
                    {(value.columns || []).map((col, ci) => (
                      <input
                        key={`${ci}-${col}`}
                        className={inputCls}
                        placeholder={col || `Column ${ci + 1}`}
                        value={String(item[col] ?? '')}
                        onChange={(e) => setLineItemField(i, col, e.target.value)}
                      />
                    ))}
                  </div>
                  <button type="button" className={delBtn} onClick={() => removeLineItem(i)} aria-label="Delete"><IconTrash /></button>
                </div>
              )}
            />
            <button type="button" className={`${addBtn} mt-2`} onClick={addLineItem}><IconPlus />Add Line Item</button>
          </>
        )}
      </Section>

      <Section title="Summary" description="Subtotal, tax, discounts, and total rows." sectionKey="summary" markdown onMarkdownHelp={openMdHelp}>
        {(value.summary || []).length === 0 ? (
          <EmptyState message="No summary rows yet." onAdd={addSummary} ctaLabel="Add Summary Row" />
        ) : (
          <>
            <SortableList
              items={value.summary || []}
              getId={(_, i) => `sum-${i}`}
              onReorder={(next) => set('summary', next)}
              renderItem={(s, i, handle) => (
                <div className="border border-gray-200 p-3 rounded-lg flex items-start gap-2 bg-white hover:border-gray-300 transition-colors">
                  <DragHandle {...handle} />
                  <div className="flex-grow">
                    <input className={`${inputCls} mb-2 ${errors[`summary.${i}.label`] ? inputErr : ''}`} placeholder="Label (e.g., Subtotal)" value={s.label || ''} onChange={(e) => setSummaryField(i, 'label', e.target.value)} />
                    <FieldError msg={errors[`summary.${i}.label`]} />
                    <input className={`${inputCls} ${errors[`summary.${i}.value`] ? inputErr : ''}`} placeholder="Value (e.g., $1,200)" value={String(s.value ?? '')} onChange={(e) => setSummaryField(i, 'value', e.target.value)} />
                    <FieldError msg={errors[`summary.${i}.value`]} />
                  </div>
                  <button type="button" className={delBtn} onClick={() => removeSummary(i)} aria-label="Delete"><IconTrash /></button>
                </div>
              )}
            />
            <button type="button" className={`${addBtn} mt-2`} onClick={addSummary}><IconPlus />Add Summary Row</button>
          </>
        )}
      </Section>

      <Section title="Meta (Bottom)" description="Payment terms and notes shown below line items." defaultOpen={false} sectionKey="metaBottom" markdown onMarkdownHelp={openMdHelp}>
        <KVList items={metaBottom} onChange={setMetaBottom} label="field" />
      </Section>

      <Section title="Footer" description="Top and bottom lines under the signature area." defaultOpen={false} sectionKey="footer" markdown onMarkdownHelp={openMdHelp}>
        <input className={`${inputCls} mb-2`} placeholder="Top text (e.g., Thank you!)" value={value.footerText?.topText || ''} onChange={(e) => setFooter('topText', e.target.value)} />
        <input className={inputCls} placeholder="Bottom text" value={value.footerText?.bottomText || ''} onChange={(e) => setFooter('bottomText', e.target.value)} />
      </Section>
      </div>

      <div id="form-tab-design" data-form-panel="design" className="mt-8 pt-6 border-t border-zinc-100">
        <Section title="Design" description="Pick a visual variant, accent color, and reading direction." sectionKey="design">
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Variant</label>
            <div className="grid grid-cols-2 gap-2">
              {(['classic', 'bold'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('design', d)}
                  className={`p-3 rounded-lg border text-sm text-left transition-all ${(value.design || 'classic') === d ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/40' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-semibold text-gray-900 capitalize">{d}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {d === 'classic' && 'Boxed · flexible'}
                    {d === 'bold' && 'Accent · striking'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Typeface</label>
            <p className="text-[11px] text-gray-500 mb-2">
              Embedded in PDF as Regular + Bold. Pick one of the fonts below (default Inter).
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set('font', f)}
                  className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${satoriFontName(value.font) === f ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  style={{ fontFamily: `"${f}", ui-sans-serif, system-ui, sans-serif` }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Accent color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={value.accentColor || '#2563eb'} onChange={(e) => set('accentColor', e.target.value)} className="h-10 w-14 rounded border border-gray-200 cursor-pointer" />
              <input type="text" value={value.accentColor || '#2563eb'} onChange={(e) => set('accentColor', e.target.value)} className={`${inputCls} font-mono text-sm`} placeholder="#2563eb" />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {['#2563eb', '#111827', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d'].map((c) => (
                <button key={c} type="button" onClick={() => set('accentColor', c)} className="size-7 rounded-full border-2 border-white shadow ring-1 ring-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} aria-label={`Use ${c}`} />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Reading direction</label>
            <div className="inline-flex rounded-md border border-gray-200 p-0.5">
              {([['ltr', 'LTR · Left-to-right'], ['rtl', 'RTL · Right-to-left (Arabic, Hebrew…)']] as const).map(([d, label]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('direction', d)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${(value.direction || 'ltr') === d ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >{label}</button>
              ))}
            </div>
          </div>

          {value.logoUrl ? (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Logo position</label>
              <div className="inline-flex rounded-md border border-gray-200 p-0.5">
                {(['left', 'center', 'right'] as const).map((p) => (
                  <button key={p} type="button" onClick={() => set('logoPosition', p)} className={`px-3 py-1.5 text-xs rounded capitalize transition-colors ${(value.logoPosition || 'center') === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Add a logo below to enable positioning.</p>
          )}
        </Section>

        <Section title="Logo" description="Paste an image URL or upload a file. Files are resized and embedded locally without server uploads." defaultOpen={false} sectionKey="logo">
        <ImageField
          label="Logo"
          url={value.logoUrl}
          width={value.logoSize?.width}
          height={value.logoSize?.height}
          maxW={600}
          maxH={200}
          onChange={(url, size) => {
            onChange({
              ...value,
              logoUrl: url,
              logoSize: size ? { width: size.width, height: size.height } : value.logoSize,
            });
          }}
        />
      </Section>

      <Section title="Digital Signature" description="Paste a URL or upload an image of your signature." defaultOpen={false} sectionKey="signature">
        <ImageField
          label="Signature"
          url={value.digitalSignatureUrl}
          width={value.signatureSize?.width}
          height={value.signatureSize?.height}
          maxW={500}
          maxH={160}
          onChange={(url, size) => {
            onChange({
              ...value,
              digitalSignatureUrl: url,
              signatureSize: size ? { width: size.width, height: size.height } : value.signatureSize,
            });
          }}
        />
      </Section>

      </div>

      <div id="form-tab-settings" data-form-panel="settings" className="mt-8 pt-6 border-t border-zinc-100">
        <Section title="Options" sectionKey="disclaimer">
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={!!value.autoSize} onChange={(e) => set('autoSize', e.target.checked)} />
            <span className="text-sm">Auto-size PDF (A4 width, grow height) vs fit one A4</span>
          </label>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={!!value.amountsVerifiedHideDisclaimer} onChange={(e) => set('amountsVerifiedHideDisclaimer', e.target.checked)} />
            <span className="text-sm">I have verified the invoice, and want to hide disclaimer.</span>
          </label>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={!!value.isCancelled} onChange={(e) => set('isCancelled', e.target.checked)} />
            <span className="text-sm">Mark as cancelled</span>
          </label>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={!!value.showBuiltWith} onChange={(e) => set('showBuiltWith', e.target.checked)} />
            <span className="text-sm">Show <em>&ldquo;Built with RenderInvoice&rdquo;</em> at the bottom</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={value.includeEditLink !== false} onChange={(e) => set('includeEditLink', e.target.checked)} />
            <span className="text-sm">PDF edit link</span>
          </label>
        </Section>

        <Section title="Filename" description="What the downloaded PDF will be called." defaultOpen={false} sectionKey="filename">
          <input className={inputCls} placeholder="e.g., invoice-september" value={value.filename || ''} onChange={(e) => set('filename', e.target.value)} />
        </Section>

        {value.isCancelled && (
          <Section title="Cancellation Notes" description="Shown on the cancelled badge and notes strip." sectionKey="cancelled" markdown onMarkdownHelp={openMdHelp}>
            <textarea className={inputCls} rows={3} value={value.cancelledNotes || ''} onChange={(e) => set('cancelledNotes', e.target.value)} />
          </Section>
        )}
      </div>
      </div>
    </div>
  );
}
