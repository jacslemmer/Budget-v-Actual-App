import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'CashFlow Manager API',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
