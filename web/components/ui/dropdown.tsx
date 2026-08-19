'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'end', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          onClick={(e) => {
            const t = e.target as HTMLElement;
            // Close when clicking a menu item (but not headers/inputs)
            if (t.closest('[data-menu-item]')) setOpen(false);
          }}
          className={cn(
            'absolute mt-1.5 min-w-[240px] rounded-lg bg-white text-zinc-900 shadow-xl ring-1 ring-black/5 border border-zinc-200 py-1 z-50 animate-in-up',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  onClick,
  icon,
  shortcut,
  children,
  danger,
  disabled,
}: {
  onClick?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-menu-item
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
    >
      {icon && <span className="text-zinc-400">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <kbd className="text-[10px] font-mono text-zinc-400">{shortcut}</kbd>}
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{children}</div>;
}

export function MenuSeparator() {
  return <div className="h-px bg-zinc-100 my-1" />;
}
