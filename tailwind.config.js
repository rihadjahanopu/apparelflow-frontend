/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        traffic: {
          green: {
            bg: '#ecfdf5',
            border: '#059669',
            text: '#064e3b',
            badge: '#10b981',
          },
          yellow: {
            bg: '#fffbeb',
            border: '#d97706',
            text: '#78350f',
            badge: '#f59e0b',
          },
          red: {
            bg: '#fef2f2',
            border: '#dc2626',
            text: '#7f1d1d',
            badge: '#ef4444',
          },
        },
      },
    },
  },
  plugins: [],
};

