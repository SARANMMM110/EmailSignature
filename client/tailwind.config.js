/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'Segoe UI', 'sans-serif'],
        gallery: ['"DM Sans"', 'system-ui', 'Segoe UI', 'sans-serif'],
        'gallery-serif': ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(15 23 42 / 0.06), 0 10px 25px -5px rgb(15 23 42 / 0.08)',
        'card-hover': '0 12px 40px -8px rgb(37 99 235 / 0.15), 0 4px 16px -4px rgb(15 23 42 / 0.1)',
        'sidebar': '4px 0 24px -4px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
