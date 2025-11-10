/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  // Database
  DB: D1Database;

  // KV for rate limiting
  KV: KVNamespace;

  // Secrets
  CLAUDE_API_KEY: string;
  ENCRYPTION_KEY: string;
  NODE_ENV: 'development' | 'production';
}
