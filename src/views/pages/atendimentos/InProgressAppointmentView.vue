<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRecordsStore } from '@/stores/records'
import { usePatientsStore } from '@/stores/patients'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

import EditorToolbar from '@/components/shared/EditorToolbar.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import RecordAttachments from '@/components/pages/appointments/RecordAttachments.vue'
import SaveStatusIndicator from '@/components/shared/SaveStatusIndicator.vue'
import {
  User,
  Calendar,
  Stethoscope,
  FileText,
  Image,
  Paperclip,
  ChevronRight,
  Clock,
  ArrowLeft,
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const appointmentsStore = useAppointmentsStore()
const recordsStore = useRecordsStore()
const patientsStore = usePatientsStore()
const toast = useToast()

let debounceTimeout = null

const appointmentId = route.params.appointmentId
const patientId = route.params.patientId

const appointment = ref(null)
const patient = ref(null)
const activeTab = ref('record')
const selectedModel = ref(null)
const isViewMode = ref(false)
const currentRecord = computed(() => recordsStore.currentRecord)
const saveStatus = ref('idle')
const lastSaved = ref(null)

// Cronômetro
const elapsedTimeInSeconds = ref(0)
const timerInterval = ref(null)
const formattedElapsedTime = computed(() => {
  const hours = Math.floor(elapsedTimeInSeconds.value / 3600)
  const minutes = Math.floor((elapsedTimeInSeconds.value % 3600) / 60)
  const seconds = elapsedTimeInSeconds.value % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds,
    ).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const recordModels = ref([
  { label: 'Anamnese Geral', value: 'anamnese-geral' },
  { label: 'Retorno', value: 'retorno' },
  { label: 'Avaliação Inicial', value: 'avaliacao-inicial' },
])

async function autoSave() {
  let recordId = recordsStore.currentRecord?._id
  const content = editor.value.getHTML()

  if (recordsStore.currentRecord && recordsStore.currentRecord.content === content) {
    saveStatus.value = 'saved'
    return
  }

  const recordData = {
    patientId: patientId,
    appointmentId: appointmentId,
    content: content,
  }

  let result
  if (recordId) {
    result = await recordsStore.updateRecord(recordId, recordData)
  } else {
    result = await recordsStore.createRecord(recordData)
  }

  if (result.success) {
    saveStatus.value = 'saved'
    lastSaved.value = new Date()
  } else {
    saveStatus.value = 'error'
  }
}

const editor = useEditor({
  content: '',
  extensions: [StarterKit, Underline],
  editorProps: {
    attributes: {
      class: 'prose focus:outline-none max-w-none',
    },
  },
  onUpdate() {
    if (isViewMode.value) return

    saveStatus.value = 'saving'
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      autoSave()
    }, 1500)
  },
})

