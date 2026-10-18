import authWorker from './sveltia-cms-auth.js';

const publicOrigin = 'https://0x4rc4n3.vercel.app';

/**
 * Adapt the Sveltia OAuth Worker interface to a Vercel Node.js function.
 * @param {'auth' | 'callback'} action OAuth route handled by Sveltia.
 * @returns {(request: object, response: object) => Promise<void>} Vercel handler.
 */
export function createCmsAuthHandler(action) {
  if (!['auth', 'callback'].includes(action)) {
    throw new TypeError('Unsupported CMS OAuth action.');
  }

  return async function cmsAuthHandler(request, response) {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      response.status(405).end();
      return;
    }

    try {
      const url = new URL(request.url || '/', publicOrigin);
      url.pathname = `/${action}`;

      const headers = new Headers();
      if (typeof request.headers.cookie === 'string') {
        headers.set('cookie', request.headers.cookie);
      }

      const oauthRequest = new Request(url, { method: 'GET', headers });
      const env = {
        ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS || '0x4rc4n3.vercel.app',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
        GITHUB_HOSTNAME: 'github.com',
      };
      const oauthResponse = await authWorker.fetch(oauthRequest, env);

      oauthResponse.headers.forEach((value, name) => {
        response.setHeader(name, value);
      });
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.status(oauthResponse.status);
      response.send(Buffer.from(await oauthResponse.arrayBuffer()));
    } catch {
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.status(500).send('CMS authentication service error.');
    }
  };
}
