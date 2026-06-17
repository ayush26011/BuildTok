/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maroon: {
          dark: '#561C24',
          mid: '#6D2932',
          light: '#8B3A45',
          glow: 'rgba(86,28,36,0.35)',
        },
        beige: {
          warm: '#C7B7A3',
          DEFAULT: '#C7B7A3',
          light: '#D9CCBA',
        },
        cream: {
          DEFAULT: '#E8D8C4',
          light: '#F5EDE0',
          dark: '#D4C4AE',
        },
      },
      fontFamily: {
        satoshi: ['Satoshi', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      backgroundImage: {
        'maroon-gradient': 'linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A45 100%)',
        'cream-gradient': 'linear-gradient(135deg, #F5EDE0 0%, #E8D8C4 50%, #D4C4AE 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(86,28,36,0.25) 0%, transparent 70%)',
      },
      boxShadow: {
        'maroon': '0 4px 24px rgba(86,28,36,0.3)',
        'maroon-lg': '0 8px 48px rgba(86,28,36,0.4)',
        'glass': '0 8px 32px rgba(86,28,36,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        'glass-lg': '0 16px 64px rgba(86,28,36,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
        'float': '0 20px 60px rgba(86,28,36,0.25)',
        'inner-glow': 'inset 0 0 30px rgba(86,28,36,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'spin-slow': 'spin 12s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'counter': 'counter 2s ease-out forwards',
        'particle': 'particle 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(86,28,36,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(86,28,36,0.6), 0 0 80px rgba(86,28,36,0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
