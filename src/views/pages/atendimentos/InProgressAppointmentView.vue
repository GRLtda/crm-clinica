<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRecordsStore } from '@/stores/records'
import { usePatientsStore } from '@/stores/patients'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline' // Para manter a funcionalidade de sublinhado

import EditorToolbar from '@/components/shared/EditorToolbar.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
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

const appointmentId = route.params.appointmentId
const patientId = route.params.patientId

const appointment = ref(null)
const patient = ref(null)
const activeTab = ref('record')
const selectedModel = ref(null)
const isViewMode = ref(false) // Controla o modo de visualização

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

const editor = useEditor({
  content: '', // Inicia vazio para carregar o conteúdo depois
  extensions: [
    // Configuração simplificada para garantir que o HTML seja renderizado
    StarterKit,
    // Adicionamos extensões que não fazem parte do StarterKit, como o Underline
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'prose focus:outline-none max-w-none',
    },
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
  // ATENÇÃO: Esta linha pode precisar de ajuste se o agendamento não for de hoje.
  // O ideal seria ter uma store.fetchAppointmentById(appointmentId)
  await appointmentsStore.fetchAppointmentsByDate(new Date().toISOString().split('T')[0])
  appointment.value = appointmentsStore.appointments.find((appt) => appt._id === appointmentId)
  await patientsStore.fetchPatientById(patientId)
  patient.value = patientsStore.selectedPatient

  // Lógica de Visualização vs. Criação
  if (appointment.value && appointment.value.status === 'Realizado') {
    isViewMode.value = true
    editor.value.setEditable(false)

    const { success, data: record } = await recordsStore.fetchRecordByAppointmentId(appointmentId)
    if (success && record) {
      editor.value.commands.setContent(record.content)
    } else {
      editor.value.commands.setContent('<h2>Registro não encontrado.</h2>')
      toast.error('Não foi possível carregar as anotações deste atendimento.')
    }
  } else {
    const defaultRecordContent = `
      <h2>Queixa Principal:</h2><p></p>
      <h2>Histórico da Doença Atual (HDA):</h2><p></p>
      <h2>Histórico Médico Pregresso (HMP):</h2><p></p>
      <h2>Exame Físico:</h2><p></p>
      <h2>Condutas/Plano Terapêutico:</h2><p></p>
    `
    editor.value.commands.setContent(defaultRecordContent)
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
}

async function saveAndFinish() {
  if (!appointment.value) {
    toast.error('Erro ao finalizar: Dados do agendamento não encontrados.')
    console.error("Falha ao salvar: a referência ao 'appointment' está indefinida.")
    return
  }

  const recordData = {
    patientId: patientId,
    appointmentId: appointment.value._id,
    content: editor.value.getHTML(),
    durationInSeconds: elapsedTimeInSeconds.value,
  }

  const { success: recordSuccess } = await recordsStore.createRecord(recordData)

  if (recordSuccess) {
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
              <span class="value">{{ patient.healthInsurance || 'Particular' }}</span>
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
        <div v-if="activeTab === 'record'">
          <div class="editor-header">
            <div class="editor-section-title">
              <FileText :size="22" stroke-width="2.5" class="title-icon" />
              <h3>{{ isViewMode ? 'Anotações do Atendimento' : 'Novo registro' }}</h3>
            </div>
            <div v-if="!isViewMode" class="modelos-dropdown">
              <StyledSelect
                :options="recordModels"
                v-model="selectedModel"
                label="Modelos"
                @update:modelValue="loadModel"
                placeholder="Selecionar modelo"
              />
            </div>
          </div>
          <div class="editor-wrapper">
            <EditorToolbar v-if="editor && !isViewMode" :editor="editor" />
            <EditorContent v-if="editor" :editor="editor" class="editor-content" />
          </div>
        </div>

        <div v-else-if="activeTab === 'exams'">
          <h2 class="tab-title">Exames</h2>
          <p>Conteúdo para Exames</p>
        </div>
        <div v-else-if="activeTab === 'prescriptions'">
          <h2 class="tab-title">Prescrições</h2>
          <p>Conteúdo para Prescrições</p>
        </div>
        <div v-else-if="activeTab === 'documents'">
          <h2 class="tab-title">Documentos</h2>
          <p>Conteúdo para Documentos</p>
        </div>
        <div v-else-if="activeTab === 'images'">
          <h2 class="tab-title">Imagens e Anexos</h2>
          <p>Conteúdo para Imagens e Anexos</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Layout geral */
.in-progress-appointment-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
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

/* Coluna Esquerda */
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

/* Coluna Central - Editor */
.editor-main-content {
  flex-grow: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.editor-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #333;
}

.editor-section-title .title-icon {
  flex-shrink: 0;
}

.editor-section-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modelos-dropdown {
  width: 200px;
}

.editor-wrapper {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  min-height: 60vh;
}

.editor-content {
  flex-grow: 1;
  padding: 1.5rem;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
}

/* Estilos para o conteúdo do Tiptap (prose mirror) */
.editor-content :deep(.ProseMirror) {
  min-height: 100%;
}
.editor-content :deep(.ProseMirror strong) {
  font-weight: bold;
}
.editor-content :deep(.ProseMirror em) {
  font-style: italic;
}

.editor-content :deep(.ProseMirror h1),
.editor-content :deep(.ProseMirror h2),
.editor-content :deep(.ProseMirror h3) {
  font-family: 'Poppins', sans-serif;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}
.editor-content :deep(.ProseMirror h1) {
  font-size: 1.875rem;
  font-weight: 700;
}
.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
}
.editor-content :deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 600;
}
.editor-content :deep(.ProseMirror p) {
  margin-bottom: 1rem;
}
.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
  padding: 0;
}
.editor-content :deep(.ProseMirror li) {
  margin-bottom: 0.5rem;
}
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
