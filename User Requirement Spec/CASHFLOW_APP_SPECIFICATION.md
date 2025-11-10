# CashFlow Manager - Product Specification Document

**Version:** 1.0  
**Date:** November 10, 2025  
**Target Market:** South Africa (FNB & Nedbank customers)  
**Primary Users:** Personal/household finance management

---

## 1. PROJECT OVERVIEW

### 1.1 Purpose
A secure web application for comprehensive cashflow management that enables real-time budget tracking through automated bank statement processing and point-of-sale receipt scanning with AI-powered categorization.

### 1.2 Core Value Proposition
- **Automated categorization**: AI learns from user corrections to intelligently sort expenses
- **Real-time budget awareness**: Know spending status before month-end bank statements
- **Multi-account support**: Unified view across personal and spouse accounts
- **Receipt scanning**: Update budgets instantly at point of sale
- **Smart duplicate detection**: Prevent double-counting of scanned receipts vs. statement imports

### 1.3 Success Criteria
- Process FNB and Nedbank statements with >95% accuracy
- Categorize receipts with >70% accuracy (Phase 1)
- Real-time budget updates within 5 seconds of receipt scan
- Zero security incidents
- User can complete full budget review in <5 minutes/week

---

## 2. TECHNICAL STACK

### 2.1 Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS (utility-first)
- **Build Tool**: Vite
- **State Management**: React Context + hooks (functional approach)
- **PWA**: Manifest + optional Service Worker (Phase 1A)
- **Testing**: Vitest + React Testing Library

### 2.2 Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Hono (lightweight, Cloudflare-optimized)
- **API Style**: RESTful JSON
- **Validation**: Zod schemas
- **Testing**: Vitest

### 2.3 Database
- **Development/UAT**: SQLite or PostgreSQL (Supabase/Neon free tier)
- **Production**: Cloudflare D1 (SQLite at edge)
- **ORM**: Prisma (multi-database portability)
- **Migration Strategy**: Prisma Migrate

### 2.4 Deployment
- **Hosting**: Cloudflare Pages (frontend) + Workers (backend)
- **CDN**: Cloudflare (automatic)
- **SSL**: Cloudflare (automatic)
- **Domain**: TBD (Cloudflare DNS)

### 2.5 External Services
- **AI Vision**: Anthropic Claude API (Sonnet 4.5) for receipt OCR and categorization
- **Authentication**: Cloudflare Access or Auth0 (TBD Phase 1A)
- **Version Control**: GitHub

### 2.6 Development Environment
- **Machine**: Mac Mini M4
- **IDE**: VS Code (assumed)
- **Package Manager**: npm or pnpm
- **Node Version**: Latest LTS (v20+)

---

## 3. ARCHITECTURAL PRINCIPLES

### 3.1 Development Philosophy
- **Functional programming**: Pure functions, immutability where possible
- **Test-Driven Development**: Pragmatic TDD - write tests for critical paths, not everything
- **Security-first**: Validate all inputs, encrypt sensitive data, assume breach mentality
- **No trial-and-error coding**: Research → Design → Plan → Develop → Test → Deploy
- **Clean code**: Readable, maintainable, well-documented
- **Database portability**: Abstract DB access behind repositories

### 3.2 Code Quality Standards
- **TypeScript strict mode**: No `any` types without explicit justification
- **Functional style**: Prefer `map/filter/reduce` over imperative loops
- **Error handling**: Explicit error types, never silent failures
- **Naming**: Descriptive, self-documenting names
- **Comments**: Explain "why", not "what"
- **File structure**: Feature-based, not technology-based

### 3.3 Security Requirements
- **Input validation**: All user inputs validated server-side with Zod
- **SQL injection prevention**: Use parameterized queries only (Prisma handles this)
- **XSS prevention**: Sanitize all rendered user content
- **CSRF protection**: Token-based for state-changing operations
- **Rate limiting**: Prevent abuse (Cloudflare Workers KV for tracking)
- **Audit logging**: Log all financial transactions, categorizations, imports
- **Data encryption**: Encrypt transaction descriptions and notes at rest
- **Session management**: Short timeouts (30 min), secure cookies
- **File upload security**: Validate file types, scan for malware, size limits
- **HTTPS only**: Enforce via Cloudflare
- **Code review**: Check all AI-suggested code for injection vectors before use

---

## 4. DATA MODEL

### 4.1 Core Entities

#### Transaction
```typescript
interface Transaction {
  id: string; // UUID
  userId: string; // Owner of the transaction
  accountId: string; // Which bank account
  date: Date; // Transaction date
  amount: number; // Decimal(10,2) - always positive, use type for debit/credit
  type: 'debit' | 'credit';
  vendor: string; // Extracted from statement or receipt
  description: string; // Original bank description (encrypted)
  category: string | null; // User-assigned or AI-suggested
  subcategory: string | null; // Optional deeper classification
  source: 'statement' | 'pos_scan'; // How transaction was added
  isRecurring: boolean; // Detected pattern flag
  recurringGroupId: string | null; // Links recurring transactions
  notes: string | null; // User notes (encrypted)
  confidence: number; // 0-1: AI confidence in categorization
  verifiedAt: Date | null; // When user confirmed/corrected
  createdAt: Date;
  updatedAt: Date;
}
```

