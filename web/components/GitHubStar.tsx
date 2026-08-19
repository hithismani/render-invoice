'use client';

import { useEffect, useState } from 'react';
import { REPO } from '@/lib/repo';
import { IGithub, IStar } from './Icons';
import { cn } from '@/lib/cn';

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function GitHubStar({
  className,
  compact = false,
  dark = false,
}: {
  className?: string;
  compact?: boolean;
  dark?: boolean;
}) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && typeof d?.stargazers_count === 'number') setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const tone = dark
    ? 'text-zinc-300 hover:text-white hover:bg-white/5 border-white/10'
    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 border-zinc-200';

  return (
    <a
      href={REPO.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star RenderInvoice on GitHub"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors',
        compact ? 'h-8 px-2' : 'h-8 px-2.5',
        tone,
        className,
      )}
    >
      {compact ? <IGithub className="size-3.5" /> : <IStar className="size-3.5" />}
      {!compact && <span className="hidden sm:inline">Star</span>}
      {stars !== null && (
        <span className={cn('tabular-nums', dark ? 'text-zinc-400' : 'text-zinc-500')}>
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
