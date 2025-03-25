// @ts-ignore
export default defineNuxtConfig({
  modules: ['nuxt-electron'],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  electron: {
    build: [
      {
        entry: 'electron/main.js'
      }
    ]
  },
  devtools: {
    enabled: true
  },
  compatibilityDate: '2025-03-22'
})