#### Account
```typescript
interface Account {
  id: string;
  userId: string; // Owner
  bankName: 'FNB' | 'Nedbank';
  accountType: 'checking' | 'savings' | 'credit_card';
  accountName: string; // User-defined: "John FNB Cheque", "Sarah Nedbank"
  accountNumber: string; // Last 4 digits only (encrypted)
  currency: string; // 'ZAR'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category
```typescript
interface Category {
  id: string;
  userId: string; // User-specific categories
  name: string; // "Groceries", "Transport", "Entertainment"
  icon: string; // Emoji or icon identifier
  color: string; // Hex color for UI
  monthlyBudget: number; // Decimal(10,2)
  alertThreshold: number; // 0-1: e.g., 0.8 = warn at 80%
  parentCategoryId: string | null; // For subcategories
  order: number; // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### LearningRule
```typescript
interface LearningRule {
  id: string;
  userId: string;
  vendorPattern: string; // Regex or simple string match
  descriptionPattern: string | null; // Optional description pattern
  categoryId: string;
  confidence: number; // 0-1: Increases with successful matches
  matchCount: number; // How many times successfully applied
  lastMatchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### BudgetPeriod
```typescript
interface BudgetPeriod {
  id: string;
  userId: string;
  year: number;
  month: number; // 1-12
  categoryId: string;
  budgetAmount: number;
  actualSpend: number; // Calculated from transactions
  startDate: Date; // First day of month
  endDate: Date; // Last day of month
  createdAt: Date;
  updatedAt: Date;
}
```

#### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string; // 'import_statement', 'scan_receipt', 'categorize', 'edit_budget'
  entityType: string; // 'transaction', 'category', 'account'
  entityId: string;
  metadata: object; // JSON: details about the action
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### 4.2 Default Categories (Seed Data)
```typescript
const DEFAULT_CATEGORIES = [
  { name: 'Groceries', icon: '🛒', color: '#10b981', budget: 6000 },
  { name: 'Transport', icon: '🚗', color: '#3b82f6', budget: 3000 },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', budget: 1500 },
  { name: 'Dining Out', icon: '🍽️', color: '#f59e0b', budget: 2000 },
  { name: 'Utilities', icon: '💡', color: '#6366f1', budget: 2500 },
  { name: 'Health & Medical', icon: '⚕️', color: '#ec4899', budget: 1000 },
  { name: 'Shopping', icon: '🛍️', color: '#14b8a6', budget: 2000 },
  { name: 'Insurance', icon: '🛡️', color: '#0ea5e9', budget: 3000 },
  { name: 'Education', icon: '📚', color: '#a855f7', budget: 1000 },
  { name: 'Personal Care', icon: '💅', color: '#f97316', budget: 800 },
  { name: 'Savings', icon: '💰', color: '#22c55e', budget: 0 },
  { name: 'Uncategorized', icon: '❓', color: '#64748b', budget: 0 }
];
```

---

## 5. FEATURE SPECIFICATIONS

### 5.1 Bank Statement Import

#### Requirements
- Support CSV and PDF formats for FNB and Nedbank
- Parse transaction data: date, amount, vendor, description
- Detect duplicates (don't re-import existing transactions)
- Apply learning rules to auto-categorize
- Delete original file after successful processing
- Handle errors gracefully with clear user feedback

#### FNB Statement Format (Research Required)
```
// TODO: Analyze actual FNB CSV structure
// Expected columns: Date, Description, Amount, Balance
// Date format: DD/MM/YYYY or YYYY-MM-DD
// Amount: Debit and Credit separate or single signed column?
```

#### Nedbank Statement Format (Research Required)
```
// TODO: Analyze actual Nedbank CSV structure
// Expected columns: Date, Description, Amount, Balance
// Date format: DD/MM/YYYY or YYYY-MM-DD
// Amount: Debit and Credit separate or single signed column?
```

#### PDF Parsing Strategy
- Use PDF text extraction library (pdf-parse or similar)
- Identify transaction table boundaries
- Regex patterns for row extraction
- Fallback: Manual review if parsing fails

#### Import Flow
```
1. User uploads CSV/PDF file
2. Validate file type and size (<10MB)
3. Parse file based on bank type
4. Extract transactions
5. Check for duplicates (date + amount + account)
6. Apply auto-categorization rules
7. Present summary for user review
8. User confirms → Insert to database
9. Delete uploaded file
10. Show success notification with stats
```

### 5.2 Receipt Scanning (Point of Sale)

#### Requirements
- Capture receipt via iPhone camera (file input)
- Extract: vendor, amount, date, items (optional)
- AI-powered categorization with confidence score
- Detect duplicates against recent transactions
- Handle unclear OCR results with user verification
- Real-time budget update

#### Technical Implementation
```typescript
// Frontend: File input with camera capture
<input 
  type="file" 
  accept="image/*" 
  capture="environment" 
  onChange={handleReceiptCapture}
/>

// Backend: Claude Vision API integration
async function processReceipt(imageBase64: string): Promise<ReceiptData> {
  const prompt = `
    Analyze this receipt and extract transaction details.
    Return ONLY valid JSON with no markdown formatting:
    
    {
      "vendor": "store name",
      "amount": 123.45,
      "date": "2025-11-10",
      "items": ["item1", "item2"],
      "suggestedCategory": "category name",
      "confidence": "high|medium|low",
      "unclear_fields": []
    }
    
    If anything is unclear or unreadable, include field name in unclear_fields.
    For suggestedCategory, choose from: ${categoryList}
    Amount must be a number only, no currency symbols.
    Date must be YYYY-MM-DD format.
  `;
  
  const response = await callClaudeAPI({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }
    ]
  });
  
  // Parse response, handle errors
  const data = JSON.parse(response.content[0].text);
  return data;
}
```

#### Duplicate Detection Algorithm
```typescript
function findPotentialDuplicate(
  newTransaction: ReceiptData,
  existingTransactions: Transaction[]
): Transaction | null {
  
  return existingTransactions.find(existing => {
    // Amount must match exactly (within 1 cent for rounding)
    const amountMatch = Math.abs(existing.amount - newTransaction.amount) < 0.01;
    
    // Date within 3-day window (receipt scan before statement clears)
    const daysDiff = Math.abs(
      differenceInDays(existing.date, newTransaction.date)
    );
    const dateMatch = daysDiff <= 3;
    
    // Vendor fuzzy match (handle variations)
    const vendorSimilarity = stringSimilarity(
      existing.vendor.toLowerCase(),
      newTransaction.vendor.toLowerCase()
    );
    const vendorMatch = vendorSimilarity > 0.7;
    
    return amountMatch && dateMatch && vendorMatch;
  });
}

// String similarity helper (Levenshtein distance)
function stringSimilarity(str1: string, str2: string): number {
  // Implementation: Levenshtein distance normalized to 0-1
  // 1 = identical, 0 = completely different
}
```

#### User Verification Flow
```typescript
// If confidence is low or unclear fields exist
if (receipt.confidence === 'low' || receipt.unclear_fields.length > 0) {
  return {
    needsVerification: true,
    data: receipt,
    image: imageBase64, // Show user the receipt
    message: 'Please verify the following details:'
  };
}

// If duplicate detected
const duplicate = findPotentialDuplicate(receipt, recentTransactions);
if (duplicate) {
  return {
    needsConfirmation: true,
    data: receipt,
    duplicate: duplicate,
    message: `This looks like the transaction from ${duplicate.date} at ${duplicate.vendor}. Same one?`
  };
}

// High confidence, no duplicates
return {
  success: true,
  transaction: createTransaction(receipt)
};
```

### 5.3 AI-Powered Categorization

#### Learning System
```typescript
// Phase 1: Rule-based matching
function categorizeBySimilarVendors(transaction: Transaction): string | null {
  const rules = await getLearningRules(transaction.userId);
  
  for (const rule of rules) {
    if (matchesPattern(transaction.vendor, rule.vendorPattern)) {
      // Update rule confidence and match count
      await incrementRuleUsage(rule.id);
      return rule.categoryId;
    }
  }
  
  return null;
}

// Phase 2: Learn from user corrections
async function learnFromCorrection(
  transactionId: string,
  oldCategory: string | null,
  newCategory: string,
  userId: string
) {
  const transaction = await getTransaction(transactionId);
  
  // Check if rule exists for this vendor pattern
  let rule = await findRuleByVendor(transaction.vendor, userId);
  
  if (!rule) {
    // Create new learning rule
    rule = await createLearningRule({
      userId,
      vendorPattern: normalizeVendorName(transaction.vendor),
      categoryId: newCategory,
      confidence: 0.5,
      matchCount: 1
    });
  } else if (rule.categoryId !== newCategory) {
    // User changed their mind - update rule
    await updateLearningRule(rule.id, {
      categoryId: newCategory,
      confidence: 0.6, // Slightly higher for manual correction
      matchCount: rule.matchCount + 1
    });
  } else {
    // Confirmed existing rule - increase confidence
    await updateLearningRule(rule.id, {
      confidence: Math.min(rule.confidence + 0.1, 1.0),
      matchCount: rule.matchCount + 1
    });
  }
}

