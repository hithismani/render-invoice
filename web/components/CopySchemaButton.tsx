'use client';

import { useState } from 'react';
import { dumpSchemaText } from '@/lib/schemaFields';

export default function CopySchemaButton({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`{\n${dumpSchemaText()}\n}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`text-xs font-medium px-2.5 py-1 rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors ${className}`}
    >
      {copied ? 'Copied' : 'Copy schema'}
    </button>
  );
}
