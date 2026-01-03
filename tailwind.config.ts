import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Japanese inspired
        sakura: {
          DEFAULT: '#FFB7C5',
          dark: '#FF8FA3',
          light: '#FFE4E9',
        },
        indigo: {
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          dark: '#3730A3',
        },

        // Feedback colors
        correct: '#22C55E',
        wrong: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Dark mode neutral palette
        bg: {
          primary: '#0F0F0F',
          secondary: '#1A1A1A',
          card: '#262626',
          elevated: '#333333',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
        },

        // Japanese aesthetic colors
        washi: '#F5F5DC',
        sumi: '#1C1C1C',
        matcha: '#9BC53D',
        fuji: '#E0E7FF',

        // Legacy support
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        japanese: ['var(--font-noto-sans-jp)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'wave': 'audio-wave 1.2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
      },
      keyframes: {
        'audio-wave': {
          '0%, 60%, 100%': { transform: 'scaleY(0.3)' },
          '30%': { transform: 'scaleY(1)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
