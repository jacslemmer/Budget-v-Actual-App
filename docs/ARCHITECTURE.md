# Architecture Overview

## System Architecture

CashFlow Manager follows a modern, serverless architecture optimized for Cloudflare's edge network.

```
┌─────────────────────────────────────────────────────────┐
│                     User Devices                         │
│              (iPhone, Desktop Browser)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare CDN / Edge                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Cloudflare Pages (Frontend)              │  │
│  │  - React SPA                                     │  │
│  │  - Static assets cached at edge                 │  │
│  │  - Service Worker (PWA)                         │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│                       │ API Calls                        │
│                       ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Cloudflare Workers (Backend)                │  │
│  │  - Hono API Server                               │  │
│  │  - Authentication middleware                     │  │
│  │  - Business logic                                │  │
│  └─┬────────────────┬───────────────────────────────┘  │
│    │                │                                    │
└────┼────────────────┼────────────────────────────────────┘
     │                │
     │                │
     ▼                ▼
┌─────────────┐  ┌──────────────────┐  ┌───────────────┐
│   D1 (DB)   │  │  Workers KV      │  │ Anthropic API │
│  SQLite @   │  │  Rate Limiting   │  │  Claude       │
│  Edge       │  │  Caching         │  │  Sonnet 4.5   │
└─────────────┘  └──────────────────┘  └───────────────┘
```

## Technology Choices

### Why React + Vite?
- **Fast development**: Hot module replacement
- **Modern tooling**: Native ESM, fast builds
- **Production-ready**: Optimized bundles, code splitting
- **Ecosystem**: Large library of components and tools

### Why Hono?
- **Cloudflare-optimized**: Designed for Workers
- **Lightweight**: Small bundle size, fast cold starts
- **TypeScript-first**: Excellent type inference
- **Middleware ecosystem**: Authentication, validation, CORS

### Why Prisma?
- **Type-safe**: Generated TypeScript client
- **Multi-database**: SQLite → PostgreSQL → D1
- **Migrations**: Version controlled schema changes
- **Developer experience**: Prisma Studio for data viewing

### Why Cloudflare?
- **Edge deployment**: Low latency worldwide
- **Free tier**: Generous limits for personal use
- **Integrated services**: Pages + Workers + D1 + KV
- **Security**: DDoS protection, SSL, CDN included

### Why Claude API?
- **Vision capabilities**: Best-in-class OCR
- **Accuracy**: Better than alternatives for receipts
- **JSON mode**: Structured output
- **Context length**: Handle large statement files

## Data Flow

### Receipt Scanning Flow

```
User captures photo
        ↓
Frontend validates file
        ↓
Base64 encode image
        ↓
POST /api/receipts/scan
        ↓
Backend validates request
        ↓
Call Claude Vision API
        ↓
Parse JSON response
        ↓
Check for duplicates
        ↓
Apply categorization rules
        ↓
Return result to user
        ↓
User confirms/edits
        ↓
Save to database
        ↓
Update budget calculations
        ↓
Return updated budget status
```

### Statement Import Flow

```
User uploads CSV/PDF
        ↓
Frontend validates file
        ↓
POST /api/statements/import
        ↓
Backend validates file
        ↓
Parse based on bank type
        ↓
Extract transactions
        ↓
Check each for duplicates
        ↓
Apply categorization rules
        ↓
Return preview to user
        ↓
User reviews & confirms
        ↓
Bulk insert to database
        ↓
Update budget calculations
        ↓
Return summary
```

## Security Architecture

### Authentication Flow

```
User → Cloudflare Access → JWT → Workers → Verify → Allow/Deny
```

### Data Protection Layers

1. **Transport**: HTTPS only (enforced by Cloudflare)
2. **Input**: Zod validation on all endpoints
3. **Storage**: Encryption at rest (AES-256-GCM)
4. **Access**: Row-level security (userId filtering)
5. **Audit**: All financial actions logged

### Encryption Strategy

