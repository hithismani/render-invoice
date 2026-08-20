export const REPO = {
  owner: 'hithismani',
  name: 'render-invoice',
  url: 'https://github.com/hithismani/render-invoice',
  issues: 'https://github.com/hithismani/render-invoice/issues',
} as const;

export const WORKER_REPO = {
  owner: 'hithismani',
  name: 'render-invoice-worker',
  url: 'https://github.com/hithismani/render-invoice-worker',
} as const;

export const DEPLOY = {
  worker: `https://deploy.workers.cloudflare.com/?url=${WORKER_REPO.url}/tree/main/cf-worker`,
} as const;