// Vendor normalization for pattern matching
function normalizeVendorName(vendor: string): string {
  return vendor
    .toUpperCase()
    .replace(/[0-9]/g, '') // Remove numbers: "WOOLWORTHS 1234" → "WOOLWORTHS"
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}
```

#### Category Suggestion Logic
```typescript
async function suggestCategory(
  transaction: Transaction,
  userId: string
): Promise<CategorySuggestion> {
  
  // 1. Check exact vendor match
  const exactRule = await findExactVendorRule(transaction.vendor, userId);
  if (exactRule && exactRule.confidence > 0.8) {
    return {
      categoryId: exactRule.categoryId,
      confidence: exactRule.confidence,
      reason: 'Previous transactions with this vendor'
    };
  }
  
  // 2. Check fuzzy vendor match
  const fuzzyRule = await findSimilarVendorRule(transaction.vendor, userId);
  if (fuzzyRule && fuzzyRule.confidence > 0.7) {
    return {
      categoryId: fuzzyRule.categoryId,
      confidence: fuzzyRule.confidence * 0.9, // Slightly lower for fuzzy
      reason: `Similar to ${fuzzyRule.vendorPattern}`
    };
  }
  
  // 3. Recurring transaction detection
  if (transaction.isRecurring) {
    const recurringGroup = await getRecurringTransactions(
      transaction.recurringGroupId
    );
    if (recurringGroup[0]?.category) {
      return {
        categoryId: recurringGroup[0].category,
        confidence: 0.8,
        reason: 'Part of recurring series'
      };
    }
  }
  
  // 4. Amount-based heuristics
  if (transaction.amount > 1000 && transaction.description.includes('INSURANCE')) {
    return {
      categoryId: 'insurance',
      confidence: 0.6,
      reason: 'High amount + insurance keyword'
    };
  }
  
  // 5. Default: Uncategorized
  return {
    categoryId: 'uncategorized',
    confidence: 0.1,
    reason: 'Unable to categorize automatically'
  };
}
```

### 5.4 Budget Tracking & Alerts

#### Real-Time Budget Calculation
```typescript
async function getCurrentBudgetStatus(
  userId: string,
  categoryId: string,
  month: Date
): Promise<BudgetStatus> {
  
  const category = await getCategory(categoryId);
  const period = await getBudgetPeriod(userId, categoryId, month);
  
  // Calculate actual spend from transactions
  const transactions = await getTransactionsForPeriod(
    userId,
    categoryId,
    period.startDate,
    period.endDate
  );
  
  const actualSpend = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remaining = period.budgetAmount - actualSpend;
  const percentUsed = (actualSpend / period.budgetAmount) * 100;
  
  // Determine alert level
  let alertLevel: 'ok' | 'warning' | 'critical' | 'exceeded' = 'ok';
  if (percentUsed >= 100) alertLevel = 'exceeded';
  else if (percentUsed >= category.alertThreshold * 100) alertLevel = 'critical';
  else if (percentUsed >= (category.alertThreshold - 0.1) * 100) alertLevel = 'warning';
  
  return {
    categoryId,
    categoryName: category.name,
    budgetAmount: period.budgetAmount,
    actualSpend,
    remaining,
    percentUsed,
    alertLevel,
    daysRemaining: differenceInDays(period.endDate, new Date())
  };
}
```

#### Alert Triggers
```typescript
// After every transaction (import or scan)
async function checkBudgetAlerts(
  userId: string,
  categoryId: string
): Promise<Alert[]> {
  
  const status = await getCurrentBudgetStatus(
    userId,
    categoryId,
    new Date()
  );
  
  const alerts: Alert[] = [];
  
  // Critical alert: At or above threshold
  if (status.alertLevel === 'critical') {
    alerts.push({
      type: 'budget_critical',
      severity: 'high',
      message: `⚠️ ${status.categoryName}: ${status.percentUsed.toFixed(0)}% spent (R${status.remaining.toFixed(2)} remaining)`
    });
  }
  
  // Exceeded alert
  if (status.alertLevel === 'exceeded') {
    alerts.push({
      type: 'budget_exceeded',
      severity: 'critical',
      message: `🚨 ${status.categoryName}: Budget exceeded by R${Math.abs(status.remaining).toFixed(2)}`
    });
  }
  
  // Projection alert: Will exceed based on daily average
  const dailyAverage = status.actualSpend / (30 - status.daysRemaining);
  const projectedTotal = dailyAverage * 30;
  if (projectedTotal > status.budgetAmount * 1.1) {
    alerts.push({
      type: 'budget_projection',
      severity: 'medium',
      message: `📊 ${status.categoryName}: Projected to exceed budget by R${(projectedTotal - status.budgetAmount).toFixed(2)}`
    });
  }
  
  return alerts;
}
```

#### Alert Display Strategy
```typescript
// Toast notifications for immediate feedback
function showBudgetToast(alert: Alert) {
  if (alert.severity === 'critical') {
    toast.error(alert.message, { duration: 5000 });
  } else if (alert.severity === 'high') {
    toast.warning(alert.message, { duration: 4000 });
  } else {
    toast.info(alert.message, { duration: 3000 });
  }
}

// Dashboard summary
function BudgetDashboard() {
  return (
    <div>
      {categories.map(cat => {
        const status = getBudgetStatus(cat.id);
        return (
          <BudgetCard
            key={cat.id}
            category={cat}
            status={status}
            className={status.alertLevel === 'exceeded' ? 'border-red-500' : ''}
          />
        );
      })}
    </div>
  );
}
```

### 5.5 Multi-User (Household) Support

#### User Roles
```typescript
type Role = 'owner' | 'partner';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  householdId: string; // Links users in same household
  createdAt: Date;
}
```

#### Account Sharing Permissions
```typescript
// Phase 1: Simple household model
// - Both users see all accounts and transactions
// - Both can categorize and manage budgets
// - Audit log tracks who did what

// Phase 2: Granular permissions (if needed)
interface AccountPermission {
  accountId: string;
  userId: string;
  canView: boolean;
  canEdit: boolean;
  canCategorize: boolean;
}
```

#### Privacy Considerations
```typescript
// Phase 1: Full transparency
// - All transactions visible to both partners
// - Encourages communication about finances

// Future: Individual accounts option
// - Mark account as "private"
// - Only owner can view/edit
// - Still contributes to household totals
```

---

## 6. USER INTERFACE DESIGN

### 6.1 Core Screens

#### Dashboard (Home)
```
┌─────────────────────────────────────┐
│  CashFlow Manager          [Menu] ☰ │
├─────────────────────────────────────┤
│  November 2025                      │
│  R 12,450 / R 18,000 (69%)         │
│  ━━━━━━━━━━━░░░░░░░░░░              │
├─────────────────────────────────────┤
│  🛒 Groceries        R 4,250 / 6,000│
│     ━━━━━━━━━░░░         71%    ⚠️  │
│                                     │
│  🚗 Transport        R 1,800 / 3,000│
│     ━━━━━░░░░░░░░        60%        │
│                                     │
│  🍽️ Dining Out       R 2,100 / 2,000│
│     ━━━━━━━━━━━━     105%       🚨  │
│                                     │
│  [See All Categories]               │
├─────────────────────────────────────┤
│  Recent Transactions                │
│  Nov 10  Woolworths      -R 453.20  │
│  Nov 10  Shell Fuel      -R 650.00  │
│  Nov 9   Netflix         -R 199.00  │
│  [View All]                         │
├─────────────────────────────────────┤
│  [📷 Scan Receipt]  [📄 Import]     │
└─────────────────────────────────────┘
```

#### Transaction List
```
┌─────────────────────────────────────┐
│  ← Transactions         [Filter] 🔍 │
├─────────────────────────────────────┤
│  November 2025                      │
│                                     │
│  Nov 10, 2025                       │
│  🛒 Woolworths Menlyn               │
│     Groceries              -R 453.20│
│     [Edit]                          │
│                                     │
│  🚗 Shell - Lynnwood               │
│     Transport              -R 650.00│
│     [Edit]                          │
│                                     │
│  🎬 Netflix                        │
│     Entertainment          -R 199.00│
│     [Edit]                          │
│                                     │
│  Nov 9, 2025                        │
│  ...                                │
└─────────────────────────────────────┘
```

#### Receipt Scan Flow
```
Step 1: Capture
┌─────────────────────────────────────┐
│  Scan Receipt               [✕]     │
├─────────────────────────────────────┤
│                                     │
│         [Camera Preview]            │
│                                     │
│                                     │
│                                     │
│         [📷 Take Photo]             │
│     or [📁 Choose from Gallery]     │
│                                     │
└─────────────────────────────────────┘

