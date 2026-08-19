'use client';

import { useState } from 'react';

export default function CopyPrompt({ prompt, label = 'Copy AI prompt' }: { prompt: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="relative rounded-lg border border-zinc-200 bg-zinc-50/60 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
        <div className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">AI prompt</div>
        <button
          type="button"
          onClick={copy}
          className="text-xs font-medium px-2.5 py-1 rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          {copied ? 'Copied' : label}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap break-words max-h-80 overflow-auto">{prompt}</pre>
    </div>
  );
}
