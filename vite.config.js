import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 1. Importe o 'path' do Node.js
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // 2. Adicione a configuração de 'resolve' para criar o apelido
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
