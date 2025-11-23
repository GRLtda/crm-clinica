<script setup>
// ✨ 1. ADICIONAR onUnmounted
import { computed, ref, onUnmounted } from 'vue'
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
  RefreshCw,
  CalendarCheck,
  SquarePen,
  ChevronDown,
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

// ✨ 2. Computed para verificar se é retorno
const isReturn = computed(() => {
  return props.event.originalEvent?.isReturn === true
})

// ✨ 3. ADICIONAR CONTROLE DO DROPDOWN
const isStatusDropdownOpen = ref(false)
const isConfirmingCancel = ref(false)
const cancelConfirmTimer = ref(null) // Timer para a confirmação

function clearCancelTimer() {
  if (cancelConfirmTimer.value) {
    clearTimeout(cancelConfirmTimer.value)
    cancelConfirmTimer.value = null
  }
}

function toggleStatusDropdown() {
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value
  if (!isStatusDropdownOpen.value) {
    resetCancelConfirmation()
  }
}

function closeDropdown() {
  resetCancelConfirmation()
  isStatusDropdownOpen.value = false
}

function formatTime(dateString, formatStr) {
  try {
    const date = new Date(dateString)
    const options = { timeZone: 'America/Sao_Paulo' }

    if (formatStr === 'dd/MM/yyyy') {
      return date.toLocaleDateString('pt-BR', options)
    }

    options.hour = '2-digit'
    options.minute = '2-digit'
    return date.toLocaleTimeString('pt-BR', options)
  } catch (error) {
    console.error('Erro ao formatar data:', dateString, error)
    return 'Data inválida'
  }
}

function goToPatient() {
  if (patient.value && patient.value._id) {
    emit('close')
    router.push(`/app/pacientes/${patient.value._id}`)
  } else {
    toast.info('Este agendamento não parece ter um paciente vinculado.')
  }
}

// ✨ 4. FUNÇÃO 'updateStatus' MODIFICADA (PARA FECHAR O DROPDOWN)
async function updateStatus(status) {
  closeDropdown() // Fecha o dropdown e reseta a confirmação
  const appointmentId = props.event.originalEvent._id
  const success = await appointmentsStore.updateAppointmentStatus(appointmentId, status)
  if (success) {
    toast.success(`Agendamento ${status.toLowerCase()} com sucesso!`)
    emit('close')
  } else {
    toast.error('Erro ao atualizar status.')
  }
}

function resetCancelConfirmation() {
  clearCancelTimer()
  isConfirmingCancel.value = false
}

function handleCancelClick() {
  if (isConfirmingCancel.value) {
    clearCancelTimer()
    updateStatus('Cancelado')
  } else {
    isConfirmingCancel.value = true
    // Inicia o timer de 5 segundos para reverter
    cancelConfirmTimer.value = setTimeout(() => {
      resetCancelConfirmation()
    }, 5000)
  }
}

function handleReschedule() {
  // console.log('DEBUG (DetailsModal): Emitindo @edit (reagendar) com:', props.event.originalEvent)
  emit('edit', { ...props.event.originalEvent, _mode: 'reschedule' })
  emit('close')
}

function handleRebook() {
  // console.log('DEBUG (DetailsModal): Emitindo @edit (remarcar) com:', props.event.originalEvent)
  emit('edit', { ...props.event.originalEvent, _mode: 'rebook' })
  emit('close')
}

