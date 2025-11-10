# Getting Started with CashFlow Manager

## Quick Start Guide

This guide will help you get the project up and running on your Mac Mini M4.

### Step 1: Verify Prerequisites

```bash
# Check Node.js version (should be 20+)
node --version

# Check npm version (should be 10+)
npm --version

# Check Git
git --version
```

### Step 2: Install Dependencies

From the project root:

```bash
npm install
```

This installs dependencies for all workspaces (frontend, backend, shared).

### Step 3: Set Up Supabase Database

**IMPORTANT**: You need a Supabase account first! See `docs/SUPABASE_SETUP.md` for the complete guide.

**Quick steps:**

1. **Create Supabase account** (free, no credit card):
   - Go to https://supabase.com
   - Sign up with GitHub or email
   - Create a new project
   - Get your connection strings from Settings → Database

2. **Copy environment file:**
   ```bash
   cp prisma/.env.example prisma/.env
   ```

3. **Edit `prisma/.env` with your Supabase connection strings:**
   ```bash
   # Use your favorite editor
   code prisma/.env
   # or
   nano prisma/.env
   ```

   Paste your Supabase URLs:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@...6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@...5432/postgres"
   ```

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Create database tables:**
   ```bash
   npm run db:migrate:dev
   ```

6. **Seed with default categories:**
   ```bash
   npx prisma db seed
   ```

### Step 4: Start Development Servers

**Option A: Start both together**
```bash
npm run dev
```

**Option B: Start separately (2 terminals)**
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:backend
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8787
- **Prisma Studio**: Run `npm run db:studio` then open http://localhost:5555

### Step 6: Verify Setup

You should see a welcome screen with "CashFlow Manager" and a test counter button.

Check the backend is working:
```bash
curl http://localhost:8787/api/health
# Should return: {"status":"ok"}
```

## Next Steps

### Phase 0: Research & Setup

Before building features, collect research data:

1. **Bank Statements**
   - Export 2-3 months of FNB statements (CSV and PDF)
   - Export 2-3 months of Nedbank statements (CSV and PDF)
   - Anonymize personal data
   - Place in `docs/samples/statements/`

2. **Receipt Samples**
   - Take photos of 10-20 recent receipts
   - Include variety: groceries, fuel, restaurants, etc.
   - Place in `docs/samples/receipts/`

3. **Test Claude Vision API**
   - Get your Anthropic API key from https://console.anthropic.com/
   - Add to `prisma/.env`: `CLAUDE_API_KEY="sk-ant-..."`
   - Create a test script to scan a receipt

### Development Tips

**Hot Reload**
- Frontend: Automatically reloads on file changes
- Backend: Wrangler watches for changes

**Database Changes**
```bash
# After modifying prisma/schema.prisma
npm run db:migrate:dev --name describe_your_change
npm run db:generate
```

**View Database**
```bash
npm run db:studio
```

**Linting & Type Checking**
```bash
npm run lint        # Check for errors
npm run lint:fix    # Auto-fix where possible
npm run typecheck   # TypeScript type checking
```

**Running Tests**
```bash
npm test           # Run once
npm run test:watch # Watch mode
```

## Troubleshooting

### Port Already in Use

If port 3000 or 8787 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:8787 | xargs kill -9
```

Or change the ports in:
- Frontend: `frontend/vite.config.ts` (server.port)
- Backend: `wrangler dev --port <new-port>`

### Database Locked

If you get "database is locked" errors:

```bash
# Close Prisma Studio and any other connections
# Delete the database and recreate
rm prisma/dev.db
npm run db:migrate:dev
npx prisma db seed
```

### TypeScript Errors

If you see TypeScript errors about missing types:

```bash
# Regenerate Prisma client
npm run db:generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module Resolution Issues

If imports fail:

```bash
# Ensure workspace links are correct
npm install

# Rebuild TypeScript declarations
npm run build
```

## VS Code Recommended Extensions

Install these for better DX:

- **Prisma** (prisma.prisma)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **ESLint** (dbaeumer.vscode-eslint)
- **TypeScript Error Translator** (mattpocock.ts-error-translator)
- **Pretty TypeScript Errors** (yoavbls.pretty-ts-errors)

## Ready to Code!

You're all set up! Start with Phase 1A (Core MVP) from the specification.

**Next: Build the authentication system and dashboard**

See `User Requirement Spec/CASHFLOW_APP_SPECIFICATION.md` Section 11 for phase breakdown.
