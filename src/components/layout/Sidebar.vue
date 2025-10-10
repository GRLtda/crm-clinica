<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import UserDropdown from '@/components/global/UserDropdown.vue'
import ClinicDropdown from '@/components/global/ClinicDropdown.vue'
import {
  LayoutDashboard,
  Calendar,
  Users,
  LifeBuoy,
  Settings,
  MoreHorizontal,
  X, // ✨ Importar o ícone de fechar
} from 'lucide-vue-next'

const emit = defineEmits(['close']) // ✨ Definir o evento que o componente pode emitir

const authStore = useAuthStore()
const isUserDropdownOpen = ref(false)
const isClinicDropdownOpen = ref(false)

const mainNavLinks = [
  { icon: LayoutDashboard, text: 'Resumo', to: '/app' },
  { icon: Calendar, text: 'Atendimentos', to: '/app/atendimentos' },
  { icon: Users, text: 'Pacientes', to: '/app/pacientes' },
]

const utilityNavLinks = [
  { icon: LifeBuoy, text: 'Ajuda', to: '/app/ajuda' },
  { icon: Settings, text: 'Configurações', to: '/app/configuracoes' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header-wrapper" v-click-outside="() => (isClinicDropdownOpen = false)">
      <ClinicDropdown v-if="isClinicDropdownOpen" />
      <div class="sidebar-header" @click="isClinicDropdownOpen = !isClinicDropdownOpen">
        <div class="clinic-logo">
          <img
            v-if="authStore.user?.clinic?.logoUrl"
            :src="authStore.user.clinic.logoUrl"
            alt="Logo da Clínica"
            class="clinic-logo-img"
          />
          <span v-else>{{ authStore.user?.clinic?.name?.charAt(0) || 'C' }}</span>
        </div>
        <h1 class="clinic-name">{{ authStore.user?.clinic?.name || 'Sua Clínica' }}</h1>
        <MoreHorizontal :size="20" class="options-icon desktop-only" />

        <button @click="$emit('close')" class="mobile-close-btn">
          <X :size="24" />
        </button>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-links">
        <li v-for="link in mainNavLinks" :key="link.text">
          <RouterLink :to="link.to" class="nav-link">
            <component :is="link.icon" :size="20" stroke-width="2" />
            <span>{{ link.text }}</span>
          </RouterLink>
        </li>
      </ul>
      <ul class="nav-links">
        <li v-for="link in utilityNavLinks" :key="link.text">
          <RouterLink :to="link.to" class="nav-link">
            <component :is="link.icon" :size="20" stroke-width="2" />
            <span>{{ link.text }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div
        class="user-profile"
        @click="isUserDropdownOpen = !isUserDropdownOpen"
        v-click-outside="() => (isUserDropdownOpen = false)"
      >
        <UserDropdown v-if="isUserDropdownOpen" />
        <div class="user-avatar">
          {{ authStore.user?.name.charAt(0) || 'U' }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ authStore.user?.name || 'Usuário' }}</span>
          <span class="user-email">{{ authStore.user?.email || 'email@exemplo.com' }}</span>
        </div>
        <MoreHorizontal :size="20" class="options-icon" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  padding: 1.5rem;
  background-color: #f7f8fa;
  border-right: 1px solid #e5e7eb;
}

/* Cabeçalho */
.sidebar-header-wrapper {
  position: relative;
  margin-bottom: 2rem;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sidebar-header:hover {
  background-color: #edf0f4;
}
.clinic-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background-color: var(--branco);
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.clinic-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.clinic-name {
  font-family: var(--fonte-titulo);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--preto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

/* Navegação */
.sidebar-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  text-decoration: none;
  color: #525866;
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-link:hover {
  background-color: #edf0f4;
  color: var(--preto);
}
.router-link-exact-active {
  background-color: var(--branco);
  color: var(--preto);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Rodapé */
.sidebar-footer {
  position: relative;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.user-profile:hover {
  background-color: #edf0f4;
}
.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.user-details {
  flex-grow: 1;
  overflow: hidden;
}
.user-name {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--preto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  display: block;
  font-size: 0.75rem;
  color: var(--cinza-texto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.options-icon {
  color: var(--cinza-texto);
}

/* ✨ Estilos para o modo responsivo */
.mobile-close-btn {
  display: none; /* Escondido por padrão */
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }
  .mobile-close-btn {
    display: block;
  }
}
</style>