// Garante que o timer seja limpo se o componente for destruído
onUnmounted(() => {
  clearCancelTimer()
})
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
              <h3 class="patient-name" @click="goToPatient">{{ patient.name }}</h3>
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
            <span>{{
              new Date(event.start).toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
              })
            }}</span>
          </div>
          <div class="detail-item">
            <Clock :size="16" />
            <span>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
          </div>
          <div v-if="isReturn" class="info-chip return-chip">
            <RefreshCw :size="16" />
            <span>Este é um agendamento de retorno.</span>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <div class="reschedule-actions">
          <button
            @click="handleReschedule"
            class="btn-secondary"
            :disabled="event.originalEvent.status === 'Cancelado'"
          >
            <RefreshCw :size="16" />
            Retorno
          </button>
          <button
            @click="handleRebook"
            class="btn-secondary"
            :disabled="event.originalEvent.status === 'Cancelado'"
          >

            <CalendarPlus :size="16" />
            Reagendar
          </button>
        </div>

        <div class="status-actions">
          <div
            v-if="event.originalEvent.status !== 'Cancelado'"
            class="dropdown-wrapper"
            v-click-outside="closeDropdown"
          >
            <button @click="toggleStatusDropdown" class="btn-secondary btn-dropdown-toggle">
              <SquarePen :size="16" />
              <span>Alterar Status</span>
              <ChevronDown :size="16" :class="{ 'rotate-180': isStatusDropdownOpen }" />
            </button>

            <div v-if="isStatusDropdownOpen" class="dropdown-menu">
              <button
                v-if="event.originalEvent.status !== 'Confirmado'"
                @click="updateStatus('Confirmado')"
                class="dropdown-item success"
              >
                <CheckCircle :size="16" />
                <span>Confirmar Chegada</span>
              </button>
              <button @click="updateStatus('Não Compareceu')" class="dropdown-item outline-danger">
                <CalendarOff :size="16" />
                <span>Não Compareceu</span>
              </button>
              <button
                @click="handleCancelClick"
                :class="[
                  'dropdown-item',
                  isConfirmingCancel ? 'danger-confirm is-confirming' : 'danger',
                ]"
              >
                <Trash2 :size="16" />
                <span>{{ isConfirmingCancel ? 'Confirmar Cancelamento' : 'Cancelar' }}</span>
              </button>
            </div>
          </div>
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

.info-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.return-chip {
  background-color: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
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
  cursor: pointer;
  transition: color 0.2s;
}

.patient-details .patient-name:hover {
  color: var(--azul-principal);
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

.btn-secondary:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
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

/* ===== ESTILOS DO NOVO DROPDOWN DE STATUS ===== */
.dropdown-wrapper {
  position: relative;
}

.btn-dropdown-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 180px; /* Largura mínima para o botão no desktop */
}

.btn-dropdown-toggle svg {
  transition: transform 0.2s ease;
}
.btn-dropdown-toggle .rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  bottom: 100%; /* Aparece acima do botão */
  right: 0;
  width: 240px; /* Largura do menu */
  background: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem; /* Borda mais arredondada para popups */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.07);
  z-index: 1010; /* Acima do overlay do modal */
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  animation: modal-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f3f4f6; /* Cor de hover suave */
}

/* Cores dos ícones e texto */
.dropdown-item.success {
  color: #166534; /* Verde do btn-success */
}
.dropdown-item.outline-danger {
  color: #ef4444; /* Vermelho do btn-outline-danger */
}
.dropdown-item.danger {
  color: #ef4444; /* Vermelho do btn-danger */
}

.dropdown-item.danger-confirm {
  color: var(--branco);
  background-color: #dc2626;
}

/* ✨ ESTILOS PARA A ANIMAÇÃO DE CONFIRMAÇÃO ✨ */
.dropdown-item.is-confirming {
  position: relative;
  overflow: hidden;
}

.dropdown-item.is-confirming::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  animation: fill-in 5s linear forwards;
  z-index: 0;
}

@keyframes fill-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.reschedule-actions {
  display: flex;
  gap: 0.75rem;
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

  .reschedule-actions {
    display: flex;
    gap: 0.75rem;
  }

  .status-actions {
    display: flex;
    gap: 0.75rem;
  }

  .modal-footer .btn-secondary,
  .modal-footer .btn-danger,
  .modal-footer .btn-outline-danger,
  .modal-footer .btn-success {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  /* ✨ ADICIONAR ESTAS REGRAS NO FINAL DO BLOCO MEDIA QUERY */
  .dropdown-wrapper {
    width: 100%;
  }

  .btn-dropdown-toggle {
    width: 100%;
    justify-content: center; /* Centraliza no mobile, como os outros botões */
    padding: 1rem;
  }

  .dropdown-menu {
    width: 100%; /* Menu ocupa a largura total no mobile */
    right: auto;
    left: 0;
  }
}
</style>
