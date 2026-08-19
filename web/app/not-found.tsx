import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteNav />
      <main className="flex-1 grid place-items-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="text-7xl font-extrabold gradient-text tracking-tight">404</div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found.</h1>
          <p className="mt-2 text-zinc-600">The page you&rsquo;re looking for doesn&rsquo;t exist or was moved.</p>
          <div className="mt-8 flex gap-3 justify-center">
            <ButtonLink href="/" variant="default">Back home</ButtonLink>
            <ButtonLink href="/examples" variant="secondary">Browse examples</ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
