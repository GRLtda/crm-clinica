<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(false)

async function handleSubscribe() {
  isLoading.value = true
  try {
    const result = await authStore.subscribe()
    if (!result.success) {
      toast.error(result.error || 'Erro ao iniciar assinatura.')
    }
  } catch (error) {
    toast.error('Erro inesperado.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button
    @click="handleSubscribe"
    :disabled="isLoading"
    class="subscribe-btn"
  >
    <span v-if="isLoading">Processando...</span>
    <span v-else>Assinar Agora</span>
  </button>
</template>

<style scoped>
.subscribe-btn {
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscribe-btn:hover {
  background-color: var(--primary-color-dark, #0056b3);
}

.subscribe-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
