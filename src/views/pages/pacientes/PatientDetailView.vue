<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patients';
import { useAnamnesisStore } from '@/stores/anamnesis';
import { useAppointmentsStore } from '@/stores/appointments';
import { useToast } from 'vue-toastification';
import { ArrowLeft, Edit, Clipboard, FileText, CheckSquare, Copy, History, Eye } from 'lucide-vue-next';
import StepPersonalData from '@/components/pages/pacientes/steps/StepPersonalData.vue';
import StepAddressData from '@/components/pages/pacientes/steps/StepAddressData.vue';
import AssignAnamnesisModal from '@/components/pages/pacientes/modals/AssignAnamnesisModal.vue';
import ViewAnamnesisModal from '@/components/pages/pacientes/modals/ViewAnamnesisModal.vue';

const route = useRoute();
const router = useRouter();
const patientsStore = usePatientsStore();
const anamnesisStore = useAnamnesisStore();
const appointmentsStore = useAppointmentsStore();
const toast = useToast();

const isEditing = ref(false);
const isAssignModalOpen = ref(false);
const editablePatient = ref(null);
const activeTab = ref('details');
const viewingAnamnesis = ref(null);

const patient = computed(() => patientsStore.selectedPatient);
const answeredAnamneses = computed(() => anamnesisStore.answeredAnamneses);
const pendingAnamneses = computed(() => anamnesisStore.pendingAnamneses);
const patientHistory = computed(() => appointmentsStore.patientAppointments);

