/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f5f6fa',
          100: '#eceef5',
          200: '#dcdfeb',
          300: '#c1c6da',
          400: '#9298b3',
          500: '#6b7290',
          600: '#4d5370',
          700: '#363c56',
          800: '#232840',
          900: '#161a2e',
          950: '#0d1020',
        },
        paper: {
          50: '#fdfcfa',
          100: '#f7f5ef',
          200: '#efebe0',
        },
        brand: {
          50: '#eef1fb',
          100: '#dbe2f6',
          200: '#aebbe6',
          500: '#2a4293',
          600: '#1d3584',
          700: '#173179',
          800: '#122660',
        },
      },
      boxShadow: {
        sheet: '0 1px 2px rgba(23,49,121,0.05), 0 12px 32px -14px rgba(23,49,121,0.22)',
        float: '0 10px 26px -8px rgba(23,49,121,0.35)',
      },
      keyframes: {
        drawCheck: {
          '0%': { strokeDashoffset: '48' },
          '100%': { strokeDashoffset: '0' },
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ringPulse: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        rise: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        drawCheck: 'drawCheck 0.5s 0.3s cubic-bezier(0.65,0,0.35,1) forwards',
        popIn: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        ringPulse: 'ringPulse 1.6s cubic-bezier(0,0,0.3,1) infinite',
        shake: 'shake 0.35s ease-in-out',
        rise: 'rise 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [],
}
