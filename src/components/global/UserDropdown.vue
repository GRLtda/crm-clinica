<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dropdown-menu">
    <ul>
      <li>
        <button @click="authStore.logout()" class="dropdown-item">
          <LogOut :size="16" />
          <span>Sair</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown-menu {
  position: absolute;
  bottom: 110%; /* Posiciona acima do botão */
  right: 0;
  background-color: var(--branco);
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  width: 200px;
  z-index: 10;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

ul {
  list-style: none;
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}
</style>
