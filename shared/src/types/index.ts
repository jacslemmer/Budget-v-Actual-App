/**
 * Shared types between frontend and backend
 * These match the Prisma schema but are serializable for API responses
 */

export type Role = 'OWNER' | 'PARTNER';

export type BankName = 'FNB' | 'NEDBANK';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD';

export type TransactionType = 'DEBIT' | 'CREDIT';

export type TransactionSource = 'STATEMENT' | 'POS_SCAN' | 'MANUAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  householdId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  bankName: BankName;
  accountType: AccountType;
  accountName: string;
  accountNumber: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  date: string;
  amount: number;
  type: TransactionType;
  vendor: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  source: TransactionSource;
  isRecurring: boolean;
  recurringGroupId: string | null;
  notes: string | null;
  confidence: number;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  alertThreshold: number;
  parentCategoryId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRule {
  id: string;
  userId: string;
  vendorPattern: string;
  descriptionPattern: string | null;
  categoryId: string;
  confidence: number;
  matchCount: number;
  lastMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPeriod {
  id: string;
  userId: string;
  year: number;
  month: number;
  categoryId: string;
  budgetAmount: number;
  actualSpend: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  actualSpend: number;
  remaining: number;
  percentUsed: number;
  alertLevel: 'ok' | 'warning' | 'critical' | 'exceeded';
  daysRemaining: number;
}

export interface ReceiptData {
  vendor: string;
  amount: number;
  date: string;
  items?: string[];
  suggestedCategory?: string;
  confidence: 'high' | 'medium' | 'low';
  unclear_fields: string[];
}

export interface ReceiptScanResponse {
  success?: boolean;
  needsVerification?: boolean;
  needsConfirmation?: boolean;
  data: ReceiptData;
  transaction?: Transaction;
  duplicate?: Transaction;
  budgetUpdate?: BudgetStatus;
  image?: string;
  message?: string;
}

export interface StatementImportSummary {
  totalTransactions: number;
  dateRange: {
    start: string;
    end: string;
  };
  autoCategorized: number;
  needsReview: number;
  duplicatesSkipped: number;
}

export interface CategorySuggestion {
  categoryId: string;
  confidence: number;
  reason: string;
}
