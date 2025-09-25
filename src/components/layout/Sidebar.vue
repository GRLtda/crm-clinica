<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import UserDropdown from '@/components/global/UserDropdown.vue'
import {
  MapPin,
  Calendar,
  DollarSign,
  BarChart2,
  Users,
  LifeBuoy,
  Settings,
  MoreHorizontal,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const isDropdownOpen = ref(false)

// Lógica para obter e formatar a data atual
const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' }
const today = new Date()
let formattedDate = today.toLocaleDateString('pt-BR', dateOptions)
const currentDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

const mainNavLinks = [
  { icon: Calendar, text: 'Atendimentos', to: '/app/atendimentos' },
  { icon: DollarSign, text: 'Cobranças', to: '/app/cobrancas' },
  { icon: BarChart2, text: 'Inteligência', to: '/app/inteligencia' },
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
        <div class="clinic-info">
          <div class="clinic-icon">
            <MapPin :size="20" />
          </div>
          <div class="clinic-details">
            <span class="clinic-name">{{ authStore.user?.clinic?.name || 'Sua Clínica' }}</span>
            <span class="current-date">{{ currentDate }}</span>
          </div>
          <button class="options-btn"><MoreHorizontal :size="20" /></button>
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
        <div class="user-info-wrapper" v-click-outside="() => (isDropdownOpen = false)">
          <UserDropdown v-if="isDropdownOpen" />
          <div class="user-info">
            <div class="user-avatar">
              {{ authStore.user?.name.charAt(0) || 'U' }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.name || 'Usuário' }}</span>
            </div>
            <button @click="isDropdownOpen = !isDropdownOpen" class="options-btn">
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
.clinic-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
}
.clinic-icon {
  background-color: #fefce8;
  color: #ca8a04;
  padding: 0.5rem;
  border-radius: 0.5rem;
  align-self: flex-start;
}
.clinic-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.clinic-name {
  font-weight: 600;
  font-size: 0.875rem;
}
.current-date {
  font-size: 0.75rem;
  color: var(--cinza-texto);
}
.options-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
}
ul {
  list-style: none;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1rem;
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
.user-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
