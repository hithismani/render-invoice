import Link from 'next/link';
import { REPO } from '@/lib/repo';
import GitHubStar from './GitHubStar';
import { IGithub } from './Icons';

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold tracking-tight mb-2">RenderInvoice</div>
           <p className="text-zinc-500 leading-relaxed">Un-opinionated invoices. Selectable PDFs. Zero backend.</p>
          <p className="mt-2 text-zinc-500">
            A{' '}
            <a href="https://businessaddons.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 underline underline-offset-2">
              BusinessAddons
            </a>{' '}
            product.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <GitHubStar />
            <a
              href={REPO.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RenderInvoice on GitHub"
              className="inline-flex items-center justify-center size-8 rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <IGithub className="size-4" />
            </a>
          </div>
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
          <div className="font-medium text-zinc-900 mb-2">API</div>
          <ul className="space-y-1.5 text-zinc-500">
            <li><Link href="/developers" className="hover:text-zinc-900">Overview</Link></li>
            <li><Link href="/developers#worker" className="hover:text-zinc-900">PDF worker · free</Link></li>
            <li><a href="/llms.txt" className="hover:text-zinc-900">llms.txt</a></li>
            <li>
              <a href={REPO.url} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 inline-flex items-center gap-1.5">
                <IGithub className="size-3.5" /> GitHub
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-zinc-900 mb-2">Company</div>
          <ul className="space-y-1.5 text-zinc-500">
            <li><Link href="/about" className="hover:text-zinc-900">About</Link></li>
            <li><Link href="/pricing" className="hover:text-zinc-900">Pricing</Link></li>
            <li><Link href="/licenses" className="hover:text-zinc-900">Licenses</Link></li>
            <li>
              <a href="https://businessaddons.com/disclaimers/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
                Privacy policy
              </a>
            </li>
            <li>
              <a href="https://businessaddons.com/disclaimers/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
                Terms of service
              </a>
            </li>
            <li>
              <a href={REPO.issues} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 inline-flex items-center gap-1.5">
                <IGithub className="size-3.5" /> Issues
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-zinc-500 flex justify-between flex-wrap gap-2 items-center">
          <span>
            © {new Date().getFullYear()} RenderInvoice ·{' '}
            <a href="https://businessaddons.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
              BusinessAddons
            </a>
          </span>
          <a
            href={REPO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 inline-flex items-center gap-1.5"
          >
            <IGithub className="size-3.5" />
            {REPO.owner}/{REPO.name}
          </a>
        </div>
      </div>
    </footer>
  );
}
