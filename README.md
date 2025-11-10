# CashFlow Manager

AI-powered cashflow and budget management application with automated bank statement processing and point-of-sale receipt scanning.

## Overview

CashFlow Manager helps you track your finances in real-time by:
- 📄 Importing bank statements (FNB & Nedbank)
- 📸 Scanning receipts at point of sale
- 🤖 AI-powered expense categorization
- 📊 Real-time budget tracking with alerts
- 👥 Multi-user household support

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js (Cloudflare Workers)
- **Framework**: Hono
- **Database**: Prisma ORM (SQLite → PostgreSQL → Cloudflare D1)
- **AI**: Anthropic Claude Sonnet 4.5 (Vision API)
- **Deployment**: Cloudflare Pages + Workers

## Project Structure

```
cashflow-manager/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── styles/        # Global styles
│   │   └── types/         # Frontend-specific types
│   └── package.json
│
├── backend/               # Hono API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Authentication, logging, etc.
│   │   ├── services/      # Business logic
│   │   ├── lib/           # Utilities and helpers
│   │   └── types/         # Backend-specific types
│   ├── wrangler.toml      # Cloudflare Workers config
│   └── package.json
│
├── shared/                # Shared types and validation
│   └── src/
│       ├── types/         # Shared TypeScript types
│       └── validation.ts  # Zod schemas
│
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Migration files
│
├── tests/                 # Test suites
│   ├── unit/              # Unit tests
│   ├── integration/       # API integration tests
│   └── e2e/               # End-to-end tests
│
└── docs/                  # Additional documentation
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Git
- Cloudflare account (for deployment)
- Anthropic API key (for receipt scanning)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Budget-v-Actual-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp prisma/.env.example prisma/.env
   # Edit prisma/.env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:migrate:dev
   ```

5. **Seed database with default categories**
   ```bash
   npx prisma db seed
   ```

### Development

**Run both frontend and backend:**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1: Frontend (http://localhost:3000)
npm run dev:frontend

# Terminal 2: Backend (http://localhost:8787)
npm run dev:backend
```

**Open Prisma Studio (database GUI):**
```bash
npm run db:studio
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build both frontend and backend
npm run build

# Build separately
npm run build:frontend
npm run build:backend
```

## Development Workflow

### Phase 0: Research & Setup ✓
- [x] Project structure initialized
- [ ] Analyze real bank statement formats
- [ ] Test Claude Vision API with receipts
- [ ] Document parsing patterns

### Phase 1A: Core MVP (In Progress)
- [ ] User authentication
- [ ] Account management
- [ ] Category setup
- [ ] Manual transaction entry
- [ ] Budget dashboard
- [ ] Transaction list

### Phase 1B: Statement Import
- [ ] CSV parsers (FNB/Nedbank)
- [ ] PDF parsers (FNB/Nedbank)
- [ ] Duplicate detection
- [ ] Auto-categorization

### Phase 1C: Receipt Scanning
- [ ] Claude Vision integration
- [ ] Receipt verification flow
- [ ] Real-time budget updates

See `User Requirement Spec/CASHFLOW_APP_SPECIFICATION.md` for full project roadmap.

## Key Features

### Bank Statement Import
- Support for FNB and Nedbank (CSV & PDF)
- Automatic transaction extraction
- Duplicate detection
- Batch import with preview

### Receipt Scanning
- Camera capture on mobile
- AI-powered OCR using Claude Vision
- Vendor, amount, and date extraction
- Confidence scoring and verification

### Smart Categorization
- Learning from user corrections
- Pattern matching for vendors
- Recurring transaction detection
- Confidence-based suggestions

### Budget Tracking
- Real-time spend vs. budget
- Configurable alert thresholds
- Category-based budgets
- Monthly rollover

### Household Support
- Multiple users per household
- Shared account visibility
- Audit trail for all actions

## Security

- **Encryption at rest**: Transaction descriptions and notes
- **Input validation**: Zod schemas on all inputs
- **SQL injection prevention**: Prisma parameterized queries
- **Rate limiting**: Cloudflare Workers KV
- **Audit logging**: All financial actions tracked
- **HTTPS only**: Enforced via Cloudflare

See specification Section 7 for full security implementation.

## API Documentation

Base URL (dev): `http://localhost:8787/api`

### Endpoints

- `GET /health` - Health check
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `POST /api/receipts/scan` - Scan receipt
- `POST /api/statements/import` - Import statement
- `GET /api/categories` - List categories
- `GET /api/budgets` - Get budget status

See specification Section 8 for complete API documentation.

## Deployment

### Frontend (Cloudflare Pages)
```bash
npm run deploy:frontend
```

### Backend (Cloudflare Workers)
```bash
npm run deploy:backend
```

### Database Migrations (Production)
```bash
# Generate migration SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migrations/001_initial.sql

# Apply to Cloudflare D1
wrangler d1 execute cashflow-prod --file=migrations/001_initial.sql
```

## Environment Variables

### Development
```
DATABASE_URL="file:./dev.db"
CLAUDE_API_KEY="sk-ant-..."
ENCRYPTION_KEY="<32-byte-hex>"
NODE_ENV="development"
```

### Production (Cloudflare Secrets)
```bash
wrangler secret put CLAUDE_API_KEY
wrangler secret put ENCRYPTION_KEY
```

## Contributing

This is a personal project, but contributions are welcome! Please:
1. Follow the functional programming principles outlined in the spec
2. Write tests for new features
3. Follow TypeScript strict mode (no `any` types)
4. Use meaningful commit messages

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Create a GitHub issue
- Review the specification: `User Requirement Spec/CASHFLOW_APP_SPECIFICATION.md`
- Check the docs folder for additional guides

---

**Built with ❤️ by Jacs Lemmer**
**Powered by Claude AI**
