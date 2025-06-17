/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure Tailwind scans all your component and page files for classes
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom color palette matching your original style.css variables
      colors: {
        primary: '#1B365F',
        'primary-light': '#284B87',
        'primary-dark': '#14284A',
        accent1: '#00AFCE',
        'accent1-light': '#00C4E6',
        'accent1-dark': '#0095AF',
        accent2: '#E14F3D',
        'text-primary': '#2C2C2E',
        'text-secondary': '#6C6C70',
        'text-tertiary': '#8E8E93',
        background: '#FFFFFF',
        surface: '#F8F8F9',
        'surface-hover': '#F1F5F9',
        border: '#E2E8F0',
        'border-light': '#F1F5F9',
        // Added custom colors
        'taylor-purple': '#522D72',
        'legacy-gold': '#B68D40',
        'legacy-gold-light': '#D2BB8C',
      },
      // Custom font families
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        'source-serif': ['Source Serif 4', 'serif'],
      },
      // Custom border radii
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      // Custom box shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      // Custom keyframes for animations
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInMessageBox: {
          'from': { opacity: '0', transform: 'translate(-50%, -60%)' },
          'to': { opacity: '1', transform: 'translate(-50%, -50%)' },
        }
      },
      // Custom animation durations/properties
      animation: {
        fadeIn: 'fadeIn 0.3s ease forwards',
        slideUp: 'slideUp 0.3s ease forwards',
        float: 'float 2s ease-in-out infinite',
        pulse: 'pulse 1.5s ease infinite',
        shimmer: 'shimmer 2s infinite',
        fadeInMessageBox: 'fadeInMessageBox 0.3s forwards',
      },
      // Fluid typography clamp values
      // Example: text-clamp-36-64 would be clamp(2.25rem, 5vw, 4rem)
      fontSize: {
        'clamp-36-64': 'clamp(2.25rem, 5vw, 4rem)',
        'clamp-18-24': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'clamp-32-48': 'clamp(2rem, 4vw, 3rem)',
      }
    },
  },
  plugins: [],
};
