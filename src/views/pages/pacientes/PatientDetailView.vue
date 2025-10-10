<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientsStore } from '@/stores/patients'
import { useAnamnesisStore } from '@/stores/anamnesis'
import { useAppointmentsStore } from '@/stores/appointments'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { generateAnamnesisPdf } from '@/helpers/pdf-generator'

import {
  FileDown,
  ArrowLeft,
  Edit,
  Clipboard,
  FileText,
  CheckSquare,
  Copy,
  History,
  Eye,
  ClipboardList,
  MapPin,
  ClipboardCheck,
  ClipboardPlus,
  CalendarPlus,
} from 'lucide-vue-next'
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import { fetchAddressByCEP } from '@/api/external'
import AssignAnamnesisModal from '@/components/pages/pacientes/modals/AssignAnamnesisModal.vue'
import ViewAnamnesisModal from '@/components/pages/pacientes/modals/ViewAnamnesisModal.vue'
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue'
import PdfPreviewModal from '@/components/pages/pacientes/modals/PdfPreviewModal.vue'

const route = useRoute()
const router = useRouter()
const patientsStore = usePatientsStore()
const anamnesisStore = useAnamnesisStore()
const appointmentsStore = useAppointmentsStore()
const authStore = useAuthStore()
const toast = useToast()

const isEditing = ref(false)
const isAssignModalOpen = ref(false)
const editablePatient = ref(null)
const activeTab = ref('details')
const viewingAnamnesis = ref(null)
const isCreateAppointmentModalOpen = ref(false)
const pdfPreview = ref({ url: null, name: null })

const patient = computed(() => patientsStore.selectedPatient)
const clinic = computed(() => authStore.user?.clinic)
const answeredAnamneses = computed(() => anamnesisStore.answeredAnamneses)
const pendingAnamneses = computed(() => anamnesisStore.pendingAnamneses)
const patientHistory = computed(() => appointmentsStore.patientAppointments)

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
]

const lastAppointment = computed(() => {
  if (patientHistory.value && patientHistory.value.length > 0) {
    return [...patientHistory.value].sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime),
    )[0]
  }
  return null
})

onMounted(() => {
  const patientId = route.params.id
  patientsStore.fetchPatientById(patientId)
  anamnesisStore.fetchAnamnesisForPatient(patientId)
  appointmentsStore.fetchAppointmentsByPatient(patientId)
  if (route.query.edit === 'true') {
    isEditing.value = true
  }
})

watch(patient, (newVal) => {
  if (newVal) {
    editablePatient.value = JSON.parse(JSON.stringify({ ...newVal, address: newVal.address || {} }))
  }
})

watch(
  () => editablePatient.value?.address?.cep,
  async (newCep) => {
    if (newCep && editablePatient.value) {
      const numericCep = newCep.replace(/\D/g, '')
      if (numericCep.length === 8) {
        const address = await fetchAddressByCEP(numericCep)
        if (address) {
          editablePatient.value.address = {
            ...editablePatient.value.address,
            street: address.street,
            district: address.neighborhood,
            city: address.city,
            state: address.state,
          }
        }
      }
    }
  },
)

function cancelEditing() {
  isEditing.value = false
  editablePatient.value = JSON.parse(JSON.stringify(patient.value))
}

async function handleSaveChanges() {
  const { success } = await patientsStore.updatePatient(patient.value._id, editablePatient.value)
  if (success) {
    toast.success('Paciente atualizado com sucesso!')
    isEditing.value = false
    await patientsStore.fetchPatientById(patient.value._id)
  } else {
    toast.error('Erro ao atualizar o paciente.')
  }
}

