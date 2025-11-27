<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import UserDropdown from '@/components/global/UserDropdown.vue'
import ClinicDropdown from '@/components/global/ClinicDropdown.vue'
import {
  LayoutDashboard,
  CalendarSearch,
  Calendar,
  Users,
  LifeBuoy,
  Settings,
  MoreHorizontal,
  X,
  Megaphone
} from 'lucide-vue-next'

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'toggle-collapse'])

const authStore = useAuthStore()
const isUserDropdownOpen = ref(false)
const isClinicDropdownOpen = ref(false)

const mainNavLinks = [
  { icon: LayoutDashboard, text: 'Resumo', to: '/app' },
  { icon: CalendarSearch, text: 'Calendário', to: '/app/calendario' },
  { icon: Calendar, text: 'Atendimentos', to: '/app/atendimentos' },
  { icon: Users, text: 'Pacientes', to: '/app/pacientes' },
  { icon: Megaphone, text: 'Marketing', to: '/app/marketing' },
]

const utilityNavLinks = [
  { icon: LifeBuoy, text: 'Ajuda', to: '/app/ajuda' },
  { icon: Settings, text: 'Configurações', to: '/app/configuracoes' },
]
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar-header-wrapper" v-click-outside="() => (isClinicDropdownOpen = false)">
      <ClinicDropdown v-if="isClinicDropdownOpen && !isCollapsed" />
      <div class="sidebar-header" @click="!isCollapsed && (isClinicDropdownOpen = !isClinicDropdownOpen)">
        <div class="clinic-logo">
          <img
            v-if="authStore.user?.clinic?.logoUrl"
            :src="authStore.user.clinic.logoUrl"
            alt="Logo da Clínica"
            class="clinic-logo-img"
          />
          <span v-else>{{ authStore.user?.clinic?.name?.charAt(0) || 'C' }}</span>
        </div>
        <h1 v-show="!isCollapsed" class="clinic-name">{{ authStore.user?.clinic?.name || 'Sua Clínica' }}</h1>
        <MoreHorizontal v-show="!isCollapsed" :size="20" class="options-icon desktop-only" />

        <button @click="$emit('close')" class="mobile-close-btn">
          <X :size="24" />
        </button>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-links">
        <li v-for="link in mainNavLinks" :key="link.text">
          <RouterLink :to="link.to" class="nav-link" :title="isCollapsed ? link.text : ''">
            <component :is="link.icon" :size="20" stroke-width="2" />
            <span v-show="!isCollapsed" class="nav-text">{{ link.text }}</span>
          </RouterLink>
        </li>
      </ul>
      <ul class="nav-links">
        <li v-for="link in utilityNavLinks" :key="link.text">
          <RouterLink :to="link.to" class="nav-link" :title="isCollapsed ? link.text : ''">
            <component :is="link.icon" :size="20" stroke-width="2" />
            <span v-show="!isCollapsed" class="nav-text">{{ link.text }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div
        class="user-profile"
        @click="!isCollapsed && (isUserDropdownOpen = !isUserDropdownOpen)"
        v-click-outside="() => (isUserDropdownOpen = false)"
      >
        <UserDropdown v-if="isUserDropdownOpen && !isCollapsed" />
        <div class="user-avatar">
          {{ authStore.user?.name.charAt(0) || 'U' }}
        </div>
        <div v-show="!isCollapsed" class="user-details">
          <span class="user-name">{{ authStore.user?.name || 'Usuário' }}</span>
          <span class="user-email">{{ authStore.user?.email || 'email@exemplo.com' }}</span>
        </div>
        <MoreHorizontal v-show="!isCollapsed" :size="20" class="options-icon" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  padding: 1rem;
  background-color: #fafbfc;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  border-top-right-radius: 1rem; /* Border radius no canto superior direito */
}

.sidebar.is-collapsed {
  width: 72px;
  padding: 1rem 0.5rem;
}

/* Cabeçalho */
.sidebar-header-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sidebar:not(.is-collapsed) .sidebar-header:hover {
  background-color: #edf0f4;
}
.sidebar.is-collapsed .sidebar-header {
  justify-content: center;
  padding: 0.5rem;
  cursor: default;
}
.clinic-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 0.375rem;
  background-color: var(--branco);
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
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
  font-size: 1rem;
  font-weight: 600;
  color: var(--preto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  transition: opacity 0.25s ease;
}
.sidebar.is-collapsed .clinic-name {
  opacity: 0;
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
  gap: 0.125rem;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #525866;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.sidebar.is-collapsed .nav-link {
  justify-content: center;
  padding: 0.625rem;
}
.nav-text {
  transition: opacity 0.25s ease;
  white-space: nowrap;
}
.sidebar.is-collapsed .nav-text {
  opacity: 0;
}
.nav-link:hover {
  background-color: #edf0f4;
  color: var(--preto);
}
.router-link-exact-active {
  background-color: var(--branco);
  color: var(--preto);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Rodapé */
.sidebar-footer {
  position: relative;
  margin-top: 1rem;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sidebar.is-collapsed .user-profile {
  justify-content: center;
  padding: 0.5rem;
  cursor: default;
}
.sidebar:not(.is-collapsed) .user-profile:hover {
  background-color: #edf0f4;
}
.user-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}
.user-details {
  flex-grow: 1;
  overflow: hidden;
  transition: opacity 0.25s ease;
}
.sidebar.is-collapsed .user-details {
  opacity: 0;
}
.user-name {
  display: block;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--preto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  display: block;
  font-size: 0.6875rem;
  color: var(--cinza-texto);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.options-icon {
  color: var(--cinza-texto);
  flex-shrink: 0;
  transition: opacity 0.25s ease;
}
.sidebar.is-collapsed .options-icon {
  opacity: 0;
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
  /* Em mobile, sidebar sempre expandida quando visível */
  .sidebar.is-collapsed {
    width: 240px;
    padding: 1rem;
  }
  .sidebar.is-collapsed .nav-link {
    justify-content: flex-start;
    padding: 0.5rem 0.75rem;
  }
  .sidebar.is-collapsed .nav-text,
  .sidebar.is-collapsed .user-details,
  .sidebar.is-collapsed .options-icon,
  .sidebar.is-collapsed .clinic-name {
    opacity: 1;
  }
  .sidebar.is-collapsed .sidebar-header {
    justify-content: flex-start;
  }
}
</style>
