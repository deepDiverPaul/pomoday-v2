import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './',
    define: {
      'process.env.TRACKING': JSON.stringify(env.TRACKING || ''),
      'process.env.GAID': JSON.stringify(env.GAID || ''),
      'process.env.API_URL': JSON.stringify(env.API_URL || ''),
    },
  };
});
