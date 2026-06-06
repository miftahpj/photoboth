/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        display:  ['"Special Elite"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
        courier:  ['"Courier Prime"', 'monospace'],
        mono:     ['"Courier Prime"', 'monospace'],
      },
      colors: {
        airmail: {
          red:    '#C0392B',
          blue:   '#1A3A6B',
          cream:  '#F5EDD6',
          tan:    '#D4B896',
          ink:    '#2C1A0E',
          stamp:  '#8B4513',
          stripe: '#E8D5B0',
        },
        brand: {
          primary:   '#C0392B',
          secondary: '#1A3A6B',
          accent:    '#D4A017',
          bg:        '#F5EDD6',
          dark:      '#2C1A0E',
        }
      },
      backgroundImage: {
        'airmail-stripe': 'repeating-linear-gradient(45deg, #C0392B 0px, #C0392B 8px, #FFFFFF 8px, #FFFFFF 16px, #1A3A6B 16px, #1A3A6B 24px)',
        'paper-texture':  'url("/assets/paper-bg.png")',
      },
      boxShadow: {
        'stamp':  '2px 2px 0 rgba(44,26,14,0.3), 4px 4px 0 rgba(44,26,14,0.1)',
        'photo':  '0 2px 8px rgba(44,26,14,0.25)',
        'frame':  '0 8px 32px rgba(44,26,14,0.35)',
        'inset-paper': 'inset 0 0 60px rgba(212,184,150,0.3)',
      },
      animation: {
        'countdown': 'countdown 1s ease-in-out',
        'flash':     'flash 0.3s ease-out',
        'stamp-in':  'stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-up':   'fadeUp 0.5s ease-out',
        'shake':     'shake 0.5s ease-in-out',
      },
      keyframes: {
        countdown: {
          '0%':   { transform: 'scale(2)', opacity: '0' },
          '50%':  { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.8' },
        },
        flash: {
          '0%':   { opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        stampIn: {
          '0%':   { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-3deg)', opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':      { transform: 'translateX(-8px)' },
          '75%':      { transform: 'translateX(8px)' },
        },
      },
      borderWidth: { '3': '3px', '6': '6px' },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
