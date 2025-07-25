/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: 'hsl(243, 80%, 62%)', // Indigo
          'dark': 'hsl(243, 80%, 58%)',
        },
        'background': 'hsl(210, 40%, 98%)', // Very light slate gray
        'surface': 'hsl(0, 0%, 100%)',      // White for cards
        'text-primary': 'hsl(215, 28%, 17%)', // Dark slate
        'text-secondary': 'hsl(217, 19%, 55%)',
        'border': 'hsl(210, 40%, 90%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};