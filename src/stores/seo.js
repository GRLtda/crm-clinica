import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSeoStore = defineStore('seo', () => {
  const themeColor = ref('#3b82f6') // Cor principal do tema para a PWA

  function setThemeColor(newColor) {
    themeColor.value = newColor
    // Verifica se a tag existe antes de tentar alterá-la
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', newColor)
    }
  }

  return {
    themeColor,
    setThemeColor,
  }
})
