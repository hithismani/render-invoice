import { get, set, del } from 'idb-keyval';
import type { Invoice } from '@/schema/invoiceSchema';

/**
 * Drafts + invoice-number counter stored in IndexedDB.
 * Mirrors lib/storage.ts design: LS → IDB one-time migration, persist() opt-in.
 */

const DRAFT_KEY = 'renderinvoice.draft.v1';
const NUM_KEY = 'renderinvoice.invoicenum.v1';

interface DraftEntry {
  invoice: Invoice;
  at: number;
}

export type SaveStatus = { ok: true } | { ok: false; error: string };

let draftMigrated = false;
let numMigrated = false;

export function isStorageSupported(): boolean {
  try {
    return typeof window !== 'undefined'
      && typeof window.indexedDB !== 'undefined'
      && window.indexedDB !== null;
  } catch {
    return false;
  }
}

async function requestPersistence(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    /* best-effort */
  }
}

async function migrateDraft(): Promise<void> {
  if (draftMigrated || typeof window === 'undefined') return;
  draftMigrated = true;
  try {
    const existing = await get<DraftEntry>(DRAFT_KEY);
    if (existing) return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    await set(DRAFT_KEY, JSON.parse(raw));
  } catch {
    /* ignore */
  }
}

async function migrateNum(): Promise<void> {
  if (numMigrated || typeof window === 'undefined') return;
  numMigrated = true;
  try {
    const existing = await get<number>(NUM_KEY);
    if (typeof existing === 'number') return;
    const raw = window.localStorage.getItem(NUM_KEY);
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) await set(NUM_KEY, n);
  } catch {
    /* ignore */
  }
}

export async function saveDraft(invoice: Invoice): Promise<SaveStatus> {
  if (!isStorageSupported()) return { ok: false, error: 'IndexedDB unavailable in this browser' };
  try {
    await set(DRAFT_KEY, { invoice, at: Date.now() } satisfies DraftEntry);
    void requestPersistence();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof DOMException && e.name === 'QuotaExceededError'
      ? 'Storage quota exceeded: delete unused templates or large logos'
      : e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function loadDraft(): Promise<DraftEntry | null> {
  if (!isStorageSupported()) return null;
  try {
    await migrateDraft();
    return (await get<DraftEntry>(DRAFT_KEY)) || null;
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await del(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export async function nextInvoiceNumber(prefix = 'INV'): Promise<string> {
  await migrateNum();
  const cur = (await get<number>(NUM_KEY)) || 0;
  const next = cur + 1;
  try {
    await set(NUM_KEY, next);
    void requestPersistence();
  } catch {
    /* ignore - still return the incremented number so UX works */
  }
  return `${prefix}-${String(next).padStart(4, '0')}`;
}