Step 2: Processing
┌─────────────────────────────────────┐
│  Analyzing Receipt...               │
├─────────────────────────────────────┤
│                                     │
│         [Spinner animation]         │
│                                     │
│     Reading receipt data...         │
│                                     │
└─────────────────────────────────────┘

Step 3a: High Confidence
┌─────────────────────────────────────┐
│  Receipt Scanned ✓                  │
├─────────────────────────────────────┤
│  Woolworths                         │
│  R 453.20                           │
│  Nov 10, 2025                       │
│                                     │
│  Category: Groceries                │
│                                     │
│  [Confirm]         [Edit Details]   │
└─────────────────────────────────────┘

Step 3b: Needs Verification
┌─────────────────────────────────────┐
│  Please Verify Details              │
├─────────────────────────────────────┤
│  [Receipt Image]                    │
│                                     │
│  Vendor: [Woolworths____]          │
│  Amount: R [453.20_____]           │
│  Date:   [2025-11-10___]           │
│                                     │
│  Category:                          │
│  [ Select Category ▼ ]             │
│                                     │
│  [Cancel]              [Save]       │
└─────────────────────────────────────┘

Step 3c: Duplicate Detected
┌─────────────────────────────────────┐
│  Possible Duplicate                 │
├─────────────────────────────────────┤
│  This looks similar to:             │
│                                     │
│  Nov 10  Woolworths    -R 453.20   │
│  From bank statement                │
│                                     │
│  Is this the same transaction?      │
│                                     │
│  [Yes, Same]       [No, Different]  │
└─────────────────────────────────────┘
```

#### Budget Management
```
┌─────────────────────────────────────┐
│  ← Budget Settings                  │
├─────────────────────────────────────┤
│  Monthly Budget Overview            │
│                                     │
│  🛒 Groceries                       │
│     Budget:    R [6000_]           │
│     Alert at:  [80___]%            │
│     [Save]                          │
│                                     │
│  🚗 Transport                       │
│     Budget:    R [3000_]           │
│     Alert at:  [80___]%            │
│     [Save]                          │
│                                     │
│  [+ Add Category]                   │
│                                     │
│  Total Budget: R 18,000/month      │
└─────────────────────────────────────┘
```

#### Statement Import
```
┌─────────────────────────────────────┐
│  Import Statement          [✕]      │
├─────────────────────────────────────┤
│  Select Account:                    │
│  ○ John FNB Cheque                 │
│  ○ Sarah Nedbank Cheque            │
│                                     │
│  Upload File:                       │
│  ┌───────────────────────────────┐ │
│  │  Drag & drop CSV or PDF       │ │
│  │  or click to browse           │ │
│  │                               │ │
│  │  [📄 Choose File]             │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Cancel]              [Upload]     │
└─────────────────────────────────────┘

After Upload:
┌─────────────────────────────────────┐
│  Import Preview                     │
├─────────────────────────────────────┤
│  Found 47 transactions              │
│  Date range: Oct 1 - Oct 31        │
│                                     │
│  Auto-categorized: 32 (68%)        │
│  Need review: 15 (32%)             │
│                                     │
│  New transactions: 47               │
│  Duplicates skipped: 0              │
│                                     │
│  [Review]         [Import All]      │
└─────────────────────────────────────┘
```

### 6.2 Design System

#### Colors (Tailwind)
```typescript
const colors = {
  primary: '#2563eb', // blue-600
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444',  // red-500
  neutral: '#64748b', // slate-500
};
```

#### Typography
```typescript
// Headings: font-bold
// Body: font-normal
// Labels: font-medium text-sm
// Captions: text-xs text-slate-500
```

#### Spacing
```typescript
// Consistent 4px grid
// padding: p-4, p-6, p-8
// margin: m-4, m-6, m-8
// gap: gap-4, gap-6
```

### 6.3 Responsive Behavior

**Mobile-First Design** (primary target):
- 320px minimum width
- Touch-friendly tap targets (44px minimum)
- Large, clear buttons
- Vertical stacking

**Desktop Enhancement** (future):
- Multi-column layouts
- Sidebar navigation
- Keyboard shortcuts
- Bulk operations

---

## 7. SECURITY IMPLEMENTATION

### 7.1 Data Protection

#### Encryption at Rest
```typescript
// Use database-level encryption for sensitive fields
// Prisma schema:
model Transaction {
  // ... other fields
  description String @encrypted // Bank description
  notes       String? @encrypted // User notes
}

// Implementation with crypto
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

#### File Upload Security
```typescript
// Validate file uploads
function validateUpload(file: File): ValidationResult {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'text/csv',
    'application/pdf',
    'image/jpeg',
    'image/png'
  ];
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large (max 10MB)' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Check file signature (magic numbers) to prevent spoofing
  const buffer = await file.arrayBuffer();
  const signature = new Uint8Array(buffer.slice(0, 4));
  
  if (!isValidFileSignature(signature, file.type)) {
    return { valid: false, error: 'File type mismatch' };
  }
  
  return { valid: true };
}

// File signature validation
function isValidFileSignature(signature: Uint8Array, mimeType: string): boolean {
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  };
  
  // CSV has no magic number, allow if declared as text/csv
  if (mimeType === 'text/csv') return true;
  
  const expected = signatures[mimeType];
  if (!expected) return false;
  
  return expected.every((byte, i) => signature[i] === byte);
}
```

### 7.2 Authentication & Authorization

#### Cloudflare Access Integration
```typescript
// middleware/auth.ts
export async function authMiddleware(c: Context, next: Next) {
  // Cloudflare Access adds JWT in header
  const jwt = c.req.header('Cf-Access-Jwt-Assertion');
  
  if (!jwt) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Verify JWT
  const user = await verifyCloudflareAccessJWT(jwt);
  
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // Add user to context
  c.set('user', user);
  
  await next();
}

// Verify Cloudflare Access JWT
async function verifyCloudflareAccessJWT(token: string) {
  const CERTS_URL = `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/certs`;
  
  // Fetch public keys
  const response = await fetch(CERTS_URL);
  const { public_certs } = await response.json();
  
  // Verify token with public key
  // Implementation depends on JWT library
  // ...
  
  return decodedUser;
}
```

#### Row-Level Security
```typescript
// Ensure users can only access their own data
async function getTransactions(userId: string, filters: Filters) {
  return await db.transaction.findMany({
    where: {
      userId: userId, // Always filter by authenticated user
      ...filters
    }
  });
}

// Middleware to enforce user context
export function requireOwnResource(resourceType: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const resourceId = c.req.param('id');
    
    const resource = await db[resourceType].findUnique({
      where: { id: resourceId }
    });
    
    if (!resource || resource.userId !== user.id) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    c.set('resource', resource);
    await next();
  };
}
```

