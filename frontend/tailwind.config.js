export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { primary: '#2563EB', secondary: '#EF4444' },
      animation: { 'fade-in': 'fadeIn 0.5s', 'slide-up': 'slideUp 0.3s' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }, slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } } }
    }
  },
  plugins: []
};
