export const REPO = {
  owner: 'hithismani',
  name: 'render-invoice',
  url: 'https://github.com/hithismani/render-invoice',
  issues: 'https://github.com/hithismani/render-invoice/issues',
} as const;

const deploy = (path: string) =>
  `https://deploy.workers.cloudflare.com/?url=${REPO.url}/tree/main${path}`;

export const DEPLOY = {
  satori: deploy(''),
  browser: deploy('/cf-worker'),
} as const;
