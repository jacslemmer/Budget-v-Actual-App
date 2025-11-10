# Supabase Setup Guide

This guide walks you through setting up your free Supabase PostgreSQL database for CashFlow Manager.

## Why Supabase?

✅ **Free tier**: 500MB database (plenty for personal use)
✅ **Easy setup**: No credit card required
✅ **Built-in features**: Authentication, storage, real-time subscriptions
✅ **Great DX**: Database GUI included
✅ **Battle-tested**: Prisma + PostgreSQL is rock-solid
✅ **Scalable**: Easy to upgrade if needed

---

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

**Cost**: $0 (free tier, no credit card needed)

---

## Step 2: Create a New Project

1. After signing in, click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `cashflow-manager` (or your preference)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-east-1` for USA East)
   - **Pricing Plan**: Free

4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 3: Get Your Connection Strings

1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click **"Database"** in the left menu
3. Scroll to **"Connection string"** section

You'll see two types of connections:

### A. Transaction Pooler (Recommended for Serverless)
```
URI: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### B. Direct Connection (For migrations)
```
URI: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Click "Copy" next to each one and save them somewhere safe.**

---

## Step 4: Configure Your Project

1. **Copy the environment template:**
   ```bash
   cd ~/git/Budget-v-Actual-App
   cp prisma/.env.example prisma/.env
   ```

2. **Edit `prisma/.env`:**
   ```bash
   # Use your favorite editor
   code prisma/.env
   # or
   nano prisma/.env
   ```

3. **Paste your connection strings:**
   ```env
   # Transaction pooler (for serverless - Cloudflare Workers)
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Direct connection (for migrations and Prisma Studio)
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   # Other settings (add these later)
   CLAUDE_API_KEY="sk-ant-..."
   ENCRYPTION_KEY="your-32-byte-hex-key-here"
   NODE_ENV="development"
   ```

4. **Replace placeholders:**
   - `[PROJECT-REF]` - Your project reference (in the URL)
   - `[YOUR-PASSWORD]` - The database password you created
   - `[REGION]` - Your selected region (e.g., `us-east-1`)

---

## Step 5: Initialize Database

1. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

2. **Create database tables:**
   ```bash
   npm run db:migrate:dev
   ```

   When prompted for migration name, enter:
   ```
   initial_schema
   ```

3. **Seed with default categories:**
   ```bash
   npx prisma db seed
   ```

---

## Step 6: Verify Setup

### Option A: Prisma Studio (GUI)
```bash
npm run db:studio
```

Opens at http://localhost:5555 - you should see:
- User table with test user
- Category table with 12 default categories
- Account table with test account
- Other tables (empty)

### Option B: Supabase Dashboard
1. Go to your Supabase project
2. Click **"Table Editor"** in sidebar
3. You should see all your tables!

---

## Step 7: Test the Application

1. **Start dev servers:**
   ```bash
   npm run dev
   ```

2. **Open frontend:**
   http://localhost:3000

3. **Test backend:**
   ```bash
   curl http://localhost:8787/api/health
   # Should return: {"status":"ok"}
   ```

---

## Troubleshooting

### Error: "Can't reach database server"

**Check:**
1. Connection strings are correct in `prisma/.env`
2. Password is correct (no special characters escaped)
3. Internet connection is working
4. Supabase project is active (not paused)

**Fix:**
- Go to Supabase dashboard → Settings → Database
- Copy connection strings again
- Make sure you selected "Transaction pooler (recommended)"

### Error: "SSL connection required"

**Add to your DATABASE_URL:**
```
?sslmode=require
```

Full example:
```
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
```

### Error: "Migration failed"

**Solution:**
```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### Database is empty after migration

**Run seed again:**
```bash
npx prisma db seed
```

---

## Supabase Features You Get (Bonus!)

### 1. Built-in Authentication
Supabase includes auth (email, OAuth, etc.) - might use later!

### 2. Database GUI
Better than Prisma Studio:
- Real-time updates
- Query builder
- Table relationships visualized

### 3. Storage
If you want to store receipt images (not in spec yet):
- 1GB free storage
- CDN included
- Easy integration

### 4. Real-time Subscriptions
Listen to database changes in real-time (future feature potential)

---

## Cost & Limits

### Free Tier Includes:
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ 2GB file storage
- ✅ Unlimited API requests

### For Personal Use (You + Wife):
- **Expected DB size**: ~10-50MB (years of data)
- **Bandwidth**: ~100MB/month
- **Users**: 2
- **Result**: Free tier is plenty!

### If You Exceed Free Tier:
- Paid tier: $25/month (you won't need this)
- Automatic warnings before hitting limits

---

## Security Best Practices

### 1. Protect Your .env File
```bash
# Already in .gitignore, but double-check:
cat .gitignore | grep .env
# Should show: .env
```

### 2. Row-Level Security (RLS)
Supabase supports RLS - not needed yet, but available for Phase 2.

### 3. Connection Pooling
We're using `pgbouncer=true` - this is optimal for serverless.

### 4. Backup Strategy
Supabase auto-backups on paid tier. For free tier:
```bash
# Manual backup (optional)
pg_dump $DATABASE_URL > backup.sql
```

---

## Next Steps

✅ Supabase set up
✅ Database initialized
✅ Seed data loaded
✅ Application running

**Now ready for:** Phase 1A - Core MVP Development!

See `docs/GETTING_STARTED.md` for development workflow.

---

## Useful Supabase Commands

```bash
# Open database in Supabase dashboard
open https://app.supabase.com/project/_/editor

# View logs
open https://app.supabase.com/project/_/logs/explorer

# Check database size
# (In Supabase: Settings → Database → Usage)
```

---

## Migration from Supabase (Future)

If you ever want to move to another database:

**Prisma makes it easy:**
1. Update `DATABASE_URL` in `.env`
2. Run `npx prisma migrate deploy`
3. Done!

**To Cloudflare D1:**
1. Change `provider` to `sqlite` in `schema.prisma`
2. Add D1 bindings to `wrangler.toml`
3. Regenerate and migrate

**To Another PostgreSQL (Neon, Railway, etc.):**
1. Change `DATABASE_URL` to new connection string
2. Run migrations
3. Done!

---

## Resources

- **Supabase Dashboard**: https://app.supabase.com
- **Supabase Docs**: https://supabase.com/docs
- **Prisma + Supabase**: https://supabase.com/docs/guides/integrations/prisma
- **Support**: Supabase Discord - https://discord.supabase.com

---

## Summary

🎉 **Supabase is now your database backend!**

**What you have:**
- Free PostgreSQL database (500MB)
- Connection pooling for serverless
- Database GUI
- Automatic backups (paid tier)
- Scalability when needed

**Cost**: $0/month for personal use

**Next**: Start building features! See Phase 1A in the specification.