**Encrypted Fields:**
- Transaction descriptions
- User notes
- Account numbers (last 4 digits only)

**Encryption Method:**
- Algorithm: AES-256-GCM
- Key: 32-byte random key (stored in Workers secret)
- IV: Random per-encryption (stored with ciphertext)
- Auth tag: Verified on decryption

## Database Design

### Schema Principles

1. **Normalization**: Avoid data duplication
2. **Indexing**: Fast queries on common filters
3. **Cascading**: Clean up orphaned records
4. **Timestamps**: Track all changes
5. **Soft deletes**: Mark as inactive, don't delete

### Relationships

```
User 1:N Account
User 1:N Transaction
User 1:N Category
User 1:N LearningRule
User 1:N BudgetPeriod

Account 1:N Transaction

Category 1:N Transaction
Category 1:N LearningRule
Category 1:N BudgetPeriod
Category 1:N Category (self-referential hierarchy)
```

### Query Optimization

**Indexes on:**
- `userId` (all tables)
- `date`, `category` (transactions)
- `year`, `month` (budget periods)
- `vendorPattern` (learning rules)

## State Management

### Frontend State

**React Context:**
- User session
- Global app state

**TanStack Query:**
- Server state caching
- Automatic refetching
- Optimistic updates

**Local State:**
- Component-specific UI state
- Form inputs

### Cache Strategy

**Client-side:**
- TanStack Query cache (5 min default)
- Service Worker cache (static assets)

**Server-side:**
- Cloudflare CDN cache (static assets)
- Workers KV cache (rate limiting state)

## Performance Considerations

### Frontend Optimization

- Code splitting by route
- Lazy loading components
- Image optimization
- Virtual scrolling for long lists
- Debounced search inputs

### Backend Optimization

- Edge deployment (low latency)
- Connection pooling (database)
- Batch operations where possible
- Rate limiting to prevent abuse
- Efficient SQL queries (use indexes)

### Database Optimization

- Proper indexing
- Avoid N+1 queries
- Use transactions for consistency
- Limit result sets (pagination)
- Pre-calculate aggregates (budget totals)

## Scalability

### Current Limits (Free Tier)

- **Workers**: 100k requests/day
- **D1**: 5 million row reads/day
- **KV**: 100k reads/day
- **Pages**: Unlimited requests

### Growth Strategy

1. **Phase 1**: Single user (you + wife) - free tier sufficient
2. **Phase 2**: Family & friends (<10 users) - still free tier
3. **Phase 3**: Public release (100s of users) - upgrade to paid tier
4. **Phase 4**: Business features (1000s of users) - paid + optimization

### Bottlenecks to Monitor

- Claude API costs (receipt scanning)
- D1 write volume (statement imports)
- Workers CPU time (PDF parsing)

## Testing Strategy

### Unit Tests
- Pure functions
- Business logic
- Utilities

### Integration Tests
- API endpoints
- Database queries
- Authentication flow

### E2E Tests (Future)
- Critical user flows
- Receipt scanning
- Statement import

## Deployment Pipeline

```
Git Push
   ↓
GitHub Actions trigger
   ↓
Run tests & linting
   ↓
Build frontend & backend
   ↓
Deploy to Cloudflare
   ↓
Run smoke tests
   ↓
Done ✓
```

## Monitoring & Observability

**Metrics to track:**
- Request count & latency
- Error rates
- Database query performance
- Claude API usage & costs
- User activity patterns

**Tools:**
- Cloudflare Analytics (built-in)
- Custom logging (Workers Analytics Engine)
- Prisma query logging (development)

## Future Architecture Considerations

**If scaling beyond personal use:**

1. **Multi-region D1** (when available)
2. **Redis for caching** (Cloudflare Workers KV → Redis)
3. **Queue for heavy processing** (Cloudflare Queues)
4. **Separate AI service** (dedicated Claude instance)
5. **CDN for uploaded images** (Cloudflare R2)

---

**Current Status**: Phase 0 - Research & Setup
**Next**: Implement Phase 1A - Core MVP
