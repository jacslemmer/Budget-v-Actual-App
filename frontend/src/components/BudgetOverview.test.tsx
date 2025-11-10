import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test/test-utils';
import BudgetOverview from './BudgetOverview';

describe('BudgetOverview', () => {
  it('should render loading state initially', () => {
    render(<BudgetOverview />);
    expect(screen.getByText('Loading your budget...')).toBeInTheDocument();
  });

  it('should render categories after loading', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
    });
  });

  it('should display monthly overview summary', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      expect(screen.getByText(/Monthly Overview/)).toBeInTheDocument();
      expect(screen.getByText(/2025-11/)).toBeInTheDocument();
    });
  });

  it('should display correct budget amounts', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      // Total budget: 6000 + 3000 + 1500 = 10,500 (formatted as "R 10 500")
      expect(screen.getByText(/R 10 500/)).toBeInTheDocument();

      // Total spent: 4200 + 2800 + 1600 = 8,600 (formatted as "R 8 600")
      expect(screen.getByText(/R 8 600/)).toBeInTheDocument();
    });
  });

  it('should display category cards with transaction counts', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      expect(screen.getByText('15 transactions')).toBeInTheDocument();
      expect(screen.getByText('8 transactions')).toBeInTheDocument();
      expect(screen.getByText('5 transactions')).toBeInTheDocument();
    });
  });

  it('should display percentage badges', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('93%')).toBeInTheDocument();
      expect(screen.getByText('107%')).toBeInTheDocument();
    });
  });

  it('should show correct color coding for budget status', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      const percentBadges = screen.getAllByText(/\d+%/);

      // 70% should have green styling (not near limit, not over budget)
      const groceriesBadge = percentBadges.find((el) => el.textContent === '70%');
      expect(groceriesBadge).toHaveClass('bg-green-100', 'text-green-700');

      // 93% should have amber styling (near limit)
      const transportBadge = percentBadges.find((el) => el.textContent === '93%');
      expect(transportBadge).toHaveClass('bg-amber-100', 'text-amber-700');

      // 107% should have red styling (over budget)
      const entertainmentBadge = percentBadges.find((el) => el.textContent === '107%');
      expect(entertainmentBadge).toHaveClass('bg-red-100', 'text-red-700');
    });
  });

  it('should display category icons', async () => {
    render(<BudgetOverview />);

    await waitFor(() => {
      expect(screen.getByText('🛒')).toBeInTheDocument();
      expect(screen.getByText('🚗')).toBeInTheDocument();
      expect(screen.getByText('🎬')).toBeInTheDocument();
    });
  });
});
