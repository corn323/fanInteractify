// @ts-ignore
export default defineNuxtConfig({
  modules: ['nuxt-electron'],

  electron: {
    build: [
      {
        entry: 'electron/main.js'
      }
    ]
  },

  compatibilityDate: '2025-03-22'
})