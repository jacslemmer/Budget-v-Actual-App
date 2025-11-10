import { useState } from 'react';

function App(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          CashFlow Manager
        </h1>
        <p className="text-slate-600 mb-8">
          AI-Powered Budget Tracking & Receipt Scanning
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-lg mb-4">Project Initialized Successfully</p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Count: {count}
          </button>
          <p className="mt-6 text-sm text-slate-500">
            Ready for Phase 0: Research & Setup
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
