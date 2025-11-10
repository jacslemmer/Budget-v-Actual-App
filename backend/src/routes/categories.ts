import { Hono } from 'hono';
import type { Env } from '../types/env';

const categories = new Hono<{ Bindings: Env }>();

// GET /api/categories - Get all categories for current user
categories.get('/', async (c) => {
  try {
    // TODO: Replace with real database queries
    // Mock data for now to get the UI working
    const now = new Date();
    const mockCategories = [
      { id: 'cat-groceries', name: 'Groceries', icon: '🛒', color: '#10b981', monthlyBudget: 6000, actualSpend: 4200, transactionCount: 15 },
      { id: 'cat-transport', name: 'Transport', icon: '🚗', color: '#3b82f6', monthlyBudget: 3000, actualSpend: 2800, transactionCount: 8 },
      { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6', monthlyBudget: 1500, actualSpend: 900, transactionCount: 5 },
      { id: 'cat-dining-out', name: 'Dining Out', icon: '🍽️', color: '#f59e0b', monthlyBudget: 2000, actualSpend: 1600, transactionCount: 12 },
      { id: 'cat-utilities', name: 'Utilities', icon: '💡', color: '#6366f1', monthlyBudget: 2500, actualSpend: 2400, transactionCount: 4 },
      { id: 'cat-health-medical', name: 'Health & Medical', icon: '⚕️', color: '#ec4899', monthlyBudget: 1000, actualSpend: 500, transactionCount: 2 },
      { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', color: '#14b8a6', monthlyBudget: 2000, actualSpend: 1200, transactionCount: 7 },
      { id: 'cat-insurance', name: 'Insurance', icon: '🛡️', color: '#0ea5e9', monthlyBudget: 3000, actualSpend: 3000, transactionCount: 1 },
      { id: 'cat-education', name: 'Education', icon: '📚', color: '#a855f7', monthlyBudget: 1000, actualSpend: 0, transactionCount: 0 },
      { id: 'cat-personal-care', name: 'Personal Care', icon: '💅', color: '#f97316', monthlyBudget: 800, actualSpend: 650, transactionCount: 6 },
      { id: 'cat-savings', name: 'Savings', icon: '💰', color: '#22c55e', monthlyBudget: 0, actualSpend: 0, transactionCount: 0 },
      { id: 'cat-uncategorized', name: 'Uncategorized', icon: '❓', color: '#64748b', monthlyBudget: 0, actualSpend: 350, transactionCount: 3 },
    ];

    const categoriesWithPercent = mockCategories.map((cat) => ({
      ...cat,
      percentUsed: cat.monthlyBudget > 0
        ? Math.round((cat.actualSpend / cat.monthlyBudget) * 100)
        : 0,
    }));

    return c.json({
      categories: categoriesWithPercent,
      month: now.toISOString().slice(0, 7), // YYYY-MM format
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json(
      {
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default categories;