### 7.3 Input Validation

#### Zod Schemas
```typescript
import { z } from 'zod';

// Transaction validation
export const TransactionSchema = z.object({
  accountId: z.string().uuid(),
  date: z.string().datetime(),
  amount: z.number().positive().max(1000000),
  type: z.enum(['debit', 'credit']),
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

// Use in API routes
app.post('/api/transactions', async (c) => {
  const body = await c.req.json();
  
  // Validate input
  const result = TransactionSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({
      error: 'Validation failed',
      issues: result.error.issues
    }, 400);
  }
  
  // Proceed with validated data
  const transaction = await createTransaction(result.data);
  return c.json(transaction);
});
```

### 7.4 Rate Limiting

#### Cloudflare Workers KV
```typescript
// Rate limit: 10 uploads per hour per user
async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  
  const key = `ratelimit:${action}:${userId}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  // Get existing requests from KV
  const data = await env.KV.get(key, 'json') || { requests: [] };
  
  // Filter to current window
  const recentRequests = data.requests.filter(t => t > windowStart);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  
  // Store back to KV with expiration
  await env.KV.put(
    key,
    JSON.stringify({ requests: recentRequests }),
    { expirationTtl: windowSeconds }
  );
  
  return true; // Within rate limit
}

// Usage in route
app.post('/api/receipts/scan', async (c) => {
  const user = c.get('user');
  
  const allowed = await checkRateLimit(user.id, 'receipt_scan', 10, 3600);
  
  if (!allowed) {
    return c.json({
      error: 'Rate limit exceeded. Maximum 10 receipt scans per hour.'
    }, 429);
  }
  
  // Proceed with scan
  // ...
});
```

### 7.5 Audit Logging

#### Comprehensive Logging
```typescript
async function logAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: object,
  request: Request
) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: request.headers.get('User-Agent') || 'unknown',
      createdAt: new Date()
    }
  });
}

// Usage examples
await logAction(
  user.id,
  'import_statement',
  'transaction',
  statementId,
  { transactionCount: 47, bank: 'FNB' },
  c.req.raw
);

await logAction(
  user.id,
  'categorize_transaction',
  'transaction',
  transactionId,
  { oldCategory: 'uncategorized', newCategory: 'groceries' },
  c.req.raw
);
```

---

## 8. API SPECIFICATION

### 8.1 RESTful Endpoints

#### Authentication
```
POST   /api/auth/login          # Login (handled by Cloudflare Access)
POST   /api/auth/logout         # Logout
GET    /api/auth/me             # Get current user info
```

#### Transactions
```
GET    /api/transactions        # List transactions (with filters)
GET    /api/transactions/:id    # Get single transaction
POST   /api/transactions        # Create transaction (manual)
PATCH  /api/transactions/:id    # Update transaction (categorize, notes)
DELETE /api/transactions/:id    # Delete transaction
```

#### Statement Import
```
POST   /api/statements/import   # Upload and parse statement
GET    /api/statements/preview  # Preview import before committing
```

#### Receipt Scanning
```
POST   /api/receipts/scan       # Upload receipt image, extract data
POST   /api/receipts/verify     # Confirm verified receipt data
```

#### Categories
```
GET    /api/categories          # List all categories
POST   /api/categories          # Create custom category
PATCH  /api/categories/:id      # Update category (budget, threshold)
DELETE /api/categories/:id      # Delete category
```

#### Budgets
```
GET    /api/budgets             # Get current month budget status
GET    /api/budgets/:year/:month # Get specific month
PATCH  /api/budgets/:categoryId # Update budget for category
```

#### Accounts
```
GET    /api/accounts            # List user's accounts
POST   /api/accounts            # Add new bank account
PATCH  /api/accounts/:id        # Update account details
DELETE /api/accounts/:id        # Remove account
```

#### Analytics
```
GET    /api/analytics/spending  # Spending trends over time
GET    /api/analytics/categories # Category breakdown
GET    /api/analytics/recurring # Recurring transactions report
```

### 8.2 Request/Response Examples

#### POST /api/receipts/scan
```typescript
// Request
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}

// Response (high confidence)
{
  "success": true,
  "transaction": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "vendor": "Woolworths",
    "amount": 453.20,
    "date": "2025-11-10",
    "category": "groceries",
    "confidence": 0.95
  },
  "budgetUpdate": {
    "categoryName": "Groceries",
    "spent": 4703.20,
    "budget": 6000,
    "remaining": 1296.80,
    "percentUsed": 78.4
  }
}

// Response (needs verification)
{
  "needsVerification": true,
  "data": {
    "vendor": "Woo",
    "amount": 453.20,
    "date": "2025-11-10",
    "category": null,
    "unclear_fields": ["vendor"]
  },
  "message": "Please verify the vendor name"
}

// Response (duplicate detected)
{
  "needsConfirmation": true,
  "data": {
    "vendor": "Woolworths",
    "amount": 453.20,
    "date": "2025-11-10"
  },
  "duplicate": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "vendor": "WOOLWORTHS 1234",
    "amount": 453.20,
    "date": "2025-11-10",
    "source": "statement"
  },
  "message": "This looks like an existing transaction. Is it the same?"
}
```

#### POST /api/statements/import
```typescript
// Request (multipart/form-data)
{
  "file": <binary>,
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "bankType": "FNB"
}

// Response
{
  "success": true,
  "summary": {
    "totalTransactions": 47,
    "dateRange": {
      "start": "2025-10-01",
      "end": "2025-10-31"
    },
    "autoCategorized": 32,
    "needsReview": 15,
    "duplicatesSkipped": 2
  },
  "transactions": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "date": "2025-10-31",
      "vendor": "WOOLWORTHS MENLYN",
      "amount": 453.20,
      "suggestedCategory": "groceries",
      "confidence": 0.92,
      "needsReview": false
    },
    // ... more transactions
  ]
}
```

#### GET /api/transactions?startDate=2025-11-01&endDate=2025-11-30&category=groceries
```typescript
// Response
{
  "transactions": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "date": "2025-11-10T10:30:00Z",
      "vendor": "Woolworths",
      "amount": 453.20,
      "type": "debit",
      "category": {
        "id": "cat-groceries",
        "name": "Groceries",
        "icon": "🛒"
      },
      "account": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John FNB Cheque"
      },
      "source": "pos_scan",
      "notes": null
    },
    // ... more transactions
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

---

## 9. TESTING STRATEGY

### 9.1 Test Pyramid

```
        /\
       /  \
      / E2E \  ← 10% (Critical user flows)
     /______\
    /        \
   / Integration\ ← 30% (API endpoints, DB queries)
  /__________\
 /            \
/   Unit Tests  \ ← 60% (Business logic, helpers)
/________________\
```

### 9.2 Unit Tests (Vitest)

#### Test Coverage Priorities
1. **Business Logic** (100% coverage)
   - Budget calculations
   - Duplicate detection
   - Categorization algorithms
   - Learning rule matching

2. **Parsers** (100% coverage)
   - CSV parsing (FNB/Nedbank formats)
   - PDF text extraction
   - Receipt data extraction from Claude responses

3. **Validation** (100% coverage)
   - Zod schema validators
   - File upload validation
   - Input sanitization

4. **Utilities** (80%+ coverage)
   - Date helpers
   - String similarity
   - Currency formatting