const formattedBirthDate = computed(() => {
  if (patient.value?.birthDate) {
    return new Date(patient.value.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }
  return ''
})

function formatSimpleDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function handleCopyLink(token) {
  const link = `${window.location.origin}/responder-anamnese/${token}`
  navigator.clipboard.writeText(link).then(() => {
    toast.info('Link de resposta copiado!')
  })
}

async function handleGeneratePdf(anamnesis) {
  if (!patient.value || !clinic.value) {
    toast.error('Dados do paciente ou da clínica não carregados.')
    return
  }

  const loadingToast = toast.info('Gerando PDF...', { timeout: false })

  const fullTemplate = await anamnesisStore.fetchTemplateById(anamnesis.template._id)

  if (!fullTemplate) {
    toast.dismiss(loadingToast)
    toast.error('Não foi possível carregar o modelo da anamnese para gerar o PDF.')
    return
  }

  const completeAnamnesisData = { ...anamnesis, template: fullTemplate }
  const { fileName, pdfDataUri } = await generateAnamnesisPdf(
    completeAnamnesisData,
    patient.value,
    clinic.value,
  )

  toast.dismiss(loadingToast)
  pdfPreview.value = { url: pdfDataUri, name: fileName }
}
</script>

<template>
  <div class="patient-detail-view">
    <CreateAppointmentModal
      v-if="isCreateAppointmentModalOpen"
      @close="isCreateAppointmentModalOpen = false"
    />
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
    <PdfPreviewModal
      v-if="pdfPreview.url"
      :pdf-url="pdfPreview.url"
      :file-name="pdfPreview.name"
      @close="pdfPreview = { url: null, name: null }"
    />

    <div v-if="patientsStore.isLoading && !patient" class="loading-state">
      Carregando dados do paciente...
    </div>

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
            <Clipboard :size="16" />
            <span class="btn-text">Aplicar Anamnese</span>
          </button>
          <button v-if="!isEditing" @click="isEditing = true" class="btn-primary btn-edit">
            <Edit :size="16" />
            <span class="btn-text">Editar</span>
          </button>
        </div>
      </header>

      <nav class="tabs-nav">
        <button @click="activeTab = 'details'" :class="{ active: activeTab === 'details' }">
          Detalhes
        </button>
        <button @click="activeTab = 'anamneses'" :class="{ active: activeTab === 'anamneses' }">
          Anamneses
        </button>
        <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">
          Histórico
        </button>
      </nav>

      <div class="tab-content">
        <div v-if="activeTab === 'details'">
          <div v-if="isEditing && editablePatient" class="unified-card">
            <form @submit.prevent="handleSaveChanges">
              <section class="card-section">
                <h3 class="section-title"><ClipboardList :size="18" /> Dados Pessoais</h3>
                <div class="section-content grid-2-cols">
                  <FormInput
                    v-model="editablePatient.name"
                    label="Nome Completo"
                    placeholder="Nome do paciente"
                    required
                  />
                  <FormInput
                    v-model="editablePatient.birthDate"
                    label="Data de Nascimento"
                    type="date"
                    required
                  />
                  <FormInput
                    v-model="editablePatient.cpf"
                    label="CPF"
                    placeholder="000.000.000-00"
                    cpf-mask
                  />
                  <FormInput
                    v-model="editablePatient.phone"
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    required
                    phone-mask
                  />
                  <StyledSelect
                    v-model="editablePatient.gender"
                    label="Gênero"
                    :options="genderOptions"
                  />
                </div>
              </section>

              <div class="divider"></div>

              <section class="card-section">
                <h3 class="section-title"><MapPin :size="18" /> Endereço</h3>
                <div class="section-content grid-2-cols">
                  <FormInput v-model="editablePatient.address.cep" label="CEP" />
                  <FormInput v-model="editablePatient.address.street" label="Rua / Logradouro" />
                  <FormInput v-model="editablePatient.address.number" label="Número" />
                  <FormInput v-model="editablePatient.address.district" label="Bairro" />
                  <FormInput v-model="editablePatient.address.city" label="Cidade" />
                  <FormInput v-model="editablePatient.address.state" label="Estado" />
                </div>
              </section>

              <footer class="edit-form-footer">
                <button @click="cancelEditing" type="button" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">Salvar Alterações</button>
              </footer>
            </form>
          </div>
          <div v-else class="unified-card">
            <section class="card-section">
              <h3 class="section-title"><ClipboardList :size="18" /> Dados Pessoais</h3>
              <div class="section-content grid-2-cols">
                <div class="detail-item">
                  <span class="label">Data de Nasc.</span>
                  <strong class="value">{{ formattedBirthDate }}</strong>
                </div>
                <div class="detail-item">
                  <span class="label">Gênero</span>
                  <strong class="value">{{ patient.gender }}</strong>
                </div>
                <div class="detail-item">
                  <span class="label">CPF</span>
                  <strong class="value">{{ patient.cpf }}</strong>
                </div>
                <div class="detail-item">
                  <span class="label">Telefone</span>
                  <strong class="value">{{ patient.phone }}</strong>
                </div>
              </div>
            </section>

            <div class="divider"></div>

            <section class="card-section" v-if="patient.address && patient.address.street">
              <h3 class="section-title"><MapPin :size="18" /> Endereço</h3>
              <div class="section-content grid-2-cols">
                <div class="detail-item">
                  <span class="label">Logradouro</span>
                  <strong class="value"
                    >{{ patient.address.street }}, {{ patient.address.number }}</strong
                  >
                </div>
                <div class="detail-item">
                  <span class="label">Bairro</span>
                  <strong class="value">{{ patient.address.district }}</strong>
                </div>
                <div class="detail-item">
                  <span class="label">Cidade / Estado</span>
                  <strong class="value"
                    >{{ patient.address.city }} - {{ patient.address.state }}</strong
                  >
                </div>
                <div class="detail-item">
                  <span class="label">CEP</span>
                  <strong class="value">{{ patient.address.cep }}</strong>
                </div>
              </div>
            </section>

            <div class="divider"></div>

            <section class="card-section">
              <h3 class="section-title"><History :size="18" /> Histórico Recente</h3>
              <div class="section-content">
                <div v-if="lastAppointment" class="last-appointment-item">
                  <span class="label">Último Atendimento</span>
                  <div class="value-with-badge">
                    <strong>{{ formatSimpleDate(lastAppointment.startTime) }}</strong>
                    <span
                      class="status-badge"
                      :class="lastAppointment.status.toLowerCase().replace(' ', '-')"
                      >{{ lastAppointment.status }}</span
                    >
                  </div>
                </div>
                <p v-else class="empty-list-message">Nenhum atendimento anterior registrado.</p>
              </div>
            </section>
          </div>
        </div>

        <div v-if="activeTab === 'anamneses'">
          <div class="anamnesis-section">
            <h3 class="title-respondidas"><CheckSquare :size="20" /> Respondidas</h3>
            <ul v-if="answeredAnamneses.length > 0" class="anamnesis-list">
              <li v-for="item in answeredAnamneses" :key="item._id">
                <div class="anamnesis-info clickable" @click="viewingAnamnesis = item">
                  <span class="anamnesis-name">{{
                    item.template?.name || 'Modelo não encontrado'
                  }}</span>
                  <span class="anamnesis-date"
                    >Respondida em {{ formatSimpleDate(item.updatedAt) }}</span
                  >
                </div>
                <button
                  @click.stop="handleGeneratePdf(item)"
                  class="btn-icon"
                  title="Visualizar PDF"
                >
                  <FileDown :size="16" />
                </button>
              </li>
            </ul>

            <div v-else class="empty-state-card">
              <div class="empty-state-icon">
                <ClipboardCheck :size="40" />
              </div>
              <h4 class="empty-state-title">Nenhuma anamnese respondida</h4>
              <p class="empty-state-text">
                As anamneses preenchidas pelo paciente aparecerão aqui.
              </p>
            </div>
          </div>

          <div class="anamnesis-section">
            <h3 class="title-pendentes"><FileText :size="20" /> Pendentes</h3>
            <ul v-if="pendingAnamneses.length > 0" class="anamnesis-list">
              <li v-for="item in pendingAnamneses" :key="item._id">
                <div class="anamnesis-info">
                  <span class="anamnesis-name">{{
                    item.template?.name || 'Modelo não encontrado'
                  }}</span>
                  <span class="anamnesis-date"
                    >Vence em {{ formatSimpleDate(item.patientAccessTokenExpires) }}</span
                  >
                </div>
                <button
                  @click.stop="handleCopyLink(item.patientAccessToken)"
                  class="btn-icon"
                  title="Copiar link de resposta"
                >
                  <Copy :size="16" />
                </button>
              </li>
            </ul>
            <div v-else class="empty-state-card">
              <div class="empty-state-icon">
                <ClipboardPlus :size="40" />
              </div>
              <h4 class="empty-state-title">Nenhuma anamnese pendente</h4>
              <p class="empty-state-text">
                Você pode aplicar um modelo de anamnese para gerar um link de resposta para o
                paciente.
              </p>
              <button @click="isAssignModalOpen = true" class="empty-state-button">
                <Clipboard :size="16" />
                Aplicar Anamnese
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'history'">
          <div class="history-section">
            <h3 class="title-historico"><History :size="20" /> Histórico de Atendimentos</h3>
            <div v-if="appointmentsStore.isLoading" class="loading-state">
              Carregando histórico...
            </div>
            <ul v-else-if="patientHistory.length > 0" class="history-list">
              <li v-for="item in patientHistory" :key="item._id">
                <div class="history-info">
                  <span class="history-date">{{ formatSimpleDate(item.startTime) }}</span>
                  <span class="status-badge" :class="item.status.toLowerCase().replace(' ', '-')">{{
                    item.status
                  }}</span>
                </div>
                <router-link
                  v-if="item.status === 'Realizado'"
                  :to="`/app/atendimentos/${item._id}/patient/${patient._id}`"
                  class="btn-secondary"
                >
                  <Eye :size="16" />
                  <span class="btn-text">Ver Relatório</span>
                </router-link>
              </li>
            </ul>
            <div v-else class="empty-state-card">
              <div class="empty-state-icon">
                <History :size="40" />
              </div>
              <h4 class="empty-state-title">Nenhum histórico encontrado</h4>
              <p class="empty-state-text">
                Este paciente ainda não possui atendimentos registrados. Que tal agendar o primeiro?
              </p>
              <button @click="isCreateAppointmentModalOpen = true" class="empty-state-button">
                <CalendarPlus :size="16" />
                Agendar Atendimento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
  min-width: 200px;
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
.patient-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}
.patient-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--cinza-texto);
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
}
.tabs-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}
.tabs-nav button {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: var(--cinza-texto);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.tabs-nav button.active {
  color: var(--azul-principal);
  border-bottom-color: var(--azul-principal);
}
.unified-card {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
}
.card-section {
  padding: 1.5rem 2rem;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--azul-principal);
  margin: 0 0 1.5rem 0;
}
.divider {
  height: 1px;
  background-color: #f3f4f6;
}
.section-content.grid-2-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem 2rem;
}
.detail-item,
.last-appointment-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.label {
  font-size: 0.8rem;
  color: var(--cinza-texto);
  text-transform: uppercase;
}
.value {
  font-size: 1rem;
  font-weight: 500;
}
.edit-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #f3f4f6;
  background-color: #f9fafb;
}
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-primary {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

/* Estilos das listas de Anamnese e Histórico */
.anamnesis-section,
.history-section {
  margin-bottom: 2.5rem;
}
.anamnesis-section h3,
.history-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--azul-principal);
}
.anamnesis-list,
.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
}
.anamnesis-list li,
.history-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}
.anamnesis-list li:hover,
.history-list li:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}
.anamnesis-info.clickable {
  cursor: pointer;
}
.anamnesis-info,
.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
  min-width: 0;
}
.anamnesis-name,
.history-date {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.anamnesis-date {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--cinza-texto);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  background-color: #f3f4f6;
  color: var(--preto);
}
.status-badge {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  text-transform: capitalize;
  white-space: nowrap;
}
.status-badge.realizado {
  background-color: #f0fdf4;
  color: #16a34a;
}
.status-badge.agendado {
  background-color: #eff6ff;
  color: #2563eb;
}
.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 1rem;
}

