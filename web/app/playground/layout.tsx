import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Playground',
  description: 'Create and export a PDF invoice in the browser. Form or JSON editor, live preview, no account.',
  robots: { index: false, follow: false },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
