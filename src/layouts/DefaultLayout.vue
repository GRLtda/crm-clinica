<script setup>
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  background-color: var(--branco);
}
.main-content {
  flex: 1;
  padding: 2rem;
  height: 100vh;
  overflow-y: auto;
}
</style>
