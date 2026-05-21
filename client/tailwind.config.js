/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        aqua: 'rgb(var(--aqua-blue) / <alpha-value>)',
        water: 'rgb(var(--water-blue) / <alpha-value>)',
        ocean: 'rgb(var(--deep-ocean) / <alpha-value>)',
        nature: 'rgb(var(--natural-green) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        // AquaticPose deep underwater palette
        abyss: {
          DEFAULT: '#051C1C',
          50: '#0a3838',
          100: '#082d2d',
          200: '#062424',
          300: '#051C1C',
          400: '#031414',
          500: '#020e0e',
        },
        neon: {
          cyan: '#00FFD1',
          green: '#39FF14',
          teal: '#00E5CC',
        },
        coral: {
          DEFAULT: '#FF6B35',
          light: '#FF8C5A',
          dark: '#E55A2B',
        },
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'script': ['Dancing Script', 'cursive'],
        'headline': ['Fraunces', 'Georgia', 'serif'],
        'body': ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        blob: 'blob 7s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'float-gentle-delayed': 'float-gentle 8s ease-in-out infinite 2s',
        'shimmer-slide': 'shimmer-slide 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 209, 0.15), 0 0 40px rgba(0, 255, 209, 0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 209, 0.3), 0 0 60px rgba(0, 255, 209, 0.1)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer-slide': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 209, 0.3), 0 0 40px rgba(0, 255, 209, 0.1)',
        'glow-coral': '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