#### Example Unit Tests
```typescript
// tests/unit/budget.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBudgetStatus } from '@/lib/budget';

describe('Budget Calculations', () => {
  it('calculates remaining budget correctly', () => {
    const result = calculateBudgetStatus({
      budgetAmount: 6000,
      actualSpend: 4250,
    });
    
    expect(result.remaining).toBe(1750);
    expect(result.percentUsed).toBeCloseTo(70.83, 2);
  });
  
  it('flags critical alert at 80% threshold', () => {
    const result = calculateBudgetStatus({
      budgetAmount: 1000,
      actualSpend: 850,
      alertThreshold: 0.8,
    });
    
    expect(result.alertLevel).toBe('critical');
  });
  
  it('flags exceeded when over budget', () => {
    const result = calculateBudgetStatus({
      budgetAmount: 2000,
      actualSpend: 2100,
    });
    
    expect(result.alertLevel).toBe('exceeded');
    expect(result.remaining).toBe(-100);
  });
});

// tests/unit/duplicate-detection.test.ts
describe('Duplicate Detection', () => {
  it('matches exact amount and date within 3 days', () => {
    const receipt = {
      amount: 453.20,
      date: new Date('2025-11-10'),
      vendor: 'Woolworths',
    };
    
    const transactions = [
      {
        amount: 453.20,
        date: new Date('2025-11-12'),
        vendor: 'WOOLWORTHS 1234',
      },
    ];
    
    const duplicate = findPotentialDuplicate(receipt, transactions);
    
    expect(duplicate).toBeDefined();
    expect(duplicate?.amount).toBe(453.20);
  });
  
  it('does not match different amounts', () => {
    const receipt = {
      amount: 453.20,
      date: new Date('2025-11-10'),
      vendor: 'Woolworths',
    };
    
    const transactions = [
      {
        amount: 450.00, // Different amount
        date: new Date('2025-11-10'),
        vendor: 'Woolworths',
      },
    ];
    
    const duplicate = findPotentialDuplicate(receipt, transactions);
    
    expect(duplicate).toBeUndefined();
  });
  
  it('matches with fuzzy vendor name', () => {
    const receipt = {
      amount: 453.20,
      date: new Date('2025-11-10'),
      vendor: 'Woolworths Menlyn',
    };
    
    const transactions = [
      {
        amount: 453.20,
        date: new Date('2025-11-10'),
        vendor: 'WOOLWORTHS 1234',
      },
    ];
    
    const duplicate = findPotentialDuplicate(receipt, transactions);
    
    expect(duplicate).toBeDefined();
  });
});
```

### 9.3 Integration Tests

#### API Endpoint Tests
```typescript
// tests/integration/api/transactions.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, createTestUser } from '@/tests/helpers';

describe('POST /api/transactions', () => {
  let app: Hono;
  let user: User;
  let token: string;
  
  beforeEach(async () => {
    app = await createTestApp();
    user = await createTestUser();
    token = await getAuthToken(user);
  });
  
  it('creates a transaction with valid data', async () => {
    const response = await app.request('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: user.accountId,
        date: '2025-11-10T10:30:00Z',
        amount: 453.20,
        type: 'debit',
        vendor: 'Woolworths',
        description: 'Grocery shopping',
        category: 'groceries',
      }),
    });
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.transaction.id).toBeDefined();
    expect(data.transaction.amount).toBe(453.20);
  });
  
  it('rejects invalid amount', async () => {
    const response = await app.request('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: user.accountId,
        date: '2025-11-10T10:30:00Z',
        amount: -100, // Invalid: negative
        type: 'debit',
        vendor: 'Test',
      }),
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toContain('Validation failed');
  });
  
  it('enforces user isolation', async () => {
    const otherUser = await createTestUser();
    
    const response = await app.request('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: otherUser.accountId, // Different user's account
        date: '2025-11-10T10:30:00Z',
        amount: 100,
        type: 'debit',
        vendor: 'Test',
      }),
    });
    
    expect(response.status).toBe(403);
  });
});
```

### 9.4 E2E Tests (Playwright - Optional Phase 2)

#### Critical User Flows
```typescript
// tests/e2e/receipt-scan.spec.ts
import { test, expect } from '@playwright/test';

test('complete receipt scan flow', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.click('text=Login');
  // ... authentication flow
  
  // Navigate to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // Start receipt scan
  await page.click('text=Scan Receipt');
  
  // Upload test receipt
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./tests/fixtures/woolworths-receipt.jpg');
  
  // Wait for processing
  await expect(page.locator('text=Analyzing receipt')).toBeVisible();
  
  // Verify extracted data
  await expect(page.locator('text=Woolworths')).toBeVisible();
  await expect(page.locator('text=R 453.20')).toBeVisible();
  
  // Confirm transaction
  await page.click('text=Confirm');
  
  // Verify budget update
  await expect(page.locator('text=Groceries')).toBeVisible();
  await expect(page.locator('text=R 4,703.20 / 6,000')).toBeVisible();
  
  // Check transaction appears in list
  await page.click('text=Recent Transactions');
  await expect(page.locator('text=Woolworths').first()).toBeVisible();
});
```

---

## 10. DEPLOYMENT STRATEGY

### 10.1 Environment Configuration

#### Environment Variables
```bash
# .env.development
DATABASE_URL="file:./dev.db"
CLAUDE_API_KEY="sk-ant-..."
ENCRYPTION_KEY="<32-byte-hex-string>"
NODE_ENV="development"

# .env.production
DATABASE_URL="${CLOUDFLARE_D1_URL}"
CLAUDE_API_KEY="${CLAUDE_API_KEY}" # Cloudflare secret
ENCRYPTION_KEY="${ENCRYPTION_KEY}" # Cloudflare secret
NODE_ENV="production"
CLOUDFLARE_ACCOUNT_ID="${CF_ACCOUNT_ID}"
```

### 10.2 Cloudflare Pages + Workers Setup

#### Project Structure
```
/cashflow-app
  /frontend            # React app (Pages)
  /backend             # Hono API (Workers)
  /shared              # Shared types
  /prisma              # Database schema
  wrangler.toml        # Cloudflare config
```

#### wrangler.toml
```toml
name = "cashflow-api"
main = "backend/src/index.ts"
compatibility_date = "2025-11-10"

[build]
command = "npm run build"

[[d1_databases]]
binding = "DB"
database_name = "cashflow-prod"
database_id = "<your-d1-database-id>"

[[kv_namespaces]]
binding = "KV"
id = "<your-kv-namespace-id>"

[vars]
NODE_ENV = "production"

# Secrets (set via wrangler secret put)
# CLAUDE_API_KEY
# ENCRYPTION_KEY
```

#### Deployment Commands
```bash
# Deploy backend (Workers)
cd backend
npm run build
wrangler deploy

# Deploy frontend (Pages)
cd frontend
npm run build
wrangler pages deploy dist
```

### 10.3 Database Migration Strategy

#### Development
```bash
# Create migration
npx prisma migrate dev --name add_learning_rules

# Apply migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

#### Production (Cloudflare D1)
```bash
# Generate SQL from Prisma schema
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migrations/001_initial.sql

# Apply to D1
wrangler d1 execute cashflow-prod --file=migrations/001_initial.sql

# For subsequent migrations
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel prisma/schema-new.prisma \
  --script > migrations/002_add_feature.sql

