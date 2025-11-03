<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientsStore } from '@/stores/patients'
import { useAppointmentsStore } from '@/stores/appointments'
import { useClinicStore } from '@/stores/clinic'
import { useToast } from 'vue-toastification'
// ✨ 1. Importar o LoaderCircle e a nova função da API
import { User, Calendar, Bell, Plus, X, DoorClosed, Info, LoaderCircle } from 'lucide-vue-next'
import { checkConflict } from '@/api/appointments'
import { isToday, isFuture, parse, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'

import Stepper from '@/components/pages/onboarding/Stepper.vue'
import SearchableSelect from '@/components/global/SearchableSelect.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import Switch from '@/components/global/Switch.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])
const patientsStore = usePatientsStore()
const appointmentsStore = useAppointmentsStore()
const clinicStore = useClinicStore()
const toast = useToast()
const router = useRouter()

let debounceTimeout = null
const currentStep = ref(1)
const errors = ref({})

// ✨ 2. Novos estados para verificação de conflito
const conflictError = ref(null)
const isCheckingConflict = ref(false)
let conflictCheckDebounce = null

const clinicWorkingHours = computed(() => {
  if (!clinicStore.currentClinic?.workingHours) {
    return {}
  }
  const dayMapping = {
    Segunda: 'monday',
    Terça: 'tuesday',
    Quarta: 'wednesday',
    Quinta: 'thursday',
    Sexta: 'friday',
    Sábado: 'saturday',
    Domingo: 'sunday',
  }
  return clinicStore.currentClinic.workingHours.reduce((acc, schedule) => {
    const dayKey = dayMapping[schedule.day]
    if (dayKey) {
      acc[dayKey] = schedule.isOpen ? { open: schedule.startTime, close: schedule.endTime } : null
    }
    return acc
  }, {})
})

const steps = [
  { name: 'Paciente', icon: User },
  { name: 'Horário', icon: Calendar },
  { name: 'Lembretes', icon: Bell },
]

const appointmentData = ref({
  patient: null,
  date: new Date(),
  startTime: null,
  endTime: null,
  sendReminder: true,
  remindersSent: {
    oneDayBefore: true,
    threeHoursBefore: false,
  },
})

onMounted(() => {
  if (props.initialData) {
    appointmentData.value.patient = props.initialData.patient?._id || props.initialData.patient
    if (props.initialData.startTime) {
      appointmentData.value.date = new Date(props.initialData.startTime)
      appointmentData.value.startTime = new Date(props.initialData.startTime).toLocaleTimeString(
        'pt-BR',
        { hour: '2-digit', minute: '2-digit' },
      )
    }
    if (appointmentData.value.patient) {
      currentStep.value = 2
    }
  }
})

const patientOptions = computed(() => {
  return (patientsStore.searchResults || []).map((p) => ({ value: p._id, label: p.name }))
})

function isTimeInFuture(timeString, selectedDate) {
  const now = new Date();
  if (!isToday(selectedDate)) {
    return true; // Se não for hoje, qualquer horário é futuro em relação a "agora"
  }
  const [hours, minutes] = timeString.split(':').map(Number);
  const timeToCheck = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, hours), minutes), 0), 0);
  return timeToCheck > now;
}


const timeOptions = computed(() => {
  const selectedDate = appointmentData.value.date; // ✨ Data selecionada
  const selectedDay = getDayOfWeek(selectedDate);
  const workingHours = clinicWorkingHours.value[selectedDay];
  const allowOutside = clinicStore.currentClinic?.allowAppointmentsOutsideWorkingHours;

  const options = [];
  const interval = 15; // 15 minutos

  let startTime = 0; // 00:00
  let endTime = 24 * 60; // 24:00

  if (!allowOutside) {
    if (!workingHours) return []; // Dia fechado e não permite fora do horário
    const [startH, startM] = workingHours.open.split(':').map(Number);
    const [endH, endM] = workingHours.close.split(':').map(Number);
    startTime = startH * 60 + startM;
    endTime = endH * 60 + endM;
  }

  for (let i = startTime; i < endTime; i += interval) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // ✨ VERIFICA SE O HORÁRIO É FUTURO APENAS SE FOR HOJE ✨
    if (isTimeInFuture(timeStr, selectedDate)) {
      options.push({ value: timeStr, label: timeStr });
    }
  }

  return options;
});

const isOutsideWorkingHours = computed(() => {
    if (!appointmentData.value.startTime || !clinicStore.currentClinic?.allowAppointmentsOutsideWorkingHours) {
        return false;
    }
    const selectedDay = getDayOfWeek(appointmentData.value.date);
    const workingHours = clinicWorkingHours.value[selectedDay];

    if (!workingHours) {
        return true; // The whole day is outside working hours
    }

    return appointmentData.value.startTime < workingHours.open || appointmentData.value.startTime >= workingHours.close;
});