/* ✨ ESTILOS PARA O RESPONSIVO ✨ */
@media (max-width: 768px) {
  .patient-header {
    align-items: center;
  }
  .patient-info {
    width: 100%;
  }
  .patient-name {
    font-size: 1.75rem;
  }
  .header-actions {
    width: 100%;
  }
  .btn-secondary,
  .btn-primary {
    padding: 0.75rem 1rem;
    flex-grow: 1;
  }
  .btn-edit {
    flex-grow: 0;
    min-width: 44px;
  }
  .btn-text {
    display: block;
  }
  .btn-edit .btn-text {
    display: none;
  }

  .tabs-nav {
    justify-content: space-around;
  }
  .section-content.grid-2-cols {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .card-section {
    padding: 1.5rem;
  }

  .anamnesis-list li,
  .history-list li {
    padding: 1rem;
  }
  .history-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .history-list .btn-secondary .btn-text {
    display: none;
  }
  .history-list .btn-secondary {
    padding: 0.6rem;
    border-radius: 50%;
  }
}
.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  margin-top: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 1rem;
  background-color: rgba(239, 246, 255, 0.5);
  text-align: center;
}

.empty-state-icon {
  color: var(--azul-principal);
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state-text {
  max-width: 400px;
  color: var(--cinza-texto);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.empty-state-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.empty-state-button:hover {
  background-color: var(--azul-escuro);
}
</style>