wrangler d1 execute cashflow-prod --file=migrations/002_add_feature.sql
```

### 10.4 CI/CD Pipeline (GitHub Actions)

#### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
          workingDirectory: backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist
          workingDirectory: frontend
```

### 10.5 Monitoring & Logging

#### Cloudflare Analytics
- Request count and latency
- Error rates
- Geographic distribution

#### Custom Logging
```typescript
// lib/logger.ts
export function logError(
  error: Error,
  context: Record<string, any>
) {
  // In production: send to Cloudflare Workers Analytics
  // In development: console.error
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
    },
    context,
  };
  
  if (env.NODE_ENV === 'production') {
    // Send to Cloudflare Analytics Engine
    env.ANALYTICS?.writeDataPoint(logEntry);
  } else {
    console.error(logEntry);
  }
}
```

---

## 11. PHASE BREAKDOWN

### Phase 0: Research & Setup (1 week)

**Goals:**
- Analyze real FNB and Nedbank statement formats
- Test Claude Vision API with real receipt samples
- Set up development environment
- Create initial database schema

**Deliverables:**
- [ ] Sample FNB/Nedbank statements collected (anonymized)
- [ ] CSV/PDF parsing patterns documented
- [ ] Receipt scanning tested with 10+ real receipts
- [ ] Dev environment working (React + Hono + SQLite)
- [ ] Prisma schema created
- [ ] GitHub repository initialized

**Success Criteria:**
- Can parse at least one statement format with >90% accuracy
- Claude Vision correctly extracts vendor/amount/date from 8/10 receipts

---

### Phase 1A: Core MVP (2-3 weeks)

**Goals:**
- Build basic cashflow tracking
- Manual transaction entry and categorization
- Budget setup and tracking
- File upload infrastructure

**Features:**
1. **User Authentication**
   - Simple email/password login (Cloudflare Access or Auth0)
   - User profile creation

2. **Account Management**
   - Add bank accounts (FNB/Nedbank)
   - Mark accounts as active/inactive

3. **Category Setup**
   - Default categories seeded
   - Create custom categories
   - Set monthly budgets per category

4. **Manual Transaction Entry**
   - Add transaction manually (for testing)
   - Assign category
   - Add notes

5. **Budget Dashboard**
   - Current month overview
   - Budget vs. actual per category
   - Alert indicators (warning/critical/exceeded)

6. **Transaction List**
   - View all transactions
   - Filter by date range, category, account
   - Edit/delete transactions

**Deliverables:**
- [ ] React frontend with core screens
- [ ] Hono backend with API endpoints
- [ ] Database with sample data
- [ ] Basic authentication working
- [ ] Budget calculations accurate
- [ ] Responsive mobile UI

**Success Criteria:**
- Can manually track spending for one month
- Budget alerts trigger correctly
- Wife can log in and see shared data

---

### Phase 1B: Statement Import (1-2 weeks)

**Goals:**
- Automated transaction import from bank statements
- Duplicate detection
- Basic auto-categorization

**Features:**
1. **CSV Upload & Parsing**
   - FNB CSV parser
   - Nedbank CSV parser
   - Validation and error handling

2. **PDF Upload & Parsing**
   - FNB PDF parser
   - Nedbank PDF parser
   - Table extraction

3. **Import Preview**
   - Show transactions before committing
   - Flag duplicates
   - Show auto-categorization suggestions

4. **Duplicate Detection**
   - Match against existing transactions
   - User confirmation for matches

5. **Rule-Based Categorization**
   - Keyword matching for vendors
   - Learn from past categorizations

**Deliverables:**
- [ ] Statement parser for FNB (CSV + PDF)
- [ ] Statement parser for Nedbank (CSV + PDF)
- [ ] Import preview UI
- [ ] Duplicate detection working
- [ ] Basic learning rules implemented

**Success Criteria:**
- Can import entire month's statement in <30 seconds
- Duplicate detection catches all repeats
- Auto-categorization achieves >50% accuracy

---

### Phase 1C: Receipt Scanning (1 week)

**Goals:**
- Real-time budget updates via POS receipt scanning
- Claude Vision integration
- Duplicate detection for receipts vs. statements

**Features:**
1. **Receipt Capture**
   - File input with camera access
   - Image upload validation

2. **Claude Vision Integration**
   - Extract vendor, amount, date
   - Suggest category
   - Handle unclear results

3. **Verification Flow**
   - User confirms high-confidence scans
   - Manual correction for low-confidence

4. **Duplicate Prevention**
   - Match against recent transactions
   - User confirmation for potential duplicates

5. **Real-Time Budget Update**
   - Immediate spend reflection
   - Updated dashboard
   - Alert notifications

**Deliverables:**
- [ ] Receipt scanning UI (mobile-optimized)
- [ ] Claude API integration
- [ ] Duplicate detection for scanned receipts
- [ ] Real-time budget updates

**Success Criteria:**
- Can scan receipt and update budget in <10 seconds
- Claude Vision achieves >70% accuracy without verification
- Duplicate detection catches same-day statement imports

---

### Phase 2: Intelligence & Polish (2-3 weeks)

**Goals:**
- Enhanced ML categorization
- Recurring transaction detection
- Multi-user household features
- PWA enhancements

**Features:**
1. **Advanced Categorization**
   - Learn from user corrections
   - Pattern detection (recurring, amounts)
   - Confidence scoring improvements

2. **Recurring Transaction Detection**
   - Identify subscription patterns
   - Auto-categorize recurring expenses
   - Flag anomalies

3. **Household Multi-User**
   - Partner account linking
   - Shared budget view
   - Individual transaction privacy options

4. **PWA Features**
   - Add to home screen
   - Offline mode (view cached data)
   - Push notifications for budget alerts

5. **Analytics & Reports**
   - Spending trends over time
   - Category breakdown charts
   - Monthly comparison
   - Export for tax purposes

6. **UX Improvements**
   - Onboarding flow
   - Help tooltips
   - Keyboard shortcuts (desktop)
   - Bulk operations

**Deliverables:**
- [ ] ML learning system operational
- [ ] Recurring transactions detected
- [ ] Wife's account linked
- [ ] PWA manifest and service worker
- [ ] Analytics dashboard
- [ ] Polished UI/UX

**Success Criteria:**
- Auto-categorization accuracy >80%
- Recurring transactions identified automatically
- Both users can manage finances independently
- App works offline for viewing

---

### Phase 3: Business Expansion (Future)

**Goals:**
- Support business finances
- Multi-entity management
- Tax preparation features
- Team collaboration

**Features:**
1. **Business Account Support**
   - Separate business entity
   - Business-specific categories
   - VAT tracking

2. **Multi-Entity Management**
   - Switch between personal/business
   - Consolidated reporting
   - Inter-entity transfers

3. **Tax Features**
   - Tax category tagging
   - Deduction tracking
   - Export for accountant

4. **Team Collaboration**
   - Bookkeeper role
   - Approval workflows
   - Comment threads on transactions

**Out of scope for now** - focus on Phase 1 validation first.

---

## 12. RISKS & MITIGATIONS

### 12.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Bank statement format changes | High | Medium | Adapter pattern allows easy updates; monitor for changes |
| Claude API rate limits | Medium | Low | Implement retry logic; cache results; upgrade plan if needed |
| Duplicate detection fails | High | Medium | Thorough testing with real data; user confirmation as failsafe |
| Database migration issues (D1) | High | Low | Test migrations in staging; keep backups; maintain portability |
| OCR accuracy too low | High | Medium | Always allow manual verification; improve prompts iteratively |

