import * as React from 'react';
import { cn } from '@/lib/cn';

const variants = {
  default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  outline: 'bg-white text-zinc-700 border-zinc-200',
  'outline-dark': 'bg-white/10 text-zinc-200 border-white/15',
  'blue-dark': 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  'green-dark': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
} as const;

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
