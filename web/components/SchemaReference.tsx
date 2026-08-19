'use client';

import { invoiceSchemaFields, type SchemaField } from '@/lib/schemaFields';

function FieldRow({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  return (
    <div className={depth === 0 ? 'pl-0' : 'pl-5 border-l border-zinc-200 ml-2'}>
      <div className="py-2">
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 font-mono text-sm">
          <span className="font-semibold text-zinc-900">{field.key}</span>
          <span className="text-blue-700">{field.type}</span>
          {field.optional && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-sans">Optional</span>}
          {field.defaultValue !== undefined && (
            <span className="text-xs text-zinc-500 font-sans">default: <code className="bg-zinc-100 px-1 rounded">{field.defaultValue}</code></span>
          )}
        </div>
        {field.description && <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{field.description}</p>}
      </div>
      {field.children && field.children.length > 0 && (
        <div className="mb-2">
          {field.children.map((c) => <FieldRow key={c.key} field={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function SchemaReference() {
  const fields = invoiceSchemaFields();
  return (
    <div className="space-y-1 divide-y divide-zinc-100">
      {fields.map((f) => (<FieldRow key={f.key} field={f} />))}
    </div>
  );
}