### 12.2 Security Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach | Critical | Low | Encryption at rest; strict access controls; audit logging |
| Session hijacking | High | Low | Short session timeouts; secure cookies; HTTPS only |
| Malicious file uploads | Medium | Medium | File validation; size limits; virus scanning |
| SQL injection | High | Low | Prisma parameterized queries; no raw SQL |
| XSS attacks | Medium | Low | React auto-escaping; sanitize user inputs |

### 12.3 User Experience Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Too complex to use daily | High | Medium | Focus on simplicity; user testing; clear onboarding |
| Receipt scanning too slow | Medium | Medium | Show progress indicator; optimize Claude API calls |
| Budget alerts too noisy | Medium | High | Configurable thresholds; smart alert timing |
| Wife doesn't adopt tool | High | Medium | Involve in design; ensure mobile UX excellent |

### 12.4 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Claude API costs too high | Medium | Low | Monitor usage; optimize prompts; consider alternatives |
| Scope creep | Medium | High | Strict phase definitions; resist feature bloat |
| Maintenance burden | Medium | Medium | Clean code; good documentation; automated testing |

---

## 13. SUCCESS METRICS

### 13.1 Phase 1A Success Criteria
- [ ] Can track one month of spending manually
- [ ] Budget calculations accurate to the cent
- [ ] Both users can log in and see data
- [ ] Mobile UI usable on iPhone
- [ ] Zero security vulnerabilities in audit

### 13.2 Phase 1B Success Criteria
- [ ] Import FNB statement in <30 seconds
- [ ] Import Nedbank statement in <30 seconds
- [ ] Duplicate detection: 100% accuracy
- [ ] Auto-categorization: >50% accuracy
- [ ] Zero data loss during import

### 13.3 Phase 1C Success Criteria
- [ ] Scan receipt in <10 seconds (including processing)
- [ ] Claude Vision accuracy: >70% without verification
- [ ] Duplicate detection: >95% accuracy
- [ ] Real-time budget updates work reliably
- [ ] Users feel confident scanning receipts

### 13.4 Overall Success (3 months)
- [ ] Using app daily for all spending
- [ ] Budget adherence improved (measured by actual vs. budget)
- [ ] No manual spreadsheet needed anymore
- [ ] Both users actively categorizing and reviewing
- [ ] Auto-categorization: >80% accuracy
- [ ] App feels fast and reliable

---

## 14. OPEN QUESTIONS & DECISIONS NEEDED

### 14.1 To Research
- [ ] FNB CSV exact format (columns, date format, amount sign)
- [ ] Nedbank CSV exact format
- [ ] FNB PDF structure (table boundaries, font)
- [ ] Nedbank PDF structure
- [ ] Claude API rate limits for production usage
- [ ] Cloudflare D1 performance characteristics

### 14.2 To Decide
- [ ] Authentication provider: Cloudflare Access vs. Auth0?
- [ ] Domain name for app
- [ ] Logo and branding
- [ ] PWA name: "CashFlow", "BudgetTracker", other?
- [ ] Alert notification strategy (email, push, in-app only?)
- [ ] Data retention policy (how long to keep old transactions?)

### 14.3 To Test
- [ ] 20+ real receipts through Claude Vision (accuracy baseline)
- [ ] FNB statement parsing with 3+ months of data
- [ ] Nedbank statement parsing with 3+ months of data
- [ ] Wife's iPhone camera quality for receipts
- [ ] App performance with 1000+ transactions

---

## 15. IMPLEMENTATION CHECKLIST

### 15.1 Pre-Development
- [ ] Read this entire specification document
- [ ] Collect sample bank statements (FNB + Nedbank)
- [ ] Collect 10+ receipt images for testing
- [ ] Set up GitHub repository
- [ ] Create Cloudflare account
- [ ] Get Claude API key
- [ ] Set up development environment (Node, npm, VS Code)

### 15.2 Phase 0: Foundation
- [ ] Initialize React TypeScript project (Vite)
- [ ] Initialize Hono backend
- [ ] Set up Prisma with SQLite
- [ ] Create initial schema
- [ ] Test Claude Vision API with receipts
- [ ] Document FNB/Nedbank formats
- [ ] Write parsing strategy document

### 15.3 Phase 1A: MVP
- [ ] User authentication
- [ ] Account management CRUD
- [ ] Category management CRUD
- [ ] Manual transaction entry
- [ ] Transaction list with filters
- [ ] Budget calculation logic (with tests)
- [ ] Dashboard UI
- [ ] Mobile responsive layout
- [ ] Deploy to Cloudflare (staging)

### 15.4 Phase 1B: Statements
- [ ] FNB CSV parser (with tests)
- [ ] Nedbank CSV parser (with tests)
- [ ] PDF text extraction
- [ ] FNB PDF parser
- [ ] Nedbank PDF parser
- [ ] Import preview UI
- [ ] Duplicate detection algorithm (with tests)
- [ ] Rule-based categorization
- [ ] Learning from corrections

### 15.5 Phase 1C: Receipts
- [ ] File upload UI (camera input)
- [ ] Claude Vision integration
- [ ] Receipt verification UI
- [ ] Duplicate detection for receipts
- [ ] Real-time budget updates
- [ ] Toast notifications
- [ ] Error handling

### 15.6 Phase 2: Enhancement
- [ ] Advanced ML categorization
- [ ] Recurring transaction detection
- [ ] Multi-user household support
- [ ] PWA manifest
- [ ] Service worker (optional)
- [ ] Analytics dashboard
- [ ] UX polish
- [ ] Production deployment

---

## 16. GLOSSARY

**Terms:**
- **Transaction**: A single financial entry (debit or credit)
- **Statement**: Bank-provided document listing transactions
- **Receipt**: Point-of-sale proof of purchase
- **Category**: Spending classification (e.g., Groceries, Transport)
- **Budget**: Allocated spending limit per category per month
- **Learning Rule**: Pattern that maps vendor/description to category
- **Duplicate**: Transaction that appears both as receipt scan and statement import
- **Alert Threshold**: Percentage of budget at which to warn user
- **Recurring Transaction**: Regular payment (subscription, debit order)
- **Audit Log**: Record of all user actions for security tracking

**Acronyms:**
- **PWA**: Progressive Web App
- **TDD**: Test-Driven Development
- **API**: Application Programming Interface
- **CSV**: Comma-Separated Values
- **PDF**: Portable Document Format
- **OCR**: Optical Character Recognition
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **UUID**: Universally Unique Identifier
- **ORM**: Object-Relational Mapping

---

## 17. REFERENCES

### 17.1 Documentation Links
- Anthropic Claude API: https://docs.anthropic.com/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Prisma: https://www.prisma.io/docs/
- Hono: https://hono.dev/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Vitest: https://vitest.dev/

### 17.2 Related Standards
- PWA Guidelines: https://web.dev/progressive-web-apps/
- OWASP Security: https://owasp.org/www-project-web-security-testing-guide/
- REST API Design: https://restfulapi.net/

---

## 18. VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-10 | Initial specification | Claude + Jacs |

---

**END OF SPECIFICATION**

**Next Steps:**
1. Review and approve this specification
2. Collect sample bank statements and receipts
3. Begin Phase 0: Research & Setup
4. Create GitHub repository and initial project structure

**Questions or changes needed?** Update this document as decisions are made and maintain as single source of truth throughout development.