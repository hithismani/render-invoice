import { get, set } from 'idb-keyval';
import type { Invoice } from '@/schema/invoiceSchema';

/**
 * Templates are stored in IndexedDB (via idb-keyval) under a single key.
 * This gives us much larger quota than localStorage (~50% of disk vs ~5MB)
 * and is more durable against browser cache clears.
 *
 * On first access we migrate any existing localStorage data over, then never
 * read from localStorage again.
 */

const KEY = 'renderinvoice.templates.v1';
const LEGACY_LS_KEY = 'renderinvoice.templates.v1';

export interface Template {
  id: string;
  name: string;
  updatedAt: number;
  invoice: Invoice;
}

let migrated = false;

async function requestPersistence(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    /* best-effort */
  }
}

async function migrate(): Promise<void> {
  if (migrated || typeof window === 'undefined') return;
  migrated = true;
  try {
    const existing = await get<Template[]>(KEY);
    if (existing && existing.length > 0) return;
    const raw = window.localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Template[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      await set(KEY, parsed);
      // Don't delete from localStorage — keep as backup.
    }
  } catch {
    /* ignore */
  }
}

async function read(): Promise<Template[]> {
  await migrate();
  return (await get<Template[]>(KEY)) || [];
}

async function write(list: Template[]): Promise<void> {
  await set(KEY, list);
  void requestPersistence();
}

export async function listTemplates(): Promise<Template[]> {
  const list = await read();
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveTemplate(name: string, invoice: Invoice, id?: string): Promise<Template> {
  const list = await read();
  const now = Date.now();
  if (id) {
    const idx = list.findIndex((t) => t.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], name, invoice, updatedAt: now };
      await write(list);
      return list[idx];
    }
  }
  const next: Template = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(now) + Math.random().toString(16).slice(2),
    name,
    invoice,
    updatedAt: now,
  };
  list.push(next);
  await write(list);
  return next;
}

export async function deleteTemplate(id: string): Promise<void> {
  const list = await read();
  await write(list.filter((t) => t.id !== id));
}

export async function exportTemplatesJson(): Promise<string> {
  const list = await read();
  return JSON.stringify(list, null, 2);
}

export async function importTemplatesJson(json: string): Promise<number> {
  const incoming = JSON.parse(json) as Template[];
  if (!Array.isArray(incoming)) throw new Error('Expected an array of templates');
  const current = await read();
  const byId = new Map(current.map((t) => [t.id, t]));
  for (const t of incoming) {
    if (t && t.id && t.invoice) byId.set(t.id, { ...t, updatedAt: t.updatedAt || Date.now() });
  }
  await write([...byId.values()]);
  return incoming.length;
}
