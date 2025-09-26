<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patients';
import { useToast } from 'vue-toastification';
import { ArrowLeft, Edit } from 'lucide-vue-next';
import StepPersonalData from '@/components/pages/pacientes/steps/StepPersonalData.vue';
import StepAddressData from '@/components/pages/pacientes/steps/StepAddressData.vue';

const route = useRoute();
const router = useRouter();
const patientsStore = usePatientsStore();
const toast = useToast();

const isEditing = ref(false);
const editablePatient = ref(null);

const patient = computed(() => patientsStore.selectedPatient);

onMounted(() => {
  const patientId = route.params.id;
  patientsStore.fetchPatientById(patientId);
  if (route.query.edit === 'true') {
    isEditing.value = true;
  }
});

watch(patient, (newVal) => {
  if (newVal) {
    editablePatient.value = JSON.parse(JSON.stringify(newVal));
  }
});

async function handleSaveChanges() {
  const { success } = await patientsStore.updatePatient(patient.value._id, editablePatient.value);
  if (success) {
    toast.success("Paciente atualizado com sucesso!");
    isEditing.value = false;
    await patientsStore.fetchPatientById(patient.value._id); // Recarrega os dados para exibir
  } else {
    toast.error("Erro ao atualizar o paciente.");
  }
}

const formattedBirthDate = computed(() => {
  if (patient.value?.birthDate) {
    return new Date(patient.value.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }
  return '';
});
</script>

<template>
  <div class="patient-detail-view">
    <div v-if="patientsStore.isLoading && !patient">Carregando dados do paciente...</div>

    <div v-else-if="patient">
      <header class="page-header">
        <div class="header-main">
          <button @click="router.push('/app/pacientes')" class="back-button">
            <ArrowLeft :size="20" />
          </button>
          <div>
            <h1 class="title">{{ patient.name }}</h1>
            <p class="subtitle">Perfil detalhado do paciente.</p>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="!isEditing" @click="isEditing = true" class="btn-primary">
            <Edit :size="16" /> Editar Paciente
          </button>
        </div>
      </header>

      <div v-if="isEditing && editablePatient">
        <form @submit.prevent="handleSaveChanges" class="edit-form">
          <StepPersonalData v-model="editablePatient" />
          <div class="separator"></div>
          <StepAddressData v-model="editablePatient.address" />
          <footer class="form-actions">
            <button @click="isEditing = false; editablePatient = JSON.parse(JSON.stringify(patient))" type="button" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Salvar Alterações</button>
          </footer>
        </form>
      </div>

      <div v-else class="details-grid">
        <div class="detail-card">
          <h3>Dados Pessoais</h3>
          <p><strong>Data de Nasc.:</strong> {{ formattedBirthDate }}</p>
          <p><strong>Gênero:</strong> {{ patient.gender }}</p>
          <p><strong>CPF:</strong> {{ patient.cpf }}</p>
          <p><strong>Telefone:</strong> {{ patient.phone }}</p>
        </div>
        <div class="detail-card" v-if="patient.address && patient.address.street">
          <h3>Endereço</h3>
          <p>{{ patient.address.street }}, {{ patient.address.number }}</p>
          <p>{{ patient.address.district }}, {{ patient.address.city }} - {{ patient.address.state }}</p>
          <p><strong>CEP:</strong> {{ patient.address.cep }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Paciente não encontrado.</p>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.header-main { display: flex; align-items: center; gap: 1rem; }
.back-button { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e5e7eb; background-color: var(--branco); cursor: pointer; transition: background-color 0.2s ease; }
.back-button:hover { background-color: #f9fafb; }
.title { font-size: 1.75rem; font-weight: 700; margin: 0; }
.subtitle { color: var(--cinza-texto); margin-top: 0.25rem; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
.detail-card { background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; }
.detail-card h3 { font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; margin-bottom: 1rem; }
.detail-card p { color: #374151; margin-bottom: 0.5rem; line-height: 1.6; }
.edit-form { background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 1rem; padding: 2rem; }
.separator { height: 1px; background-color: #e5e7eb; margin: 2rem 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-secondary { background-color: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
</style>
