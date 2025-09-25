<script setup>
import { onMounted } from 'vue'
import confetti from 'canvas-confetti'
import { CheckCircle2 } from 'lucide-vue-next'

const emit = defineEmits(['confirm'])

// Dispara os confetes assim que o modal é montado na tela
onMounted(() => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
})

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <CheckCircle2 class="success-icon" :size="64" />
      <h2 class="title">Eba! Conta criada!</h2>
      <p class="message">Seja bem-vindo(a)! Estamos felizes em ter você conosco.</p>
      <button @click="handleConfirm" class="confirm-button">Continuar</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-card {
  max-width: 400px;
  padding: 2.5rem;
  background-color: var(--branco);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: pop-in 0.3s ease-out;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon {
  color: #10b981; /* Um verde sucesso */
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.message {
  color: var(--cinza-texto);
  margin-bottom: 2rem;
}

.confirm-button {
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-button:hover {
  background-color: var(--azul-escuro);
}
</style>
