'use client';

import Link from 'next/link';
import { Dropdown } from './ui/dropdown';
import { IChevronDown } from './Icons';

const items = [
  { href: '/developers#worker', label: 'PDF worker', hint: 'Free · selectable text' },
  { href: '/developers#sheets', label: 'Google Sheets', hint: 'HYPERLINK, no backend' },
  { href: '/developers#share', label: 'Share URLs', hint: '#j= JSON in the hash' },
  { href: '/developers#schema', label: 'Invoice schema', hint: 'JSON contract' },
  { href: '/developers#warranty', label: 'Disclaimer', hint: 'As-is · no warranties' },
  { href: '/llms.txt', label: 'llms.txt', hint: 'Agent manifest' },
];

export default function ApiNavMenu() {
  return (
    <Dropdown
      align="start"
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-0.5 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          API
          <IChevronDown className="size-3.5 text-zinc-400" />
        </button>
      }
    >
      <Link
        href="/developers"
        data-menu-item
        className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      >
        API overview
      </Link>
      <div className="h-px bg-zinc-100 my-1" />
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-menu-item
          className="block px-3 py-2 hover:bg-zinc-100"
        >
          <div className="text-sm text-zinc-800">{item.label}</div>
          <div className="text-[11px] text-zinc-400">{item.hint}</div>
        </Link>
      ))}
    </Dropdown>
  );
}
