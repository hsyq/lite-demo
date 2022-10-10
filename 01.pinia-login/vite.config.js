import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const { command } = config
  return {
    plugins: [
      vue(),
      viteMockServe({
        localEnabled: command === 'serve'
      })
    ]
  }
})
