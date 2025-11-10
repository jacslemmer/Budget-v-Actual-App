import { useQuery } from '@tanstack/react-query';
import { categoriesApi, type Category } from '../lib/api';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps): JSX.Element => {
  const isOverBudget = category.percentUsed > 100;
  const isNearLimit = category.percentUsed > 80 && category.percentUsed <= 100;

  const getProgressColor = (): string => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{category.name}</h3>
            <p className="text-sm text-slate-500">
              {category.transactionCount} transactions
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            isOverBudget
              ? 'bg-red-100 text-red-700'
              : isNearLimit
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {category.percentUsed}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${Math.min(category.percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-lg font-bold text-slate-800">
            {formatCurrency(category.actualSpend)}
          </p>
          <p className="text-xs text-slate-500">spent</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            of {formatCurrency(category.monthlyBudget)}
          </p>
          <p className="text-xs text-slate-500">
            {formatCurrency(category.monthlyBudget - category.actualSpend)}{' '}
            remaining
          </p>
        </div>
      </div>
    </div>
  );
};

export default function BudgetOverview(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Failed to load categories
        </h3>
        <p className="text-red-600 text-sm">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }

  if (!data?.categories || data.categories.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <p className="text-slate-600">No categories found</p>
      </div>
    );
  }

  const totalBudget = data.categories.reduce(
    (sum, cat) => sum + cat.monthlyBudget,
    0
  );
  const totalSpend = data.categories.reduce(
    (sum, cat) => sum + cat.actualSpend,
    0
  );
  const overallPercent = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Monthly Overview - {data.month}
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalBudget - totalSpend)}
            </p>
            <p className="text-blue-100 text-xs mt-1">{overallPercent}% used</p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
