export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        surface: '#1A1A1A',
        surface2: '#222222',
        'border-col': '#2A2A2A',
        accent: '#7C5CFC',
        'text-primary': '#F0F0F0',
        'text-muted': '#888888',
        'text-dim': '#555555',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
}
