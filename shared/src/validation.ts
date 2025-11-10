import { z } from 'zod';

/**
 * Zod validation schemas for API requests
 * Based on specification Section 7.3
 */

// Transaction validation
export const TransactionSchema = z.object({
  accountId: z.string().uuid(),
  date: z.string().datetime(),
  amount: z.number().positive().max(1000000),
  type: z.enum(['DEBIT', 'CREDIT']),
  vendor: z.string().min(1).max(255),
  description: z.string().max(500),
  category: z.string().uuid().nullable(),
  notes: z.string().max(1000).nullable().optional(),
});

// Receipt scan request
export const ReceiptScanSchema = z.object({
  image: z.string().regex(/^data:image\/(jpeg|png);base64,/),
  accountId: z.string().uuid(),
});

// Budget update
export const BudgetUpdateSchema = z.object({
  categoryId: z.string().uuid(),
  monthlyBudget: z.number().nonnegative().max(1000000),
  alertThreshold: z.number().min(0).max(1),
});

// Category creation
export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  monthlyBudget: z.number().nonnegative().max(1000000).default(0),
  alertThreshold: z.number().min(0).max(1).default(0.8),
  parentCategoryId: z.string().uuid().nullable().optional(),
});

// Account creation
export const AccountCreateSchema = z.object({
  bankName: z.enum(['FNB', 'NEDBANK']),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD']),
  accountName: z.string().min(1).max(100),
  accountNumber: z.string().min(4).max(4), // Last 4 digits only
  currency: z.string().length(3).default('ZAR'),
});

// Statement import
export const StatementImportSchema = z.object({
  accountId: z.string().uuid(),
  bankType: z.enum(['FNB', 'NEDBANK']),
});
