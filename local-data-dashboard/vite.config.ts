import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config with React plugin and environment variable injection
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Make Vite env variables accessible through import.meta.env
      'process.env': env,
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
    },
  };
});