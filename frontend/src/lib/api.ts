const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number;
  actualSpend: number;
  transactionCount: number;
  percentUsed: number;
}

export interface CategoriesResponse {
  categories: Category[];
  month: string;
}

export const categoriesApi = {
  getAll: async (): Promise<CategoriesResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json() as Promise<CategoriesResponse>;
  },
};
