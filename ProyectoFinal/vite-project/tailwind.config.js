/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': {
            transform: 'translate(-50%, -60%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translate(-50%, -50%)',
            opacity: '1',
          },
        },
        'slide-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.5s ease-out',
        'slide-out': 'slide-out 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

