import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance
// Cloudflare Workers doesn't support global variables like Node.js
export const prisma = new PrismaClient({
  log: ['error'],
});
