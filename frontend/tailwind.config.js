/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#1a73e8', 'primary-dark': '#1558b8', 'secondary': '#f1f3f4',
        'background': '#ffffff', 'text-primary': '#202124', 'text-secondary': '#5f6368',
      }
    },
  },
  plugins: [],
}