'use client';

import { forwardRef, useEffect } from 'react';
import type { Invoice as InvoiceData } from '@/schema/invoiceSchema';
import { InvoiceSchema, validateLineItemColumns } from '@/schema/invoiceSchema';
import { formatMarkdown, displayKey, stripMarkdown } from '@/lib/formatMarkdown';
import { sharePath } from '@/lib/share';
import { fontStack, googleCssHref, satoriFontName } from '@/lib/invoiceFonts';
import Disclaimer from './Disclaimer';

interface Props {
  invoice: InvoiceData;
  performValidation?: boolean;
  printView?: boolean;
}

function Md({ children, as: As = 'span', className, style }: { children: string | number | undefined | null; as?: any; className?: string; style?: React.CSSProperties }) {
  return <As className={className} style={style} dangerouslySetInnerHTML={{ __html: formatMarkdown(children) }} />;
}

function copyright(invoice: InvoiceData): string {
  const fromEntries = invoice.invoiceFrom ? Object.entries(invoice.invoiceFrom) : [];
  const name = stripMarkdown(
    invoice.invoiceFrom?.['Issued By'] ||
      invoice.invoiceFrom?.['Company'] ||
      invoice.invoiceFrom?.['Legal Name'] ||
      invoice.invoiceFrom?.['Name'] ||
      invoice.invoiceFrom?.['Raised By'] ||
      fromEntries[0]?.[1] ||
      '',
  );
  const dateStr =
    invoice.metaTop?.['Invoice Date'] ||
    invoice.metaTop?.['Date'] ||
    invoice.metaTop?.['Tax Point'] ||
    '';
  const y = dateStr ? new Date(dateStr).getFullYear() : NaN;
  const year = Number.isFinite(y) ? y : new Date().getFullYear();
  return name ? `© ${year} ${name}. All rights reserved.` : `© ${year}. All rights reserved.`;
}

