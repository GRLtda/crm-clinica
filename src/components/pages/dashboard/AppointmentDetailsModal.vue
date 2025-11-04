<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useToast } from 'vue-toastification'
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Trash2,
  CalendarOff,
  CalendarPlus,
  CheckCircle,
} from 'lucide-vue-next'
import { useStatusBadge } from '@/composables/useStatusBadge.js'
import { formatPhone } from '@/directives/phone-mask.js'

const props = defineProps({
  event: { type: Object, required: true },
})

const emit = defineEmits(['close', 'edit'])

const appointmentsStore = useAppointmentsStore()
const toast = useToast()
const router = useRouter()

const patient = computed(() => props.event.originalEvent.patient)

// ✨ ========= CORREÇÃO AQUI ========= ✨
// Em vez de passar um 'computed' para o 'useStatusBadge',
// nós criamos um 'computed' que CHAMA o 'useStatusBadge' com a string.
const badgeInfo = computed(() => {
  // Passamos a string reativa para a função helper
  return useStatusBadge(props.event.originalEvent.status)
})

// Agora, criamos computed refs para cada valor que o template precisa
const badgeClass = computed(() => badgeInfo.value.badgeClass)
const badgeStyle = computed(() => badgeInfo.value.badgeStyle)
const displayText = computed(() => badgeInfo.value.displayText)
// ✨ ========= FIM DA CORREÇÃO ========= ✨

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function updateStatus(status) {
  const { success } = await appointmentsStore.updateAppointmentStatus(
    props.event.originalEvent._id,
    status,
  )
  if (success) {
    toast.success(`Agendamento marcado como "${status}"!`)
    emit('close')
  } else {
    toast.error('Erro ao atualizar o status do agendamento.')
  }
}

function handleReschedule() {
  emit('edit', props.event.originalEvent)
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <div>
          <h2>Resumo do Agendamento</h2>
          <p>Detalhes do atendimento agendado.</p>
        </div>
        <button @click="$emit('close')" class="btn-icon">
          <X :size="24" />
        </button>
      </header>

      <div class="modal-body">
        <div class="patient-summary">
          <div class="patient-avatar">{{ patient.name.charAt(0) }}</div>
          <div class="patient-details">
            <div class="name-with-status">
              <h3 class="patient-name">{{ patient.name }}</h3>
              <span :class="badgeClass" :style="badgeStyle">{{ displayText }}</span>
            </div>
            <div class="patient-contact">
              <Phone :size="14" />
              <span>{{ formatPhone(patient.phone) }}</span>
            </div>
          </div>
        </div>

        <div class="appointment-details">
          <div class="detail-item">
            <Calendar :size="16" />
            <span>{{ new Date(event.start).toLocaleDateString('pt-BR') }}</span>
          </div>
          <div class="detail-item">
            <Clock :size="16" />
            <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button @click="handleReschedule" class="btn-secondary">
          <CalendarPlus :size="16" />
          Reagendar
        </button>
        <div class="status-actions">
          <button @click="updateStatus('Confirmado')" class="btn-success">
            <CheckCircle :size="16" />
            Confirmar Chegada
          </button>
          <button @click="updateStatus('Não Compareceu')" class="btn-outline-danger">
            <CalendarOff :size="16" />
            Não Compareceu
          </button>
          <button @click="updateStatus('Cancelado')" class="btn-danger">
            <Trash2 :size="16" />
            Cancelar
          </button>
        </div>
      </footer>
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
  background: rgba(249, 250, 251, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--branco);
  width: 100%;
  max-width: 900px;
  height: auto;
  min-height: 300px;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  animation: modal-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.modal-header h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}
.modal-header p {
  color: var(--cinza-texto);
  margin: 0;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--cinza-texto);
}
.btn-icon:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex-grow: 1;
}

.patient-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.patient-avatar {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.name-with-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.patient-details .patient-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0;
}

.status-badge {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  text-transform: capitalize;
  white-space: nowrap;
  height: fit-content;
}

.patient-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinza-texto);
  font-size: 0.875rem;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-weight: 500;
}

.detail-item svg {
  color: var(--cinza-texto);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: #f9fafb;
  flex-shrink: 0;
}

.status-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--branco);
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background: #fecaca;
}

.btn-outline-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--branco);
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-outline-danger:hover {
  background-color: #fef2f2;
}

.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-success:hover {
  background: #bbf7d0;
}

/* ===== INÍCIO DAS MELHORIAS PARA MOBILE ===== */

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    background: var(--branco);
    backdrop-filter: none;
    align-items: stretch;
  }

  .modal-content {
    width: 100%;
    height: 100%;
    max-width: 100%;
    min-height: auto;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }

  .modal-body {
    flex-grow: 1;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .name-with-status {
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
    background-color: var(--branco);
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .status-actions {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .modal-footer .btn-secondary,
  .modal-footer .btn-danger,
  .modal-footer .btn-outline-danger,
  .modal-footer .btn-success {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }
}
</style>
