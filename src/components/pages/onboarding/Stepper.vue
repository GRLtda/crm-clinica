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
    <template v-for="(step, index) in steps" :key="index">
      <div
        class="step-item"
        :class="{ active: index + 1 === currentStep, completed: index + 1 < currentStep }"
      >
        <div class="step-circle">
          <Check v-if="index + 1 < currentStep" :size="16" stroke-width="3" />
          <component v-else :is="step.icon" :size="16" />
        </div>
        <div class="step-details">
          <div class="step-name">{{ step.name }}</div>
          <div v-if="step.subtitle" class="step-subtitle">{{ step.subtitle }}</div>
        </div>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ completed: index + 1 < currentStep }"
      ></div>
    </template>
  </div>
</template>
<style scoped>
.stepper {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 1rem; /* Adiciona um respiro nas laterais */
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0; /* Impede que o item seja esmagado */
}

.step-circle {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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
  font-size: 0.875rem; /* Levemente menor para caber melhor */
  font-weight: 600;
  color: var(--cinza-texto);
  white-space: nowrap;
}

.step-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

.step-line {
  flex-grow: 1; /* Faz a linha ocupar todo o espaço disponível */
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 1rem; /* Mantém o espaçamento */
  transition: background-color 0.3s ease;
}

/* Estilos de Ativo e Concluído */
.step-item.active .step-circle {
  background-color: var(--azul-principal);
  border-color: var(--azul-principal);
  color: var(--branco);
}

.step-item.active .step-name {
  color: var(--preto);
}

.step-item.completed .step-circle {
  background-color: var(--azul-principal);
  border-color: var(--azul-principal);
  color: var(--branco);
}

.step-item.completed .step-name {
  color: var(--preto);
}

.step-line.completed {
  background-color: var(--azul-principal);
}
</style>
