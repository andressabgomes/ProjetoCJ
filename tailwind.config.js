/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'h1-mobile': ['2.25rem', { lineHeight: '1.05', fontWeight: '700' }], // 36px
        'h1-tablet': ['2.625rem', { lineHeight: '1.05', fontWeight: '700' }], // 42px
        'h1-desktop': ['4rem', { lineHeight: '1.05', fontWeight: '700' }], // 64px
        'h1-xl': ['4.5rem', { lineHeight: '1.05', fontWeight: '700' }], // 72px
        'h2': ['2.25rem', { lineHeight: '1.1', fontWeight: '700' }], // 36px
        'h2-large': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 40px
        'h3': ['1.5rem', { lineHeight: '1.15', fontWeight: '700' }], // 24px
        'h3-large': ['1.75rem', { lineHeight: '1.15', fontWeight: '700' }], // 28px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
        'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
        'body-medium': ['1rem', { lineHeight: '1.5', fontWeight: '500' }], // 16px
        'body-large-medium': ['1.125rem', { lineHeight: '1.6', fontWeight: '500' }], // 18px
        'label': ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }], // 12px
        'label-large': ['0.875rem', { lineHeight: '1.3', fontWeight: '500' }], // 14px
      },
      colors: {
        'text': {
          'primary': '#111111',
          'secondary': '#222222',
          'tertiary': '#444444',
          'muted': '#666666',
        }
      },
      lineHeight: {
        'tight': '1.05',
        'snug': '1.1',
        'compact': '1.15',
        'normal': '1.5',
        'relaxed': '1.6',
      }
    },
  },
  plugins: [],
};