const Invoice = forwardRef<HTMLDivElement, Props>(function Invoice(
  { invoice, performValidation = true, printView = false },
  ref,
) {
  let validationErrors: string[] = [];
  if (performValidation) {
    const result = InvoiceSchema.safeParse(invoice);
    if (!result.success) validationErrors = result.error.errors.map((e) => e.message);
    const liv = validateLineItemColumns(invoice);
    if (!liv.valid) validationErrors = [...validationErrors, ...liv.errors];
  }

  const design = invoice.design || 'classic';
  const accent = invoice.accentColor || '#2563eb';
  const logoPos = (invoice.logoPosition || 'center') as 'center' | 'left' | 'right';
  const dir = invoice.direction || 'ltr';
  const cols = Array.isArray(invoice?.columns) ? invoice.columns : [];
  const colTemplate = `repeat(${cols.length || 1}, minmax(0, 1fr))`;

  useEffect(() => {
    const id = `invoice-font-${satoriFontName(invoice.font).replace(/\s+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = googleCssHref(invoice.font);
    document.head.appendChild(link);
  }, [invoice.font]);

  const rootStyle = { ['--accent' as any]: accent, pageBreakInside: 'avoid' as const, fontFamily: fontStack(invoice.font) };

  return (
    <>
      {!printView && validationErrors.length > 0 && (
        <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4">
          <div className="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-4 mb-3" role="alert">
            <h3 className="text-sm font-medium">Validation Errors</h3>
            <div className="mt-3">
              {validationErrors.map((e, i) => (<div key={i} className="mb-3">{e}</div>))}
            </div>
          </div>
        </div>
      )}

      <div
        id="invoice-content"
        ref={ref}
        dir={dir}
        className={`max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10 relative bg-white rounded-lg shadow-sm transition-all pt-10 pb-10 design-${design}`}
        style={rootStyle}
      >
        {design === 'classic' && <Classic invoice={invoice} cols={cols} colTemplate={colTemplate} logoPos={logoPos} />}
        {design === 'bold' && <Bold invoice={invoice} cols={cols} colTemplate={colTemplate} logoPos={logoPos} />}
        {invoice.includeEditLink !== false && (
          <a
            href={sharePath(invoice)}
            className="block -mx-4 sm:-mx-6 lg:-mx-8 -mb-10 mt-1 border-t border-zinc-400 bg-zinc-50 py-1.5 text-center text-[10px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          >
            Click this bar to reopen & edit in RenderInvoice
          </a>
        )}
      </div>
    </>
  );
});

interface RenderProps {
  invoice: InvoiceData;
  cols: string[];
  colTemplate: string;
  logoPos: 'center' | 'left' | 'right';
}

/* CLASSIC */
function Classic({ invoice, cols, colTemplate, logoPos }: RenderProps) {
  const logoAlign = logoPos === 'left' ? 'text-left' : logoPos === 'right' ? 'text-right' : 'text-center';
  return (
    <>
      {(invoice.cancelledNotes || invoice.isCancelled) && (
        <div data-section="disclaimer" className="absolute top-0 right-0 bg-red-500 text-white py-2 px-4 text-sm font-semibold">Cancelled</div>
      )}
      {invoice.logoUrl && (
        <div className="gap-3 mb-3">
          <div className={logoAlign} data-section="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invoice.logoUrl} alt="Company Logo" className="inline-block mb-3"
              style={invoice.logoSize ? { width: invoice.logoSize.width, height: invoice.logoSize.height } : undefined} />
          </div>
          <div className={`${logoAlign} mb-3`} data-section="heading">
            {invoice.invoiceHeading && <Md as="h2" className="text-2xl font-bold text-gray-800 mb-3">{invoice.invoiceHeading}</Md>}
            {invoice.invoiceDescription && <Md as="p" className="text-gray-600">{invoice.invoiceDescription}</Md>}
          </div>
        </div>
      )}
      {!invoice.amountsVerifiedHideDisclaimer && <Disclaimer />}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div className="border border-gray-200 p-4 rounded-lg" data-section="from">
          {invoice.invoiceFrom && Object.entries(invoice.invoiceFrom).map(([k, v]) => (
            <p key={k} className="text-sm text-gray-600"><span className="font-medium">{displayKey(k)}:</span> <Md>{v}</Md></p>
          ))}
        </div>
        {invoice.invoiceTo?.map((recipient, i, arr) => (
          <div key={i} data-section="to" className={`border border-gray-200 p-4 rounded-lg ${i === arr.length - 1 && arr.length % 2 === 0 ? 'md:col-span-2' : ''}`}>
            {Object.entries(recipient).map(([k, v]) => (
              <p key={k} className="text-sm text-gray-600"><span className="font-medium">{k}:</span> <Md>{v}</Md></p>
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 mt-5 mb-5" data-section="metaTop"
        style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(invoice.metaTop || {}).length, 5)}, 1fr)` }}>
        {invoice.metaTop && Object.entries(invoice.metaTop).map(([k, v]) => (
          <dl key={k} className="flex flex-col gap-x-3 text-sm">
            <dt className="text-gray-500 font-medium">{k}:</dt>
            <Md as="dd" className="font-normal text-gray-800">{v}</Md>
          </dl>
        ))}
      </div>
      <div className="mt-3 border border-gray-200 p-4 rounded-lg space-y-4 overflow-x-auto" data-section="lineItems">
        <div className="grid gap-2" style={{ gridTemplateColumns: colTemplate }}>
          {cols.map((c, i) => (
            <Md key={`${i}-${c}`} as="div" className={`text-xs font-medium uppercase px-2 ${i === cols.length - 1 ? 'text-end' : 'text-start'}`} style={{ color: 'var(--accent)' }}>{c}</Md>
          ))}
        </div>
        <div className="hidden sm:block border-b border-gray-200" />
        {invoice.lineItems?.map((item, ri) => (
          <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: colTemplate }}>
            {cols.map((c, i) => {
              const value = (item as any)[c];
              const isLast = i === cols.length - 1;
              return (
                <div key={`${i}-${c}`} className={`px-2 ${isLast ? 'text-end' : 'text-start'} overflow-hidden`}>
                  <Md as="h5" className="sm:hidden text-xs font-medium text-gray-500 uppercase">{c}</Md>
                  {typeof value === 'object' && value !== null ? (
                    Object.entries(value).map(([k, val]) => (
                      <p key={k} className="text-sm text-gray-600">
                        <span className="font-semibold">{displayKey(k)}</span>: <Md className="font-normal">{String(val)}</Md>
                      </p>
                    ))
                  ) : (
                    <Md as="p" className={`text-gray-800 ${isLast ? 'sm:text-end' : ''}`}>{value}</Md>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex sm:justify-end" data-section="summary">
        <div className="w-full max-w-2xl sm:text-end space-y-2">
          <div className="grid grid-cols-2 p-4 sm:grid-cols-1 gap-3 sm:gap-2">
            {invoice.summary?.map((item, i) => {
              const isLast = i === (invoice.summary?.length || 0) - 1;
              return (
                <dl key={i} className={`grid sm:grid-cols-5 gap-x-3 text-sm ${isLast ? 'pt-2 border-t' : ''}`} style={isLast ? { borderColor: 'var(--accent)' } : undefined}>
                  <Md as="dt" className={`col-span-3 ${isLast ? 'font-semibold' : 'text-gray-500'}`}>{`${item.label}:`}</Md>
                  <Md as="dd" className={`col-span-2 font-medium ${isLast ? 'font-bold' : 'text-gray-800'}`} style={isLast ? { color: 'var(--accent)' } : undefined}>{item.value}</Md>
                </dl>
              );
            })}
          </div>
        </div>
      </div>
      {invoice.metaBottom && Object.entries(invoice.metaBottom).length > 0 && (
        <div className="grid gap-3 mt-5 mb-5" data-section="metaBottom"
          style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(invoice.metaBottom).length, 5)}, 1fr)` }}>
          {Object.entries(invoice.metaBottom).map(([k, v]) => (
            <dl key={k} className="flex flex-col gap-x-3 text-sm">
              <dt className="text-gray-500 font-medium">{k}:</dt>
              <Md as="dd" className="font-normal text-gray-800">{v}</Md>
            </dl>
          ))}
        </div>
      )}
      {invoice.digitalSignatureUrl && (
        <div className="mt-3 mb-3" data-section="signature">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={invoice.digitalSignatureUrl} alt="Digital Signature" width={invoice.signatureSize?.width || 200} height={invoice.signatureSize?.height || undefined} />
        </div>
      )}
      {(invoice.footerText?.topText || invoice.footerText?.bottomText) && (
        <div data-section="footer">
          {invoice.footerText?.topText && <div className="mt-3 sm:mt-16"><Md as="h4" className="text-lg font-semibold text-gray-800">{invoice.footerText.topText}</Md></div>}
          {invoice.footerText?.bottomText && <Md as="p" className="text-gray-500">{invoice.footerText.bottomText}</Md>}
        </div>
      )}
      {invoice.invoiceFrom?.Email && <div className="mt-3" data-section="from"><Md as="p" className="block text-sm font-medium text-gray-800">{invoice.invoiceFrom.Email}</Md></div>}
      {invoice.cancelledNotes && <Md as="div" data-section="cancelled" className="bg-red-500 text-white py-2 px-4 text-sm font-semibold">{invoice.cancelledNotes}</Md>}
      <div className="mt-8" data-section="from"><p className="text-sm text-gray-500">{copyright(invoice)}</p></div>
      {invoice.showBuiltWith && <BuiltWith />}
      {!invoice.amountsVerifiedHideDisclaimer && <Disclaimer />}
    </>
  );
}

/* BOLD */
function Bold({ invoice, cols, colTemplate, logoPos }: RenderProps) {
  const invNum = invoice.metaTop?.['Invoice Number'] || invoice.metaTop?.['Number'] || '';
  const logoAlign = logoPos === 'right' ? 'flex-row-reverse' : '';
  return (
    <>
      {(invoice.cancelledNotes || invoice.isCancelled) && (
        <div data-section="disclaimer" className="absolute top-0 right-0 bg-red-500 text-white py-2 px-4 text-sm font-semibold z-10">Cancelled</div>
      )}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-10 px-8 py-10 text-white mb-8 rounded-t-lg" style={{ background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))' }} data-section="heading">
        <div className={`flex items-start gap-6 ${logoAlign}`}>
          {invoice.logoUrl && (
            <div data-section="logo" className="bg-white rounded-md p-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={invoice.logoUrl} alt="Logo" style={invoice.logoSize ? { width: invoice.logoSize.width, height: invoice.logoSize.height } : { height: 36 }} />
            </div>
          )}
          <div className={`flex-1 ${logoAlign ? 'text-right' : ''}`}>
            <div className="text-xs font-semibold tracking-widest uppercase opacity-80">{invoice.invoiceHeading || 'Invoice'}</div>
            {invNum && <div className="mt-1 text-4xl font-extrabold tracking-tight">{invNum}</div>}
            {invoice.invoiceDescription && <Md as="p" className="mt-2 text-white/80">{invoice.invoiceDescription}</Md>}
          </div>
        </div>
      </div>
      {!invoice.amountsVerifiedHideDisclaimer && <Disclaimer />}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div data-section="from">
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>From</div>
          {invoice.invoiceFrom && Object.entries(invoice.invoiceFrom).map(([k, v]) => (
            <p key={k} className="text-sm text-zinc-700"><span className="text-zinc-500">{displayKey(k)}:</span> <Md>{v}</Md></p>
          ))}
        </div>
        <div className="space-y-4">
          {invoice.invoiceTo?.map((recipient, i) => (
            <div key={i} data-section="to">
              <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>{Object.keys(recipient)[0]?.includes('Ship') ? 'Ship to' : 'Bill to'}</div>
              {Object.entries(recipient).map(([k, v]) => (
                <p key={k} className="text-sm text-zinc-700"><span className="text-zinc-500">{k}:</span> <Md>{v}</Md></p>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 mt-5 mb-5 p-4 rounded-lg" data-section="metaTop"
        style={{ gridTemplateColumns: `repeat(${Math.min(Object.keys(invoice.metaTop || {}).length, 5)}, 1fr)`, backgroundColor: 'color-mix(in srgb, var(--accent) 8%, white)' }}>
        {invoice.metaTop && Object.entries(invoice.metaTop).map(([k, v]) => (
          <dl key={k} className="flex flex-col gap-x-3 text-sm">
            <dt className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">{k}</dt>
            <Md as="dd" className="font-semibold text-zinc-900">{v}</Md>
          </dl>
        ))}
      </div>
      <div className="mt-3 rounded-lg overflow-hidden border border-zinc-200 overflow-x-auto" data-section="lineItems">
        <div className="grid gap-2 px-4 py-3 text-white" style={{ gridTemplateColumns: colTemplate, backgroundColor: 'var(--accent)' }}>
          {cols.map((c, i) => (
            <Md key={`${i}-${c}`} as="div" className={`text-xs font-semibold tracking-wider uppercase ${i === cols.length - 1 ? 'text-end' : 'text-start'}`}>{c}</Md>
          ))}
        </div>
        {invoice.lineItems?.map((item, ri) => (
          <div key={ri} className={`grid gap-2 px-4 py-3 ${ri % 2 ? 'bg-zinc-50/50' : ''}`} style={{ gridTemplateColumns: colTemplate }}>
            {cols.map((c, i) => {
              const value = (item as any)[c];
              const isLast = i === cols.length - 1;
              return (
                <div key={`${i}-${c}`} className={`${isLast ? 'text-end' : 'text-start'}`}>
                  {typeof value === 'object' && value !== null ? (
                    Object.entries(value).map(([k, val]) => (
                      <p key={k} className="text-sm text-zinc-600"><span className="font-semibold">{displayKey(k)}</span>: <Md className="font-normal">{String(val)}</Md></p>
                    ))
                  ) : (
                    <Md as="p" className={`text-sm text-zinc-800 ${isLast ? 'font-semibold' : ''}`}>{value}</Md>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end" data-section="summary">
        <div className="w-full max-w-sm rounded-lg overflow-hidden border border-zinc-200">
          {invoice.summary?.map((item, i) => {
            const isLast = i === (invoice.summary?.length || 0) - 1;
            return (
              <div key={i} className={`flex justify-between px-4 py-2.5 ${isLast ? 'text-white' : i % 2 ? 'bg-zinc-50/50' : 'bg-white'}`} style={isLast ? { backgroundColor: 'var(--accent)' } : undefined}>
                <Md className={`text-sm ${isLast ? 'font-bold' : 'text-zinc-600'}`}>{item.label}</Md>
                <Md className={`text-sm ${isLast ? 'font-bold text-lg' : 'text-zinc-900 font-medium'}`}>{item.value}</Md>
              </div>
            );
          })}
        </div>
      </div>
      {invoice.metaBottom && Object.entries(invoice.metaBottom).length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4" data-section="metaBottom">
          {Object.entries(invoice.metaBottom).map(([k, v]) => (
            <div key={k} className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="text-xs font-semibold tracking-wider uppercase text-zinc-500 mb-1">{k}</div>
              <Md className="text-zinc-700 text-sm">{v}</Md>
            </div>
          ))}
        </div>
      )}
      {invoice.digitalSignatureUrl && (
        <div className="mt-8" data-section="signature">
          <div className="text-xs text-zinc-500 mb-2">Signed</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={invoice.digitalSignatureUrl} alt="Signature" width={invoice.signatureSize?.width || 180} height={invoice.signatureSize?.height || undefined} />
        </div>
      )}
      {(invoice.footerText?.topText || invoice.footerText?.bottomText) && (
        <div className="mt-10 pt-6 border-t border-zinc-200" data-section="footer">
          {invoice.footerText?.topText && <Md as="p" className="text-zinc-800 font-semibold">{invoice.footerText.topText}</Md>}
          {invoice.footerText?.bottomText && <Md as="p" className="text-zinc-500 text-sm mt-1">{invoice.footerText.bottomText}</Md>}
        </div>
      )}
      {invoice.cancelledNotes && <Md as="div" data-section="cancelled" className="mt-4 bg-red-50 border border-red-200 text-red-700 py-2 px-3 text-sm">{invoice.cancelledNotes}</Md>}
      <p className="mt-8 text-xs text-zinc-500" data-section="from">{copyright(invoice)}</p>
      {invoice.showBuiltWith && <BuiltWith />}
    </>
  );
}

function BuiltWith() {
  return (
    <p className="mt-2 text-[11px] text-zinc-400">
      Built with{' '}
      <a
        href="https://renderinvoice.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-zinc-600"
      >RenderInvoice</a>
      {' '}· un-opinionated invoice generator
    </p>
  );
}

export default Invoice;
