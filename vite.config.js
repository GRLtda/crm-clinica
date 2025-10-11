import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createHash } from 'node:crypto'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {},
      },
      customElement: false,
      script: {
        getHash: (content) => createHash('sha256').update(content).digest('hex'),
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
