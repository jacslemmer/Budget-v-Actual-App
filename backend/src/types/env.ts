/**
 * Cloudflare Workers environment bindings
 * Database: Supabase PostgreSQL (accessed via Prisma, not as binding)
 */
export interface Env {
  // KV for rate limiting
  KV?: KVNamespace;

  // Secrets and environment variables
  DATABASE_URL: string;
  DIRECT_URL?: string;
  CLAUDE_API_KEY: string;
  ENCRYPTION_KEY: string;
  NODE_ENV: 'development' | 'production';
}
