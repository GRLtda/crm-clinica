<script setup>
import { computed, ref, onMounted } from 'vue'
import { Play, X, History, FileText } from 'lucide-vue-next'

const props = defineProps({
  appointment: { type: Object, required: true },
  // Recebe o evento de clique para saber a posição do mouse
  clickEvent: { type: Object, required: true },
})

const emit = defineEmits(['close', 'start', 'view'])
const popoverRef = ref(null)
// O pop-up começa invisível e fora da tela para evitar "piscadas"
const finalPosition = ref({ top: '-9999px', left: '-9999px', opacity: 0 })

// 💡 A nova lógica de posicionamento inteligente
onMounted(() => {
  const popoverEl = popoverRef.value
  if (!popoverEl || !props.clickEvent) return

  const popoverRect = popoverEl.getBoundingClientRect()
  const margin = 15 // Uma margem de segurança das bordas e do cursor

  // Posição inicial (ao lado do cursor)
  let top = props.clickEvent.clientY + margin
  let left = props.clickEvent.clientX + margin

  // --- Verificação de Bordas da Tela ---

  // Se passar da borda DIREITA, joga ele para a esquerda do cursor
  if (left + popoverRect.width > window.innerWidth - margin) {
    left = props.clickEvent.clientX - popoverRect.width - margin
  }

  // Se passar da borda INFERIOR, sobe ele para se alinhar com a parte de baixo da tela
  if (top + popoverRect.height > window.innerHeight - margin) {
    top = window.innerHeight - popoverRect.height - margin
  }

  // Garante que não saia pela ESQUERDA
  if (left < margin) {
    left = margin
  }

  // Garante que não saia por CIMA
  if (top < margin) {
    top = margin
  }

  // Aplica a posição final calculada e torna o pop-up visível
  finalPosition.value = {
    top: `${top}px`,
    left: `${left}px`,
    opacity: 1,
  }
})

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

const consultationNumber = computed(() => {
  return props.appointment.patient?.consultationCount || 1
})

const consultationText = computed(() => {
  if (consultationNumber.value === 1) {
    return '1ª consulta'
  }
  return `${consultationNumber.value}ª consulta`
})
</script>

<template>
  <div
    ref="popoverRef"
    class="popover-content"
    :style="finalPosition"
    v-click-outside="() => emit('close')"
  >
    <header class="popover-header">
      <div class="patient-info">
        <div class="patient-avatar">{{ appointment.patient.name.charAt(0) }}</div>
        <div>
          <div class="patient-name">{{ appointment.patient.name }}</div>
          <div class="appointment-time">
            {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="close-btn"><X :size="20" /></button>
    </header>

    <div class="popover-body">
      <div class="info-item">
        <History :size="16" />
        <span>{{ consultationText }}</span>
      </div>
      <div class="info-item">
        <div class="appointment-status" :class="appointment.status.toLowerCase().replace(' ', '-')">
          {{ appointment.status }}
        </div>
      </div>
    </div>

    <footer class="popover-footer">
      <button v-if="appointment.status === 'Agendado'" @click="emit('start')" class="btn-primary">
        <Play :size="16" />
        Iniciar Atendimento
      </button>
      <button v-if="appointment.status === 'Realizado'" @click="emit('view')" class="btn-secondary">
        <FileText :size="16" />
        Ver Anotações
      </button>
    </footer>
  </div>
</template>

<style scoped>
.popover-content {
  position: fixed;
  width: 320px;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: opacity 0.2s ease-out;
  animation: pop-in 0.2s ease-out;
}

@keyframes pop-in {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.patient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.patient-name {
  font-weight: 600;
}
.appointment-time {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
  padding: 4px;
  margin: -4px;
}

.popover-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--cinza-texto);
  font-weight: 500;
}

.appointment-status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.875rem;
  width: fit-content;
}
.appointment-status.agendado {
  background-color: #eff6ff;
  color: #2563eb;
}
.appointment-status.realizado {
  background-color: #f0fdf4;
  color: #16a34a;
}

.popover-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--azul-principal);
  color: var(--branco);
  border: none;
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}

.btn-secondary {
  background: var(--branco);
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-secondary:hover {
  background-color: #f3f4f6;
}
</style>
