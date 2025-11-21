/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          purple: '#7c3aed',
        },
        secondary: {
          blue: '#3b82f6',
          gray: {
            dark: '#1f2937',
            medium: '#6b7280', 
            light: '#f3f4f6'
          }
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      },
      boxShadow: {
        'smooth': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'smooth-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}