onMounted(() => {
  const patientId = route.params.id;
  patientsStore.fetchPatientById(patientId);
  anamnesisStore.fetchAnamnesisForPatient(patientId);
  appointmentsStore.fetchAppointmentsByPatient(patientId);
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
    await patientsStore.fetchPatientById(patient.value._id);
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

function formatSimpleDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function handleCopyLink(token) {
  if (!token) return;
  const link = `${window.location.origin}/responder-anamnese/${token}`;
  navigator.clipboard.writeText(link);
  toast.info('Link de resposta copiado!');
}
</script>

<template>
  <div class="patient-detail-view">
    <AssignAnamnesisModal
      v-if="isAssignModalOpen"
      :patient-id="patient?._id"
      @close="isAssignModalOpen = false"
    />
    <ViewAnamnesisModal
      v-if="viewingAnamnesis"
      :anamnesis="viewingAnamnesis"
      @close="viewingAnamnesis = null"
    />

    <div v-if="patientsStore.isLoading && !patient" class="loading-state">Carregando dados do paciente...</div>

    <div v-else-if="patient">
      <header class="patient-header">
        <div class="patient-info">
          <div class="patient-avatar">
            {{ patient.name.charAt(0) }}
          </div>
          <div>
            <h1 class="patient-name">{{ patient.name }}</h1>
            <div class="patient-meta">
              <span>ID: #{{ patient._id.slice(-6).toUpperCase() }}</span>
              <span>{{ patient.phone }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button @click="isAssignModalOpen = true" class="btn-secondary">
            <Clipboard :size="16" /> Aplicar Anamnese
          </button>
          <button v-if="!isEditing" @click="isEditing = true" class="btn-primary">
            <Edit :size="16" /> Editar Paciente
          </button>
        </div>
      </header>

      <nav class="tabs-nav">
        <button @click="activeTab = 'details'" :class="{ active: activeTab === 'details' }">Detalhes</button>
        <button @click="activeTab = 'anamneses'" :class="{ active: activeTab === 'anamneses' }">Anamneses</button>
        <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">Histórico</button>
      </nav>

      <div class="tab-content">
        <div v-if="activeTab === 'details'">
          <div v-if="isEditing && editablePatient" class="edit-form">
            <form @submit.prevent="handleSaveChanges">
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

        <div v-if="activeTab === 'anamneses'">
          <div class="anamnesis-section">
            <h3><CheckSquare :size="20"/> Respondidas</h3>
            <ul v-if="answeredAnamneses.length > 0" class="anamnesis-list">
              <li v-for="item in answeredAnamneses" :key="item._id" @click="viewingAnamnesis = item" class="clickable">
                <div class="anamnesis-info">
                  <span class="anamnesis-name">{{ item.template.name }}</span>
                  <span class="anamnesis-date">Respondida em {{ formatSimpleDate(item.updatedAt) }}</span>
                </div>
              </li>
            </ul>
            <p v-else class="empty-list-message">Nenhuma anamnese respondida.</p>
          </div>
          <div class="anamnesis-section">
            <h3><FileText :size="20"/> Pendentes</h3>
             <ul v-if="pendingAnamneses.length > 0" class="anamnesis-list">
              <li v-for="item in pendingAnamneses" :key="item._id">
                <div class="anamnesis-info">
                  <span class="anamnesis-name">{{ item.template.name }}</span>
                  <span class="anamnesis-date">Vence em {{ formatSimpleDate(item.patientAccessTokenExpires) }}</span>
                </div>
                <button @click.stop="handleCopyLink(item.patientAccessToken)" class="btn-icon" title="Copiar link de resposta">
                  <Copy :size="16" />
                </button>
              </li>
            </ul>
            <p v-else class="empty-list-message">Nenhuma anamnese pendente.</p>
          </div>
        </div>

        <div v-if="activeTab === 'history'">
            <div class="history-section">
                <h3><History :size="20"/> Histórico de Atendimentos</h3>
                <div v-if="appointmentsStore.isLoading" class="loading-state">Carregando histórico...</div>
                <ul v-else-if="patientHistory.length > 0" class="history-list">
                    <li v-for="item in patientHistory" :key="item._id">
                        <div class="history-info">
                            <span class="history-date">{{ formatSimpleDate(item.startTime) }}</span>
                            <span class="status-badge" :class="item.status.toLowerCase().replace(' ', '-')">{{ item.status }}</span>
                        </div>
                        <router-link
                            v-if="item.status === 'Realizado'"
                            :to="`/app/atendimentos/${item._id}/patient/${patient._id}`"
                            class="btn-secondary"
                        >
                            <Eye :size="16" />
                            Ver Relatório
                        </router-link>
                    </li>
                </ul>
                <p v-else class="empty-list-message">Nenhum atendimento registrado para este paciente.</p>
            </div>
        </div>

      </div>
    </div>
    <div v-else class="loading-state">
      Paciente não encontrado.
    </div>
  </div>
</template>

<style scoped>
.patient-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.patient-info { display: flex; align-items: center; gap: 1rem; }
.patient-avatar { width: 64px; height: 64px; border-radius: 50%; background-color: #eef2ff; color: var(--azul-principal); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 600; }
.patient-name { font-size: 2rem; font-weight: 700; margin: 0; }
.patient-meta { display: flex; gap: 1rem; color: var(--cinza-texto); margin-top: 0.25rem; }
.header-actions { display: flex; gap: 0.75rem; }
.tabs-nav { display: flex; gap: 0.5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 2rem; }
.tabs-nav button { padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; font-weight: 600; font-size: 1rem; color: var(--cinza-texto); border-bottom: 2px solid transparent; transition: all 0.2s ease; }
.tabs-nav button.active { color: var(--azul-principal); border-bottom-color: var(--azul-principal); }
.anamnesis-section { margin-bottom: 2.5rem; }
.anamnesis-section h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.anamnesis-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding: 0; }
.anamnesis-list li { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; }
.anamnesis-list li.clickable { cursor: pointer; transition: background-color 0.2s ease; }
.anamnesis-list li.clickable:hover { background-color: #f3f4f6; }
.anamnesis-info { display: flex; flex-direction: column; gap: 0.25rem; }
.anamnesis-name { font-weight: 500; }
.anamnesis-date { font-size: 0.875rem; color: var(--cinza-texto); }
.empty-list-message { color: var(--cinza-texto); }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
.detail-card { background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; }
.detail-card h3 { font-size: 1.125rem; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; margin-bottom: 1rem; }
.detail-card p { color: #374151; margin-bottom: 0.5rem; line-height: 1.6; }
.edit-form { background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 1rem; padding: 2rem; }
.separator { height: 1px; background-color: #e5e7eb; margin: 2rem 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; }
.btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; text-decoration: none; }
.loading-state { padding: 2rem; text-align: center; color: var(--cinza-texto); }
.history-section h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
.history-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
.history-list li { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 1rem; }
.history-info { display: flex; align-items: center; gap: 1.5rem; }
.history-date { font-weight: 500; font-size: 1rem; color: #374151; }
.status-badge { font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.875rem; text-transform: capitalize; }
.status-badge.realizado { background-color: #f0fdf4; color: #16a34a; }
.status-badge.cancelado { background-color: #fef2f2; color: #dc2626; }
.status-badge.agendado { background-color: #eff6ff; color: #2563eb; }
.status-badge.não-compareceu { background-color: #f1f5f9; color: #64748b; }
</style>
