import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold tracking-tight mb-2">Invoicely</div>
          <p className="text-zinc-500 leading-relaxed">Un-opinionated invoices. Vector PDFs. Zero backend.</p>
        </div>
        <div>
          <div className="font-medium text-zinc-900 mb-2">Product</div>
          <ul className="space-y-1.5 text-zinc-500">
            <li><Link href="/playground" className="hover:text-zinc-900">Playground</Link></li>
            <li><Link href="/examples" className="hover:text-zinc-900">Examples</Link></li>
            <li><Link href="/changelog" className="hover:text-zinc-900">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-zinc-900 mb-2">Developers</div>
          <ul className="space-y-1.5 text-zinc-500">
            <li><Link href="/developers" className="hover:text-zinc-900">API & Docs</Link></li>
            <li><a href="/llms.txt" className="hover:text-zinc-900">llms.txt</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-zinc-900 mb-2">Company</div>
          <ul className="space-y-1.5 text-zinc-500">
            <li><Link href="/about" className="hover:text-zinc-900">About</Link></li>
            <li><Link href="/pricing" className="hover:text-zinc-900">Pricing</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-zinc-500 flex justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Invoicely</span>
          <span>Made entirely in your browser · No signup, no card required</span>
        </div>
      </div>
    </footer>
  );
}
