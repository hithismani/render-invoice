import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const variants = {
  default: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
  primary: 'bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 shadow-sm shadow-blue-600/20',
  secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm',
  ghost: 'bg-transparent text-zinc-900 hover:bg-zinc-100',
  outline: 'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50',
  invert: 'bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
  icon: 'h-9 w-9 rounded-md',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export function ButtonLink({
  href,
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
