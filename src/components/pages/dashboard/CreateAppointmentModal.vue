<script setup>
import { ref, computed, watch } from 'vue'
import { usePatientsStore } from '@/stores/patients'
import { useAppointmentsStore } from '@/stores/appointments'
import { useClinicStore } from '@/stores/clinic'
import { useToast } from 'vue-toastification'
import { User, Calendar, Bell, DoorClosedLocked } from 'lucide-vue-next'

import Stepper from '@/components/pages/onboarding/Stepper.vue'
import SearchableSelect from '@/components/global/SearchableSelect.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import Switch from '@/components/global/Switch.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const emit = defineEmits(['close'])
const patientsStore = usePatientsStore()
const appointmentsStore = useAppointmentsStore()
const clinicStore = useClinicStore()
const toast = useToast()

let debounceTimeout = null
const currentStep = ref(1)
const validationError = ref(false)

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
  { name: 'Paciente', subtitle: 'Selecione o paciente', icon: User },
  { name: 'Data e Opções', subtitle: 'Defina o horário e lembretes', icon: Calendar },
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

const patientOptions = computed(() => {
  return (patientsStore.searchResults || []).map((p) => ({ value: p._id, label: p.name }))
})

const timeOptions = computed(() => {
  const selectedDay = getDayOfWeek(appointmentData.value.date)
  const workingHours = clinicWorkingHours.value[selectedDay]
  if (!workingHours) return []

  const options = []
  let currentTime = new Date(`1970-01-01T${workingHours.open}:00`)
  const closingTime = new Date(`1970-01-01T${workingHours.close}:00`)

  while (currentTime <= closingTime) {
    const timeStr = currentTime.toTimeString().substring(0, 5)
    options.push({ value: timeStr, label: timeStr })
    currentTime.setMinutes(currentTime.getMinutes() + 30)
  }
  return options
})

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

watch(
  () => appointmentData.value.date,
  () => {
    appointmentData.value.startTime = null
    appointmentData.value.endTime = null
  },
)

function nextStep() {
  if (currentStep.value === 1 && !appointmentData.value.patient) {
    validationError.value = true
    toast.error('Por favor, selecione um paciente para continuar.')
    return
  }
  validationError.value = false
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

async function handleSubmit() {
  if (!appointmentData.value.startTime || !appointmentData.value.endTime) {
    toast.error('Por favor, selecione um horário de início e fim.')
    return
  }

  const [startHour, startMinute] = appointmentData.value.startTime.split(':')
  const startTime = new Date(appointmentData.value.date)
  startTime.setHours(startHour, startMinute, 0, 0)

  const [endHour, endMinute] = appointmentData.value.endTime.split(':')
  const endTime = new Date(appointmentData.value.date)
  endTime.setHours(endHour, endMinute, 0, 0)

  const payload = {
    patient: appointmentData.value.patient,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    sendReminder: appointmentData.value.sendReminder,
    remindersSent: appointmentData.value.sendReminder
      ? appointmentData.value.remindersSent
      : {
          oneDayBefore: false,
          threeHoursBefore: false,
        },
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
        <Stepper :steps="steps" :currentStep="currentStep" />
      </header>

      <div class="modal-body" v-auto-animate>
        <div v-if="currentStep === 1" class="step-content">
          <SearchableSelect
            v-model="appointmentData.patient"
            :options="patientOptions"
            label="Paciente *"
            :loading="patientsStore.isLoading"
            @search="handlePatientSearch"
            :error="validationError"
            placeholder="Digite para buscar um paciente"
          />
        </div>

        <div v-if="currentStep === 2" class="step-content step-grid">
          <div class="form-column">
            <div class="form-group">
              <label class="form-label">Data do Atendimento</label>
              <Datepicker
                v-model="appointmentData.date"
                locale="pt-BR"
                format="dd/MM/yyyy"
                :enable-time-picker="false"
                auto-apply
                :teleport="'.modal-content'"
                placeholder="Selecione a data"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Horário</label>
              <div v-if="timeOptions.length > 0" class="time-inputs">
                <StyledSelect
                  v-model="appointmentData.startTime"
                  :options="timeOptions"
                  placeholder="Início"
                  class="time-select"
                />
                <span>às</span>
                <StyledSelect
                  v-model="appointmentData.endTime"
                  :options="endTimeOptions"
                  placeholder="Fim"
                  :disabled="!appointmentData.startTime"
                  class="time-select"
                />
              </div>
              <div v-else class="closed-message"><DoorClosedLocked /> Clínica fechada neste dia.</div>
            </div>
          </div>
          <div class="form-column reminders-section">
            <div class="reminder-header">
              <Bell :size="16" />
              <label class="form-label">Lembretes Automáticos</label>
            </div>
            <Switch
              v-model="appointmentData.sendReminder"
              label="Ativar envio de lembretes via WhatsApp"
            />

            <div class="reminder-options" :class="{ 'is-disabled': !appointmentData.sendReminder }">
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

      <footer class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">Cancelar</button>
        <button v-if="currentStep > 1" @click="currentStep--" type="button" class="btn-secondary">
          Voltar
        </button>
        <button
          v-if="currentStep < steps.length"
          @click="nextStep"
          type="button"
          class="btn-primary"
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
          {{ appointmentsStore.isLoading ? 'Agendando...' : 'Confirmar Agendamento' }}
        </button>
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
  max-width: 650px;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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
  min-height: 280px;
}
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: #f9fafb;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.step-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}
.form-column {
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

.reminders-section {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.reminder-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.reminder-header .form-label {
  margin-bottom: 0;
}
.reminder-header svg {
  color: #4b5563;
}

.reminder-options {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: opacity 0.3s ease-in-out;
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
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  accent-color: var(--azul-principal);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  position: relative;
  appearance: none;
  display: inline-block;
  vertical-align: middle;
}

.checkbox-label input[type='checkbox']:checked {
  border-color: var(--azul-principal);
  background: var(--azul-principal);
  box-shadow: 0 2px 6px rgba(30,64,175,0.08);
}

.checkbox-label input[type='checkbox']:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #bfdbfe;
}

/* Checkmark */
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
</style>
