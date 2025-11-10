import { describe, it, expect } from 'vitest';
import { categoriesApi } from './api';
import { mockCategories } from '../test/mocks/handlers';

describe('categoriesApi', () => {
  describe('getAll', () => {
    it('should fetch categories successfully', async () => {
      const result = await categoriesApi.getAll();

      expect(result).toEqual(mockCategories);
      expect(result.categories).toHaveLength(3);
      expect(result.month).toBe('2025-11');
    });

    it('should return categories with correct structure', async () => {
      const result = await categoriesApi.getAll();
      const firstCategory = result.categories[0];

      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('icon');
      expect(firstCategory).toHaveProperty('color');
      expect(firstCategory).toHaveProperty('monthlyBudget');
      expect(firstCategory).toHaveProperty('actualSpend');
      expect(firstCategory).toHaveProperty('transactionCount');
      expect(firstCategory).toHaveProperty('percentUsed');
    });

    it('should calculate percentUsed correctly', async () => {
      const result = await categoriesApi.getAll();

      const groceries = result.categories.find((c) => c.id === 'cat-groceries');
      expect(groceries?.percentUsed).toBe(70);

      const transport = result.categories.find((c) => c.id === 'cat-transport');
      expect(transport?.percentUsed).toBe(93);

      const entertainment = result.categories.find((c) => c.id === 'cat-entertainment');
      expect(entertainment?.percentUsed).toBe(107);
    });
  });
});
