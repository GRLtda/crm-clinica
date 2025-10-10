<script setup>
import { defineProps, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  steps: Array,
  currentStep: Number,
})

const stepperContainer = ref(null)
const stepItems = ref([])

// Função para centralizar o passo ativo
const scrollToActiveStep = async () => {
  await nextTick()
  if (props.currentStep > 0 && stepItems.value.length >= props.currentStep) {
    const activeStepElement = stepItems.value[props.currentStep - 1]
    if (activeStepElement && window.innerWidth <= 768) {
      activeStepElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }
}

watch(() => props.currentStep, scrollToActiveStep)

onMounted(() => {
  setTimeout(scrollToActiveStep, 100)
  window.addEventListener('resize', scrollToActiveStep)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', scrollToActiveStep)
})
</script>

<template>
  <div class="stepper" ref="stepperContainer">
    <template v-for="(step, index) in steps" :key="index">
      <div
        class="step-item"
        :class="{ active: index + 1 === currentStep, completed: index + 1 < currentStep }"
        :ref="
          (el) => {
            if (el) stepItems[index] = el
          }
        "
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
  position: relative; /* Necessário para o degradê */
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
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
  font-size: 0.875rem;
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
  flex-grow: 1;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 1rem;
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

@media (max-width: 768px) {
  .stepper {
    justify-content: flex-start;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 0; /* Remove padding para o efeito de scroll funcionar bem */
  }

  .stepper::-webkit-scrollbar {
    display: none;
  }

  /* ✨ Efeito de degradê nas laterais */
  .stepper::before,
  .stepper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px; /* Largura do degradê */
    z-index: 2;
    pointer-events: none; /* Permite clicar através do degradê */
  }
  .stepper::before {
    left: 0;
    background: linear-gradient(to right, var(--branco) 20%, transparent);
  }
  .stepper::after {
    right: 0;
    background: linear-gradient(to left, var(--branco) 20%, transparent);
  }

  .step-item {
    scroll-snap-align: center;
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
    opacity: 0.4;
    transform: scale(0.9);
    padding: 0 0.5rem; /* Adiciona um pequeno respiro */
  }

  .step-item:first-child {
    padding-left: 30%; /* Espaço inicial para centralizar o primeiro item */
  }
  .step-item:last-child {
    padding-right: 30%; /* Espaço final para centralizar o último item */
  }

  .step-item.active {
    opacity: 1;
    transform: scale(1);
  }

  .step-line {
    flex-grow: 0;
    width: 30px;
    margin: 0;
  }
}
</style>
