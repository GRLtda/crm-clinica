<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
// ✨ 1. ÍCONE NOVO IMPORTADO ✨
import { Play, FileText, Check, X, History, CalendarPlus } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useStatusBadge } from '@/composables/useStatusBadge'

const props = defineProps({
  appointment: { type: Object, required: true },
  clickEvent: { type: Object, required: true },
})
const emit = defineEmits(['close', 'start', 'view'])

const popoverRef = ref(null)
const popoverStyle = ref({})
const appointmentsStore = useAppointmentsStore()
const toast = useToast()

const canConfirm = computed(() => props.appointment.status === 'Agendado')
const canStart = computed(() => props.appointment.status === 'Confirmado')
const canView = computed(() => props.appointment.status === 'Realizado')
// ✨ 2. LÓGICA PARA O NOVO BOTÃO ✨
const canReschedule = computed(() => props.appointment.status === 'Não Compareceu')

function positionPopover() {
  if (!props.clickEvent || !popoverRef.value) return

  const popoverRect = popoverRef.value.getBoundingClientRect()
  const margin = 20

  let top = props.clickEvent.clientY - popoverRect.height / 2
  let left = props.clickEvent.clientX + margin

  if (left + popoverRect.width > window.innerWidth) {
    left = props.clickEvent.clientX - popoverRect.width - margin
  }
  if (top < margin) {
    top = margin
  }
  if (top + popoverRect.height > window.innerHeight) {
    top = window.innerHeight - popoverRect.height - margin
  }

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

async function updateStatus(newStatus) {
  const { success } = await appointmentsStore.updateAppointmentStatus(
    props.appointment._id,
    newStatus,
  )
  if (success) {
    toast.success(`Status alterado para "${newStatus}"!`)
    await appointmentsStore.fetchAppointmentsByDate()
    emit('close')
  } else {
    toast.error('Não foi possível alterar o status.')
  }
}

onMounted(() => {
  nextTick(() => {
    positionPopover()
  })
  window.addEventListener('resize', positionPopover)
  window.addEventListener('scroll', positionPopover, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', positionPopover)
  window.removeEventListener('scroll', positionPopover, true)
})

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}
</script>

<template>
  <div class="popover-wrapper" @click.self="$emit('close')">
    <div
      ref="popoverRef"
      class="popover-content"
      :style="popoverStyle"
      v-click-outside="() => $emit('close')"
    >
      <div class="popover-header">
        <div class="patient-info">
          <div class="patient-avatar">{{ appointment.patient.name.charAt(0) }}</div>
          <div>
            <div class="patient-name">{{ appointment.patient.name }}</div>
            <div class="appointment-time">
              {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn"><X :size="18" /></button>
      </div>
      <div class="popover-body">
        <div class="popover-info">
          <div class="info-line">
            <History :size="16" />
            <span>1ª consulta</span>
          </div>
          <div class="info-line">
            <div
              :class="useStatusBadge(appointment.status).badgeClass.value"
              :style="useStatusBadge(appointment.status).badgeStyle.value"
            >
              {{ useStatusBadge(appointment.status).displayText.value }}
            </div>
          </div>
        </div>
        <div class="popover-actions">
          <button
            v-if="canConfirm"
            @click="updateStatus('Confirmado')"
            class="action-button success"
          >
            <Check :size="16" />
            <span>Confirmar Chegada</span>
          </button>
          <button v-if="canStart" @click="$emit('start')" class="action-button primary">
            <Play :size="16" />
            <span>Iniciar Atendimento</span>
          </button>
          <button v-if="canView" @click="$emit('view')" class="action-button secondary">
            <FileText :size="16" />
            <span>Ver Anotações</span>
          </button>
          <button v-if="canReschedule" class="action-button warning" disabled>
            <CalendarPlus :size="16" />
            <span>Reagendar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popover-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
}
.popover-content {
  position: absolute;
  width: 280px;
  background-color: var(--branco);
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 101;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.patient-name {
  font-weight: 600;
  color: #111827;
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
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background-color: #f3f4f6;
}

.popover-body {
  padding: 0 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popover-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}
.info-line svg {
  color: var(--cinza-texto);
}

.status-badge {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  width: fit-content;
  text-transform: capitalize;
}

.popover-actions {
  display: flex;
  flex-direction: column;
}

/* ✨ 4. ESTILOS DE BOTÕES ATUALIZADOS ✨ */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.action-button.primary {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.action-button.primary:hover {
  background-color: var(--azul-escuro);
}

.action-button.success {
  background-color: #dcfce7;
  color: #166534;
}
.action-button.success:hover {
  background-color: #bbf7d0;
}

.action-button.secondary {
  background-color: #f1f5f9;
  color: #334155;
}
.action-button.secondary:hover {
  background-color: #e2e8f0;
}

.action-button.warning {
  background-color: #fef3c7;
  color: #92400e;
}
.action-button.warning:hover:not(:disabled) {
  background-color: #fde68a;
}

.action-button:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
