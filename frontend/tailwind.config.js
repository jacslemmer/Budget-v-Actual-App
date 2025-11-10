/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',    // blue-600
        success: '#10b981',    // green-500
        warning: '#f59e0b',    // amber-500
        danger: '#ef4444',     // red-500
        neutral: '#64748b',    // slate-500
      },
    },
  },
  plugins: [],
};
