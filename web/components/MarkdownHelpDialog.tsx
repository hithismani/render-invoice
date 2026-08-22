'use client';

import { useEffect } from 'react';
import {
  MARKDOWN_FIELDS,
  MARKDOWN_GLYPHS,
  MARKDOWN_GROUP_LABELS,
  MARKDOWN_NOT_SUPPORTED,
  MARKDOWN_TAGS,
  type MarkdownTagRow,
} from '@/lib/markdownHelp';

const GROUPS: MarkdownTagRow['group'][] = ['inline', 'size', 'block', 'keys'];

export default function MarkdownHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="md-help-title"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                <MdMarkIcon className="size-4" />
              </span>
              <h3 id="md-help-title" className="text-lg font-bold tracking-tight text-zinc-900">
                Markdown cheat sheet
              </h3>
            </div>
            <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
              Every text field accepts these tags - heading, description, from/to, meta, columns, cells,
              summary, footer, and cancelled notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-zinc-400 hover:text-zinc-900 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Close"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Where it applies</div>
            <p className="text-sm text-zinc-600 leading-relaxed">{MARKDOWN_FIELDS}.</p>
          </div>

          {GROUPS.map((g) => {
            const rows = MARKDOWN_TAGS.filter((t) => t.group === g);
            return (
              <section key={g}>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  {MARKDOWN_GROUP_LABELS[g]}
                </h4>
                <div className="rounded-xl border border-zinc-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-zinc-100">
                      {rows.map((row) => (
                        <tr key={row.tag} className="align-top">
                          <td className="px-3 py-2.5 w-[42%] font-mono text-[12px] text-zinc-800 bg-zinc-50/50 whitespace-pre-wrap break-words">
                            {row.tag}
                          </td>
                          <td className="px-3 py-2.5 text-zinc-600 leading-snug">{row.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70 mb-1">Not supported</div>
              <p className="text-sm text-amber-900/80 leading-relaxed">{MARKDOWN_NOT_SUPPORTED}.</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Glyphs (plain text)</div>
              <p className="text-sm text-zinc-600 font-mono tracking-wide">{MARKDOWN_GLYPHS}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/** Compact control: markdown mark + ? - opens the cheat sheet. */
export function MarkdownHelpButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title="Markdown help"
      aria-label="Open markdown help"
      className={`inline-flex items-center justify-center size-6 rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm transition-colors ${className}`}
    >
      <span className="relative inline-flex items-center justify-center">
        <MdMarkIcon className="size-3.5" />
        <span className="absolute -top-1.5 -right-1.5 flex size-2.5 items-center justify-center rounded-full bg-zinc-800 text-[7px] font-bold leading-none text-white">
          ?
        </span>
      </span>
    </button>
  );
}

function MdMarkIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 5h18v14H3z" />
      <path d="M7 15V9l2.5 3L12 9v6" />
      <path d="M15 12h2a1.5 1.5 0 0 0 0-3h-2v6" />
    </svg>
  );
}
