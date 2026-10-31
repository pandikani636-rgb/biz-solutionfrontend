/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
        },
        navy: {
          DEFAULT: '#1E3A8A',
          dark: '#172554',
          light: '#1E40AF',
        },
        lightBlue: '#EFF6FF',
        accent: {
          DEFAULT: '#FACC15',
          hover: '#EAB308',
          light: '#FEF08A',
        },
        darkText: '#111827',
        secondaryText: '#64748B',
        pageBg: '#F8FAFC',
        success: '#16A34A',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
