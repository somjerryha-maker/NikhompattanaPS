import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS configuration
 *
 * Tailwind จะสแกนไฟล์ในโฟลเดอร์ `src` และ `public/index.html` เพื่อค้นหาคลาสต่าง ๆ
 * แล้วสร้าง CSS ตามการใช้งานจริง
 */
export default {
  content: [
    './public/index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#f97316',
      },
    },
  },
  plugins: [],
} satisfies Config;