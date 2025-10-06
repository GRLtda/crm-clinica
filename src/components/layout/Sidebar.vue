<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import UserDropdown from '@/components/global/UserDropdown.vue'
import ClinicDropdown from '@/components/global/ClinicDropdown.vue'
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  BarChart2,
  Users,
  LifeBuoy,
  Settings,
  MoreHorizontal,
} from 'lucide-vue-next'

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
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="clinic-info-wrapper" v-click-outside="() => (isClinicDropdownOpen = false)">
          <ClinicDropdown v-if="isClinicDropdownOpen" />
          <div class="clinic-info">
            <div class="clinic-avatar">
              {{ authStore.user?.clinic?.name?.charAt(0) || 'C' }}
            </div>
            <div class="clinic-details">
              <span class="clinic-name">{{ authStore.user?.clinic?.name || 'Sua Clínica' }}</span>
              <span class="user-role">{{ authStore.user?.role || 'Membro' }}</span>
            </div>
            <button @click="isClinicDropdownOpen = !isClinicDropdownOpen" class="options-btn">
              <MoreHorizontal :size="20" />
            </button>
          </div>
        </div>

        <ul>
          <li v-for="link in mainNavLinks" :key="link.text">
            <RouterLink :to="link.to" class="nav-link">
              <component :is="link.icon" :size="20" />
              <span>{{ link.text }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <ul>
          <li v-for="link in utilityNavLinks" :key="link.text">
            <RouterLink :to="link.to" class="nav-link">
              <component :is="link.icon" :size="20" />
              <span>{{ link.text }}</span>
            </RouterLink>
          </li>
        </ul>
        <div class="user-info-wrapper" v-click-outside="() => (isUserDropdownOpen = false)">
          <UserDropdown v-if="isUserDropdownOpen" />
          <div class="user-info">
            <div class="user-avatar">
              {{ authStore.user?.name.charAt(0) || 'U' }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.name || 'Usuário' }}</span>
            </div>
            <button @click="isUserDropdownOpen = !isUserDropdownOpen" class="options-btn">
              <MoreHorizontal :size="20" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.nav-section:first-child {
  flex-grow: 1;
}

/* === NOVOS ESTILOS PARA CLINIC INFO === */
.clinic-info-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.clinic-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.clinic-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 0.5rem; /* Quadrado com cantos arredondados */
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  font-family: var(--fonte-titulo);
}

.clinic-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden; /* Para o text-overflow funcionar */
}

.clinic-name {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  text-transform: capitalize; /* Para deixar a primeira letra maiúscula */
}
/* === FIM DOS NOVOS ESTILOS === */

.options-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
}
ul {
  list-style: none;
  padding: 0;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.nav-link:hover {
  background-color: #f3f4f6;
}
.router-link-exact-active {
  background-color: #eef2ff;
  color: var(--azul-principal);
  font-weight: 600;
}
.user-info-wrapper {
  position: relative;
}
.user-info {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
