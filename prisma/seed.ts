import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default categories from specification (Section 4.2)
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
  { name: 'Uncategorized', icon: '❓', color: '#64748b', budget: 0 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'jacs@example.com' },
    update: {},
    create: {
      email: 'jacs@example.com',
      name: 'Jacs Lemmer',
      role: 'OWNER',
      householdId: 'household-1',
    },
  });

  console.log(`✓ Created user: ${user.name}`);

  // Create default categories
  for (const [index, cat] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { id: `cat-${cat.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `cat-${cat.name.toLowerCase().replace(/\s/g, '-')}`,
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        monthlyBudget: cat.budget,
        order: index,
      },
    });
    console.log(`✓ Created category: ${cat.name}`);
  }

  // Create test account
  await prisma.account.create({
    data: {
      userId: user.id,
      bankName: 'FNB',
      accountType: 'CHECKING',
      accountName: 'Jacs FNB Cheque',
      accountNumber: '1234', // Last 4 digits only
      currency: 'ZAR',
    },
  });

  console.log('✓ Created test account');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
