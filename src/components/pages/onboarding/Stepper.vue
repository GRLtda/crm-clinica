<script setup>
import { defineProps } from 'vue'
import { Check } from 'lucide-vue-next'

defineProps({
  steps: Array,
  currentStep: Number,
})
</script>

<template>
  <div class="stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step-item"
      :class="{ active: index + 1 === currentStep, completed: index + 1 < currentStep }"
    >
      <div class="step-content">
        <div class="step-circle">
          <Check v-if="index + 1 < currentStep" :size="16" stroke-width="3" />
          <component v-else :is="step.icon" :size="16" />
        </div>
        <div class="step-details">
          <div class="step-name">{{ step.name }}</div>
          <div v-if="step.subtitle" class="step-subtitle">{{ step.subtitle }}</div>
        </div>
      </div>
      <div v-if="index < steps.length - 1" class="step-line"></div>
    </div>
  </div>
</template>
<style scoped>
.stepper {
  display: flex;
  /* 1. Altera a justificação para agrupar os itens no centro */
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  gap: 0.5rem; /* Adiciona um pequeno espaço entre o conteúdo e a linha */
}

.step-item {
  display: flex;
  align-items: center;
  /* 2. Removemos o flex: 1 para que o item não se estique mais */
}

.step-item:last-child {
  flex-grow: 0;
  flex-shrink: 0;
}

.step-item:last-child .step-line {
  display: none;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-circle {
  width: 32px;
  height: 32px;
  flex-shrink: 0; /* Impede que o círculo seja esmagado */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  background-color: var(--branco);
  color: var(--cinza-texto);
  transition: all 0.3s ease;
}

.step-details {
  display: flex;
  flex-direction: column;
}

.step-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cinza-texto);
  white-space: nowrap; /* Impede que o texto quebre a linha */
}

.step-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

.step-line {
  /* 3. Define um tamanho fixo para a linha */
  width: 4rem; /* 64px */
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 1rem;
  transition: background-color 0.3s ease;
}

/* Estilos de Ativo e Concluído */
.step-item.active .step-circle,
.step-item.completed .step-circle {
  background-color: var(--azul-principal);
  border-color: var(--azul-principal);
  color: var(--branco);
}

.step-item.active .step-name {
  color: var(--preto);
}

.step-item.completed .step-line {
  background-color: var(--azul-principal);
}
</style>
