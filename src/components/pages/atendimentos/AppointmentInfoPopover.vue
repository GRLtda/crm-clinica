<script setup>
import { computed, ref, onMounted } from 'vue'
import { Play, X, History, FileText } from 'lucide-vue-next'

const props = defineProps({
  appointment: { type: Object, required: true },
  targetRect: { type: Object, required: true }, // Recebe o DOMRect do alvo
})

const emit = defineEmits(['close', 'start', 'view'])
const popoverRef = ref(null)
const position = ref({ top: '-9999px', left: '-9999px', opacity: 0 }) // Começa fora da tela

// 💡 LÓGICA DE POSICIONAMENTO INTELIGENTE E DEFINITIVA
onMounted(() => {
  const popoverEl = popoverRef.value
  if (!popoverEl) return

  const popoverRect = popoverEl.getBoundingClientRect()
  const margin = 10 // Espaço entre o card e o pop-up

  let top = props.targetRect.top
  let left = props.targetRect.right + margin

  // --- Verificação de Bordas ---

  // 1. Verifica se vai passar da borda DIREITA da tela
  if (left + popoverRect.width > window.innerWidth - margin) {
    left = props.targetRect.left - popoverRect.width - margin
  }

  // 2. Verifica se vai passar da borda INFERIOR da tela
  if (top + popoverRect.height > window.innerHeight - margin) {
    top = props.targetRect.bottom - popoverRect.height
  }

  // 3. Garante que não fique acima do topo da tela
  if (top < margin) {
    top = margin
  }

  // 4. Garante que não fique à esquerda do início da tela
  if (left < margin) {
    left = margin
  }

  // Aplica a posição calculada e torna o pop-up visível
  position.value = {
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
    :style="position"
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
  transition: opacity 0.2s ease-out; /* Transição suave de opacidade */
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
