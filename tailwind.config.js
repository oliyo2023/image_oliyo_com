// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 深色主题基色
        page: '#0F1115',
        surface1: '#1A1D22',
        surface2: '#23262B',
        border: '#2B3036',
        // 文本
        textPrimary: '#E6E8EA',
        textSecondary: '#9BA1A6',
        textMuted: '#6F7881',
        // 品牌/强调
        primary: '#10B981',        // 稳定的霓虹绿
        primaryHover: '#059669',
        // 状态色
        success: '#10B981',
        warning: '#F5A623',
        error: '#FF4D4F',
        info: '#3B82F6',
      },
      boxShadow: {
        glow: '0 0 0 2px rgba(16,185,129,0.35)',
      },
    },
  },
  plugins: [],
}