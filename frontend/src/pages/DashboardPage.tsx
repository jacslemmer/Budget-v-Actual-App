import BudgetOverview from '../components/BudgetOverview';

export default function DashboardPage(): JSX.Element {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome to your budget overview
        </p>
      </div>

      <BudgetOverview />
    </div>
  );
}
