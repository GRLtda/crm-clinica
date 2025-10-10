<script setup>
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // 👈 Importar a store de autenticação
import Sidebar from '@/components/layout/Sidebar.vue'
import { Menu } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore() // 👈 Inicializar a store
const isMobileSidebarOpen = ref(false)
</script>

<template>
  <div class="app-layout">
    <Sidebar
      class="sidebar-component"
      :class="{ 'is-mobile-open': isMobileSidebarOpen }"
      @close="isMobileSidebarOpen = false"
    />

    <div
      v-if="isMobileSidebarOpen"
      @click="isMobileSidebarOpen = false"
      class="sidebar-overlay"
    ></div>

    <main class="main-content" :class="{ 'no-padding': route.meta.layout?.noPadding }">
      <header class="mobile-header">
        <button @click="isMobileSidebarOpen = true" class="hamburger-button">
          <Menu :size="24" />
        </button>
        <div class="clinic-info-mobile">
          <div class="clinic-logo-mobile">
            <img
              v-if="authStore.user?.clinic?.logoUrl"
              :src="authStore.user.clinic.logoUrl"
              alt="Logo da Clínica"
            />
            <span v-else>{{ authStore.user?.clinic?.name?.charAt(0) || 'C' }}</span>
          </div>
          <span class="clinic-name-mobile">{{ authStore.user?.clinic?.name }}</span>
        </div>
      </header>
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

.mobile-header {
  display: none; /* Escondido no desktop */
  align-items: center;
  gap: 1rem; /* Espaçamento entre o hamburger e o logo */
  margin-bottom: 1.5rem;
}
.hamburger-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: -0.5rem; /* Alinhamento visual */
}

/* ✨ Novos estilos para as informações da clínica no header mobile */
.clinic-info-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.clinic-logo-mobile {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 0.375rem; /* Levemente arredondado */
  background-color: var(--branco);
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.clinic-logo-mobile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.clinic-name-mobile {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--preto);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 4999;
}

/* Breakpoint para tablets e celulares */
@media (max-width: 1024px) {
  /* ✨ Padding reduzido no mobile */
  .main-content {
    padding: 1.5rem 1rem;
  }
  .main-content.no-padding {
    padding: 0;
  }
  .sidebar-component {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5000;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
  }
  .sidebar-component.is-mobile-open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
  }
  .mobile-header {
    display: flex;
  }
}
</style>
