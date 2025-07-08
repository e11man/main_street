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
      // Custom color palette using CSS custom properties for theming
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        accent1: 'var(--accent1)',
        'accent1-light': 'var(--accent1-light)',
        'accent1-dark': 'var(--accent1-dark)',
        accent2: 'var(--accent2)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        // Legacy specific colors (these can remain hardcoded)
        'taylor-purple': '#522D72',
        'legacy-gold': '#B68D40',
        'legacy-gold-light': '#D2BB8C',
      },
      // Custom font families using CSS custom properties
      fontFamily: {
        montserrat: 'var(--font-montserrat)',
        'source-serif': 'var(--font-source-serif)',
      },
      // Custom border radii using CSS custom properties
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      // Custom box shadows using CSS custom properties
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-default)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
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
