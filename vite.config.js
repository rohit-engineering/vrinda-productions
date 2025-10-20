import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/vrinda-productions/',  // <-- your GitHub repo name
  plugins: [vue()]
})
