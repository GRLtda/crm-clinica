<script setup>
import { RouterView, useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main
      class="main-content"
      :class="{ 'no-padding': route.meta.layout?.noPadding }"
    >
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

.main-content.no-padding {
  padding: 0;
}
</style>