const noTimeSlotsAvailable = computed(() => {
  const selectedDay = getDayOfWeek(appointmentData.value.date);
  const workingHours = clinicWorkingHours.value[selectedDay];
  const allowOutside = clinicStore.currentClinic?.allowAppointmentsOutsideWorkingHours;
  const shouldHaveTimes = allowOutside || (workingHours && workingHours.open && workingHours.close);

  return shouldHaveTimes && timeOptions.value.length === 0;
});


const endTimeOptions = computed(() => {
  if (!appointmentData.value.startTime) return []
  return timeOptions.value.filter((option) => option.value > appointmentData.value.startTime)
})

function getDayOfWeek(date) {
  const dayIndex = new Date(date).getDay()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[dayIndex]
}

function handlePatientSearch(query) {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    patientsStore.searchPatients(query)
  }, 300)
}

function goToCreatePatient() {
  emit('close')
  router.push('/app/pacientes/novo')
}

// ✨ 3. Função para formatar data para ISO (necessária para a API)
function getISOString(date, timeString) {
  const [hour, minute] = timeString.split(':').map(Number)
  const baseDate = new Date(date)
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const day = baseDate.getDate()
  // Usa o fuso horário local para montar a data
  return new Date(year, month, day, hour, minute).toISOString()
}

// ✨ 4. Nova função para checar conflitos
async function checkAppointmentConflict() {
  // Só executa se todos os dados estiverem presentes
  if (
    !appointmentData.value.patient ||
    !appointmentData.value.date ||
    !appointmentData.value.startTime ||
    !appointmentData.value.endTime
  ) {
    return
  }

  isCheckingConflict.value = true
  conflictError.value = null
  // Limpa erro de "horário inválido" para dar lugar à verificação
  if (errors.value.time) errors.value.time = null

  // Debounce para evitar chamadas excessivas enquanto o usuário está digitando/clicando
  clearTimeout(conflictCheckDebounce)
  conflictCheckDebounce = setTimeout(async () => {
    try {
      const startTimeISO = getISOString(appointmentData.value.date, appointmentData.value.startTime)
      const endTimeISO = getISOString(appointmentData.value.date, appointmentData.value.endTime)

      const response = await checkConflict(
        appointmentData.value.patient,
        startTimeISO,
        endTimeISO
      )

      if (response.data.conflict) {
        conflictError.value = response.data.message
        errors.value.time = response.data.message // Para destacar os campos
      } else {
        conflictError.value = null
        // Limpa o erro SÓ SE for um erro de conflito
        if (errors.value.time && (errors.value.time.includes('conflito') || errors.value.time.includes('existe'))) {
          errors.value.time = null
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conflito:', error)
      conflictError.value = 'Erro ao verificar disponibilidade.'
      errors.value.time = 'Erro ao verificar disponibilidade.'
    } finally {
      isCheckingConflict.value = false
    }
  }, 500) // 500ms de debounce
}

// ✨ 5. Watchers atualizados
watch(
  () => appointmentData.value.date,
  () => {
    appointmentData.value.startTime = null
    appointmentData.value.endTime = null
    conflictError.value = null // Limpa erro ao trocar de data
    errors.value.time = null
  },
)

watch(
  () => appointmentData.value.startTime,
  (newStartTime) => {
    if (newStartTime) {
      const [hour, minute] = newStartTime.split(':').map(Number)
      // Usamos a data selecionada como base, não a data atual!
      const baseDate = new Date(appointmentData.value.date)
      baseDate.setHours(hour, minute, 0, 0) // Define hora e minuto na data selecionada
      baseDate.setMinutes(baseDate.getMinutes() + 30) // Adiciona 30 minutos

      const endHour = String(baseDate.getHours()).padStart(2, '0')
      const endMinute = String(baseDate.getMinutes()).padStart(2, '0')
      const endTime = `${endHour}:${endMinute}`

      if (endTimeOptions.value.some((opt) => opt.value === endTime)) {
        appointmentData.value.endTime = endTime
      } else {
        appointmentData.value.endTime = null
      }
    } else {
      appointmentData.value.endTime = null // Limpa o endTime se o startTime for limpo
    }
    // A verificação de conflito será chamada pelo watcher de endTime
  },
)

// ✨ 6. Novo Watcher para acionar a verificação de conflito
watch(
  [
    () => appointmentData.value.patient,
    () => appointmentData.value.date,
    () => appointmentData.value.endTime, // Aciona quando o endTime é definido
  ],
  () => {
    // Limpa erros anteriores e inicia a verificação
    conflictError.value = null
    if (errors.value.time && (errors.value.time.includes('conflito') || errors.value.time.includes('existe'))) {
      errors.value.time = null
    }
    checkAppointmentConflict()
  },
  { deep: true } // Necessário para a data
)

// ✨ 7. Função de validação atualizada
function validateStep() {
  errors.value = {}
  if (currentStep.value === 1 && !appointmentData.value.patient) {
    errors.value.patient = 'Por favor, selecione um paciente para continuar.'
    return false
  }
  if (
    currentStep.value === 2 &&
    (!appointmentData.value.startTime || !appointmentData.value.endTime)
  ) {
    errors.value.time = 'Selecione um horário de início e fim.'
    return false
  }

  // ✨ Nova verificação de conflito e carregamento
  if (isCheckingConflict.value) {
    errors.value.time = 'Verificando disponibilidade...'
    return false
  }
  if (conflictError.value) {
    errors.value.time = conflictError.value
    return false
  }

  return true
}

function nextStep() {
  if (validateStep()) {
    if (currentStep.value < steps.length) {
      currentStep.value++
    }
  }
}

async function handleSubmit() {
  if (!validateStep()) return

  const [startHour, startMinute] = appointmentData.value.startTime.split(':').map(Number)
  const [endHour, endMinute] = appointmentData.value.endTime.split(':').map(Number)

  const baseDate = new Date(appointmentData.value.date)
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const day = baseDate.getDate()

  const startTime = new Date(year, month, day, startHour, startMinute)
  const endTime = new Date(year, month, day, endHour, endMinute)

  const payload = {
    patient: appointmentData.value.patient,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    sendReminder: appointmentData.value.sendReminder,
  }

  const { success } = await appointmentsStore.createAppointment(payload)
  if (success) {
    toast.success('Agendamento criado com sucesso!')
    emit('close')
  } else {
    toast.error('Erro ao criar agendamento.')
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <div>
          <h2>Novo Agendamento</h2>
          <p>Preencha os dados para criar um novo atendimento.</p>
        </div>
        <button @click="$emit('close')" class="btn-close-mobile">
          <X :size="24" />
        </button>
        <Stepper :steps="steps" :currentStep="currentStep" class="stepper-component" />
      </header>

      <div class="modal-body" v-auto-animate>
        <div v-if="currentStep === 1" class="step-content">
          <SearchableSelect
            v-model="appointmentData.patient"
            :options="patientOptions"
            label="Quem é o paciente? *"
            :loading="patientsStore.isLoading"
            @search="handlePatientSearch"
            :error="!!errors.patient"
            placeholder="Digite para buscar um paciente"
          />
          <p v-if="errors.patient" class="error-message">{{ errors.patient }}</p>
          <div class="divider">
            <span>OU</span>
          </div>
          <button @click="goToCreatePatient" class="btn-outline">
            <Plus :size="16" />
            Cadastrar novo paciente
          </button>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <div class="form-group">
            <label class="form-label">Data do Atendimento</label>
            <Datepicker
              v-model="appointmentData.date"
              locale="pt-BR"
              format="dd/MM/yyyy"
              :enable-time-picker="false"
              auto-apply
              :teleport="true"
              placeholder="Selecione a data"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Horário</label>
            <div v-if="!noTimeSlotsAvailable && timeOptions.length > 0" class="time-inputs">
              <StyledSelect
                v-model="appointmentData.startTime"
                :options="timeOptions"
                placeholder="Início"
                class="time-select"
                :error="!!errors.time || !!conflictError"
              />
              <span>às</span>
              <StyledSelect
                v-model="appointmentData.endTime"
                :options="endTimeOptions"
                placeholder="Fim"
                :disabled="!appointmentData.startTime"
                class="time-select"
                :error="!!errors.time || !!conflictError"
              />
              <LoaderCircle v-if="isCheckingConflict" :size="18" class="spinner" />
            </div>
            <div v-else-if="noTimeSlotsAvailable" class="warning-message">
              <Info :size="16" /> Sem horários disponíveis para este dia após o horário atual.
            </div>
            <div v-else class="closed-message">
              <DoorClosed :size="16" /> Clínica fechada neste dia.
            </div>
             <div v-if="isOutsideWorkingHours && !conflictError" class="warning-message">
              <Info :size="16" />
              Atenção: O horário selecionado está fora do expediente da clínica.
            </div>
            <p v-if="errors.time || conflictError" class="error-message">{{ conflictError || errors.time }}</p>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content">
          <div class="reminders-card">
            <h3 class="card-title"><Bell :size="18" /> Lembretes Automáticos</h3>
            <div class="reminders-content">
              <Switch
                v-model="appointmentData.sendReminder"
                label="Ativar envio de lembretes automáticos via WhatsApp"
              />
              <div
                class="reminder-options"
                :class="{ 'is-disabled': !appointmentData.sendReminder }"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="appointmentData.remindersSent.oneDayBefore"
                    :disabled="!appointmentData.sendReminder"
                  />
                  <span>Enviar 1 dia antes</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="appointmentData.remindersSent.threeHoursBefore"
                    :disabled="!appointmentData.sendReminder"
                  />
                  <span>Enviar 2 horas antes</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">Cancelar</button>
        <div class="footer-actions">
          <button v-if="currentStep > 1" @click="currentStep--" type="button" class="btn-secondary">
            Voltar
          </button>
          <button
            v-if="currentStep < steps.length"
            @click="nextStep"
            type="button"
            class="btn-primary"
            :disabled="isCheckingConflict"
          >
            Avançar
          </button>
          <button
            v-else
            @click="handleSubmit"
            type="button"
            class="btn-primary"
            :disabled="appointmentsStore.isLoading"
          >
            {{ appointmentsStore.isLoading ? 'Agendando...' : 'Confirmar' }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fefce8;
  color: #a16207;
  border: 1px solid #fde68a;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: left;
  font-size: 0.875rem;
  margin-top: 1rem;
}
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
  max-width: 550px;
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
  position: relative;
}
.modal-header h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}
.modal-header p {
  color: var(--cinza-texto);
  margin-bottom: 1.5rem;
}
.modal-body {
  padding: 2rem;
  flex-grow: 1;
  overflow-y: auto;
}
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background-color: #f9fafb;
}
.footer-actions {
  display: flex;
  gap: 1rem;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  text-align: left;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
}
.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.time-inputs span {
  color: var(--cinza-texto);
}
.time-inputs .time-select {
  flex-grow: 1;
}

/* ✨ 10. Estilo para o spinner */
.spinner {
  color: var(--azul-principal);
  animation: spin 1s linear infinite;
  margin-left: 0.5rem; /* Espaçamento do spinner */
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ✨ 11. Estilo para o erro de conflito (a prop :error já faz isso) */
/* Mas vamos garantir que o erro de conflito também aplique a borda vermelha */
:deep(.time-select .select-button.has-error) {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}


.divider {
  text-align: center;
  margin: 0.5rem 0;
  color: var(--cinza-texto);
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.divider::before,
.divider::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background-color: #e5e7eb;
}
.divider span {
  padding: 0 1rem;
}
.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: var(--branco);
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-outline:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.closed-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.reminders-card {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.reminders-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.reminder-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: opacity 0.3s ease-in-out;
  padding-left: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}

.reminder-options.is-disabled {
  opacity: 0.5;
}
.reminder-options.is-disabled .checkbox-label {
  cursor: not-allowed;
  color: #9ca3af;
}

.checkbox-label input[type='checkbox'] {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.4rem;
  border: 2px solid #d1d5db;
  background: #fff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  accent-color: var(--azul-principal);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  position: relative;
  appearance: none;
  display: inline-block;
  vertical-align: middle;
}

.checkbox-label input[type='checkbox']:checked {
  border-color: var(--azul-principal);
  background: var(--azul-principal);
  box-shadow: 0 2px 6px rgba(30, 64, 175, 0.08);
}

.checkbox-label input[type='checkbox']:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.checkbox-label input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 0.45rem;
  width: 0.35rem;
  height: 0.7rem;
  border: solid #fff;
  border-width: 0 0.18rem 0.18rem 0;
  transform: rotate(45deg);
  display: block;
}

.btn-primary {
  background: var(--azul-principal);
  color: var(--branco);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background: #1e40af;
}
.btn-primary:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}
.btn-secondary {
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

.btn-close-mobile {
  display: none;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    background: var(--branco);
    align-items: stretch;
  }
  .modal-content {
    max-width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
  .btn-close-mobile {
    display: block;
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  .modal-footer {
    margin-top: auto;
    justify-content: flex-end;
  }
  .modal-footer > .btn-secondary:first-child {
    display: none;
  }
  .footer-actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }
  .footer-actions .btn-primary,
  .footer-actions .btn-secondary {
    flex-grow: 1;
    justify-content: center;
  }

  .stepper-component :deep(.step-details),
  .stepper-component :deep(.step-line) {
    display: none;
  }
  .stepper-component :deep(.stepper) {
    justify-content: center;
    padding: 0;
    gap: 1.5rem;
  }
  .modal-header p {
    margin-bottom: 1rem;
  }
  .modal-body {
    padding: 1.5rem;
  }
}
</style>
