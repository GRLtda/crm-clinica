<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import { useAppointmentsStore } from '@/stores/appointments';
import { useToast } from 'vue-toastification';
import { User, Calendar, Clock } from 'lucide-vue-next';
import Stepper from '@/components/pages/onboarding/Stepper.vue';
import StyledSelect from '@/components/global/StyledSelect.vue';
import CustomSelect from '@/components/global/CustomSelect.vue';
import FormInput from '@/components/global/FormInput.vue';

const emit = defineEmits(['close']);
const patientsStore = usePatientsStore();
const appointmentsStore = useAppointmentsStore();
const toast = useToast();

const currentStep = ref(1);
const steps = [
  { name: 'Paciente', subtitle: 'Selecione o paciente', icon: User },
  { name: 'Data e Hora', subtitle: 'Escolha o horário', icon: Calendar },
];

const appointmentData = ref({
  patient: null,
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
});

const patientOptions = computed(() => {
  if (Array.isArray(patientsStore.allPatients)) {
    return patientsStore.allPatients.map(p => ({ value: p._id, label: p.name }));
  }
  return [];
});

const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});

onMounted(() => {
  patientsStore.fetchAllPatients();
});

function nextStep() {
  if (currentStep.value < steps.length) currentStep.value++;
}

async function handleSubmit() {
  // Combina data e hora para o formato ISO 8601
  const startTime = new Date(`${appointmentData.value.date}T${appointmentData.value.startTime}:00`).toISOString();
  const endTime = new Date(`${appointmentData.value.date}T${appointmentData.value.endTime}:00`).toISOString();

  const payload = {
    patient: appointmentData.value.patient,
    startTime,
    endTime,
  };

  const { success } = await appointmentsStore.createAppointment(payload);
  if (success) {
    toast.success("Agendamento criado com sucesso!");
    emit('close');
  } else {
    toast.error("Erro ao criar agendamento.");
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
        <div v-if="currentStep === 1">
          <StyledSelect v-model="appointmentData.patient" :options="patientOptions" label="Paciente" />
        </div>
        <div v-if="currentStep === 2" class="date-time-grid">
          <FormInput v-model="appointmentData.date" type="date" label="Data do Atendimento" />
          <div class="time-selects">
            <label class="form-label">Horário</label>
            <div class="time-inputs">
              <CustomSelect v-model="appointmentData.startTime" :options="timeOptions" />
              <span>às</span>
              <CustomSelect v-model="appointmentData.endTime" :options="timeOptions" />
            </div>
          </div>
        </div>
      </div>
      <footer class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">Cancelar</button>
        <button v-if="currentStep > 1" @click="currentStep--" type="button" class="btn-secondary">Voltar</button>
        <button v-if="currentStep < steps.length" @click="nextStep" type="button" class="btn-primary">Avançar</button>
        <button v-else @click="handleSubmit" type="button" class="btn-primary" :disabled="appointmentsStore.isLoading">
          {{ appointmentsStore.isLoading ? 'Agendando...' : 'Agendar' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(249, 250, 251, 0.7); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.modal-content { background: var(--branco); width: 100%; max-width: 600px; border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
.modal-header p { color: var(--cinza-texto); margin-bottom: 1.5rem; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 1rem; background-color: #f9fafb; }
.date-time-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; align-items: flex-end; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
.time-inputs { display: flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: var(--azul-principal); color: var(--branco); border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.btn-secondary { background: var(--branco); border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
</style>
