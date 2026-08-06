import { Resend } from 'resend';

// Lazily create the Resend client so importing this module (e.g. during
// `next build`'s page-data collection phase, where env vars are absent)
// doesn't throw. The actual `.emails.send` call will fail clearly at runtime
// if the key is missing.
let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
  }
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

// Backwards-compatible `resend` export for code already written against the
// single-instance client. Calls `.emails.send` lazily through a Proxy so
// importing the module is always safe.
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
