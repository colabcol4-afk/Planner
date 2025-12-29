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
        brand: {
          cyan: '#00D2FF',
          blue: '#3A7BD5',
          violet: '#6A00F4',
        },
        heading: '#1E293B',
        body: '#64748B',
        offwhite: '#F8F9FA',
        'slate-grey': '#CBD5E1',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.08', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.15', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h5': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],
        'tiny': ['0.6875rem', { lineHeight: '1.3', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '40px',
        '3xl': '48px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(30, 41, 59, 0.04)',
        'elevation-2': '0 6px 18px rgba(30, 41, 59, 0.06)',
        'brand': '0 6px 18px rgba(58, 123, 213, 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 50%, #6A00F4 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #00B8E6 0%, #3470C0 50%, #5E00DB 100%)',
      },
      transitionDuration: {
        'fast': '120ms',
        'medium': '200ms',
        'slow': '360ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.2, 0.9, 0.15, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.2, 0.9, 0.15, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.2, 0.9, 0.15, 1)',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.4s infinite',
        'meteor': 'meteor 5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        typing: {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
