import { http, HttpResponse } from 'msw';
import type { CategoriesResponse } from '../../lib/api';

const API_BASE_URL = 'http://localhost:8787';

export const mockCategories: CategoriesResponse = {
  categories: [
    {
      id: 'cat-groceries',
      name: 'Groceries',
      icon: '🛒',
      color: '#10b981',
      monthlyBudget: 6000,
      actualSpend: 4200,
      transactionCount: 15,
      percentUsed: 70,
    },
    {
      id: 'cat-transport',
      name: 'Transport',
      icon: '🚗',
      color: '#3b82f6',
      monthlyBudget: 3000,
      actualSpend: 2800,
      transactionCount: 8,
      percentUsed: 93,
    },
    {
      id: 'cat-entertainment',
      name: 'Entertainment',
      icon: '🎬',
      color: '#8b5cf6',
      monthlyBudget: 1500,
      actualSpend: 1600,
      transactionCount: 5,
      percentUsed: 107,
    },
  ],
  month: '2025-11',
};

export const handlers = [
  http.get(`${API_BASE_URL}/api/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),
];
