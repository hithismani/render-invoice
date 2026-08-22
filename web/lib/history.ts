import { get, set } from 'idb-keyval';
import type { Invoice } from '@/schema/invoiceSchema';

/**
 * Rolling history of invoice snapshots. Every meaningful autosave is appended,
 * capped at MAX entries so the store stays lean.
 *
 * Snapshots live in IndexedDB alongside templates + draft. User can restore
 * any past snapshot from the History dialog.
 */

const KEY = 'renderinvoice.history.v1';
const MAX = 20;

export interface HistoryEntry {
  id: string;
  at: number;
  // A label derived from the invoice to help users identify the snapshot.
  label: string;
  invoice: Invoice;
}

function makeLabel(inv: Invoice): string {
  const num = inv.metaTop?.['Invoice Number'];
  const to = inv.invoiceTo?.[0]?.['Bill To'] || inv.invoiceTo?.[0] && Object.values(inv.invoiceTo[0])[0];
  if (num && to) return `${num} · ${to}`;
  if (num) return String(num);
  if (inv.filename) return inv.filename;
  return inv.invoiceHeading || 'Untitled invoice';
}

async function read(): Promise<HistoryEntry[]> {
  return (await get<HistoryEntry[]>(KEY)) || [];
}

async function write(list: HistoryEntry[]): Promise<void> {
  await set(KEY, list);
  try { await navigator.storage?.persist?.(); } catch {}
}

export async function listHistory(): Promise<HistoryEntry[]> {
  const list = await read();
  return [...list].sort((a, b) => b.at - a.at);
}

/**
 * Append a snapshot. De-duped: if the previous snapshot's JSON matches,
 * we don't append (prevents filling history with identical autosaves).
 */
export async function appendHistory(invoice: Invoice): Promise<void> {
  try {
    const list = await read();
    const last = list[list.length - 1];
    const serialized = JSON.stringify(invoice);
    if (last && JSON.stringify(last.invoice) === serialized) return;
    const entry: HistoryEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
      at: Date.now(),
      label: makeLabel(invoice),
      invoice,
    };
    list.push(entry);
    // Keep newest MAX by dropping oldest.
    const trimmed = list.slice(-MAX);
    await write(trimmed);
  } catch {
    /* ignore - history is a nice-to-have */
  }
}

export async function clearHistory(): Promise<void> {
  try { await set(KEY, []); } catch {}
}

/**
 * Look up whether an invoice number was previously used in the history OR
 * the saved templates list. Returns the earliest matching timestamp if found,
 * or null. Used to warn users about invoice-number collisions.
 */
export async function findInvoiceNumberMatch(number: string): Promise<{ at: number; label: string; source: 'history' | 'template' } | null> {
  if (!number) return null;
  try {
    // Check history
    const hist = await read();
    for (const e of hist) {
      if (e.invoice.metaTop?.['Invoice Number'] === number) {
        return { at: e.at, label: e.label, source: 'history' };
      }
    }
    // Check templates (lazy import to avoid cycle)
    const { listTemplates } = await import('./storage');
    const tpls = await listTemplates();
    for (const t of tpls) {
      if (t.invoice.metaTop?.['Invoice Number'] === number) {
        return { at: t.updatedAt, label: t.name, source: 'template' };
      }
    }
    return null;
  } catch {
    return null;
  }
}
