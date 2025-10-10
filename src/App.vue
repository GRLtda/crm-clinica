<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSeoStore } from '@/stores/seo'

const authStore = useAuthStore()
const seoStore = useSeoStore()

watch(
  () => authStore.user?.clinic,
  (newClinic) => {
    if (newClinic && newClinic.themeColor) {
      seoStore.setThemeColor(newClinic.themeColor)
    } else {
      seoStore.setThemeColor('#3b82f6')
    }
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>

<style></style>