const patientAge = computed(() => {
  if (patient.value && patient.value.birthDate) {
    const birthDate = new Date(patient.value.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} anos`
  }
  return 'N/A'
})

onMounted(async () => {
  await patientsStore.fetchPatientById(patientId)
  patient.value = patientsStore.selectedPatient
  await appointmentsStore.fetchAppointmentsByDate()
  appointment.value = appointmentsStore.appointments.find((appt) => appt._id === appointmentId)

  if (!appointment.value) {
    toast.error('Agendamento não encontrado.')
    router.push('/app/atendimentos')
    return
  }

  await recordsStore.fetchRecordByAppointmentId(appointmentId)

  if (appointment.value.status === 'Realizado') {
    isViewMode.value = true
    editor.value.setEditable(false)
  }

  if (currentRecord.value) {
    editor.value.commands.setContent(currentRecord.value.content)
    saveStatus.value = 'saved'
    lastSaved.value = new Date(currentRecord.value.updatedAt)
  } else {
    const defaultRecordContent = `
      <h2>Queixa Principal:</h2><p></p>
      <h2>Histórico da Doença Atual (HDA):</h2><p></p>
      <h2>Histórico Médico Pregresso (HMP):</h2><p></p>
      <h2>Exame Físico:</h2><p></p>
      <h2>Condutas/Plano Terapêutico:</h2><p></p>
    `
    editor.value.commands.setContent(defaultRecordContent)
    saveStatus.value = 'idle'
  }

  if (!isViewMode.value) {
    elapsedTimeInSeconds.value = currentRecord.value?.durationInSeconds || 0
    timerInterval.value = setInterval(() => {
      elapsedTimeInSeconds.value++
    }, 1000)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

function loadModel(modelValue) {
  let content = ''
  if (modelValue === 'anamnese-geral') {
    content = `
      <h2>Queixa Principal:</h2><p>...</p>
      <h2>Histórico da Doença Atual (HDA):</h2><p>...</p>
      <h2>Histórico Médico Pregresso (HMP):</h2><p>...</p>
      <h2>Exame Físico:</h2><p>...</p>
      <h2>Condutas/Plano Terapêutico:</h2><p>...</p>
    `
  } else if (modelValue === 'retorno') {
    content = `
      <h2>Evolução:</h2><p>...</p>
      <h2>Novas Queixas:</h2><p>...</p>
      <h2>Ajustes no Plano:</h2><p>...</p>
    `
  } else if (modelValue === 'avaliacao-inicial') {
    content = `
      <h2>Dados da Avaliação Inicial:</h2><p></p>
      <h2>Primeiras Impressões:</h2><p></p>
      <h2>Plano de Ação Inicial:</h2><p></p>
    `
  }
  editor.value.commands.setContent(content)
  saveStatus.value = 'saving';
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(autoSave, 500);
}

// ✨ LÓGICA DE FINALIZAR CORRIGIDA ✨
async function saveAndFinish() {
  if (!appointment.value) {
    toast.error('Erro ao finalizar: Dados do agendamento não encontrados.')
    return
  }

  // 1. Garante que o último estado do editor seja salvo no prontuário
  clearTimeout(debounceTimeout)
  await autoSave() // Salva o conteúdo final

  if (saveStatus.value === 'error') {
    toast.error('Não foi possível salvar as últimas alterações. Tente novamente.')
    return
  }



  // 3. SEPARADAMENTE, atualiza o status do AGENDAMENTO
  const { success: appointmentStatusSuccess } = await appointmentsStore.updateAppointmentStatus(
    appointment.value._id,
    'Realizado',
  )

  if (appointmentStatusSuccess) {
    toast.success('Atendimento finalizado e prontuário salvo!')
    router.push('/app/atendimentos')
  } else {
    toast.error('Prontuário salvo, mas houve um erro ao atualizar o status do agendamento.')
  }
}

const menuItems = [
  { id: 'record', label: 'Registro do Atendimento', icon: FileText },
  { id: 'exams', label: 'Exames', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescrições', icon: Calendar },
  { id: 'documents', label: 'Documentos', icon: Paperclip },
  { id: 'images', label: 'Imagens e Anexos', icon: Image },
]
</script>

<template>
  <div class="in-progress-appointment-layout">
    <header class="top-bar">
      <div class="header-left">
        <div class="header-title">
          {{ isViewMode ? 'Visualizando Atendimento' : 'Novo Atendimento' }}
        </div>
      </div>
      <div class="header-center">
        <div v-if="!isViewMode" class="appointment-timer">
          <Clock :size="18" />
          <span>{{ formattedElapsedTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <SaveStatusIndicator v-if="!isViewMode" :status="saveStatus" :last-saved="lastSaved" />

        <button v-if="isViewMode" @click="router.back()" class="btn-secondary-solid">
          <ArrowLeft :size="16" />
          Voltar
        </button>
        <button
          v-else
          @click="saveAndFinish"
          class="btn-finish-appointment"
          :disabled="recordsStore.isLoading || appointmentsStore.isLoading"
        >
          Finalizar Atendimento
          <ChevronRight :size="16" />
        </button>
      </div>
    </header>

    <div class="content-area">
      <aside class="left-sidebar">
        <div v-if="patient" class="patient-card">
          <div class="avatar">{{ patient.name?.charAt(0) }}</div>
          <div class="patient-details">
            <div class="name">{{ patient.name }}</div>
            <div class="detail-row">
              <span>Idade</span>
              <span class="value">{{ patientAge }}</span>
            </div>
            <div class="detail-row">
              <span>Convênio</span>
              <span class="value">{{ patient.healthInsurance || '----' }}</span>
            </div>
            <div class="detail-row">
              <span>Primeiro Atend.</span>
              <span class="value">{{
                patient.firstAppointmentDate
                  ? new Date(patient.firstAppointmentDate).toLocaleDateString('pt-BR')
                  : 'N/A'
              }}</span>
            </div>
          </div>
        </div>
        <nav class="side-menu">
          <button
            v-for="item in menuItems"
            :key="item.id"
            :class="{ 'is-active': activeTab === item.id }"
            @click="activeTab = item.id"
          >
            <component :is="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="editor-main-content">
        <div v-if="activeTab === 'record'" class="tab-content">
          <div class="editor-wrapper">
            <div v-if="editor && !isViewMode" class="combined-toolbar">
              <EditorToolbar :editor="editor" />
              <div class="modelos-dropdown">
                <StyledSelect
                  :options="recordModels"
                  v-model="selectedModel"
                  @update:modelValue="loadModel"
                  placeholder="Usar modelo"
                />
              </div>
            </div>
            <div v-if="isViewMode" class="view-mode-header">
              <FileText :size="22" stroke-width="2.5" />
              <h3>Anotações do Atendimento</h3>
            </div>
            <EditorContent v-if="editor" :editor="editor" class="editor-content" />
          </div>
        </div>

        <div v-else-if="activeTab === 'exams'" class="tab-content">
          <h2 class="tab-title">Exames</h2>
        </div>
        <div v-else-if="activeTab === 'prescriptions'" class="tab-content">
          <h2 class="tab-title">Prescrições</h2>
        </div>
        <div v-else-if="activeTab === 'documents'" class="tab-content">
          <h2 class="tab-title">Documentos</h2>
        </div>
        <div v-else-if="activeTab === 'images'" class="tab-content">
          <RecordAttachments
            :record="currentRecord"
            :patient-id="patientId"
            :appointment-id="appointmentId"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Estilos permanecem os mesmos */
.in-progress-appointment-layout {
  display: flex;
  flex-direction: column;
  height: 93vh;
  background-color: #f8f9fa;
  border-radius: 1vh;
  overflow: hidden;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--branco);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: relative;
}
.header-left,
.header-right {
  flex: 1;
}
.header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}
.appointment-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--cinza-texto);
  background-color: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}
.btn-finish-appointment {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  background-color: #dcfce7;
  color: #16a34a;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
.btn-finish-appointment:hover:not(:disabled) {
  background-color: #bbf7d0;
}
.btn-finish-appointment:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-secondary-solid {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  background-color: #f1f5f9;
  color: #334155;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-secondary-solid:hover {
  background-color: #e2e8f0;
}
.content-area {
  flex-grow: 1;
  display: flex;
  overflow: hidden;
}
.left-sidebar {
  width: 320px;
  background-color: var(--branco);
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem;
  flex-shrink: 0;
  overflow-y: auto;
}
.patient-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.patient-card .avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 600;
}
.patient-card .patient-details .name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.patient-card .detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--cinza-texto);
  margin-bottom: 0.25rem;
}
.patient-card .detail-row .value {
  font-weight: 500;
  color: #333;
}
.side-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.side-menu button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  white-space: nowrap;
}
.side-menu button:hover {
  background-color: #f3f4f6;
  color: #333;
}
.side-menu button.is-active {
  background-color: #eef2ff;
  color: var(--azul-principal);
  font-weight: 600;
}
.editor-main-content {
  flex-grow: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.editor-wrapper {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}
.combined-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.modelos-dropdown {
  width: 200px;
}
.view-mode-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
.view-mode-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
.editor-content {
  flex-grow: 1;
  padding: 1.5rem;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  overflow-y: auto;
}
.editor-content :deep(.ProseMirror) { min-height: 100%; }
.editor-content :deep(.ProseMirror strong) { font-weight: bold; }
.editor-content :deep(.ProseMirror em) { font-style: italic; }
.editor-content :deep(.ProseMirror h1),
.editor-content :deep(.ProseMirror h2),
.editor-content :deep(.ProseMirror h3) {
  font-family: 'Poppins', sans-serif;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}
.editor-content :deep(.ProseMirror h1) { font-size: 1.875rem; font-weight: 700; }
.editor-content :deep(.ProseMirror h2) { font-size: 1.5rem; font-weight: 600; }
.editor-content :deep(.ProseMirror h3) { font-size: 1.25rem; font-weight: 600; }
.editor-content :deep(.ProseMirror p) { margin-bottom: 1rem; }
.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
  padding: 0;
}
.editor-content :deep(.ProseMirror li) { margin-bottom: 0.5rem; }
.editor-content :deep(.ProseMirror blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin-left: 0;
  color: #6b7280;
}
.editor-content :deep(.ProseMirror pre) {
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
}
.editor-content :deep(.ProseMirror code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
}
.editor-content :deep(.ProseMirror a) {
  color: var(--azul-principal);
  text-decoration: underline;
}
.tab-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}
</style>
