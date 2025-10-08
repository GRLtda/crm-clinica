<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRouter } from 'vue-router'
import { Play, FileText, CalendarDays, Plus } from 'lucide-vue-next'
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue'
import AppointmentInfoPopover from '@/components/pages/atendimentos/AppointmentInfoPopover.vue'

const appointmentsStore = useAppointmentsStore()
const router = useRouter()
const appointments = computed(() => appointmentsStore.appointments)

const isModalOpen = ref(false)

// 💡 CORREÇÃO AQUI: Mudamos 'position' para 'event' para ficar mais claro
const activePopover = ref({ appointment: null, event: null })

onMounted(() => {
  appointmentsStore.fetchAppointmentsByDate()
})

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

function openCreateModal() {
  isModalOpen.value = true
}

function goToAppointmentPage(appt) {
  if (appt) {
    router.push(`/app/atendimentos/${appt._id}/patient/${appt.patient._id}`)
  }
}

// 💡 CORREÇÃO AQUI: Salvamos o objeto 'event' inteiro
function openPopover(appointment, event) {
  activePopover.value = {
    appointment: appointment,
    event: event,
  }
}

function closePopover() {
  activePopover.value = { appointment: null, event: null }
}
</script>

<template>
  <div class="appointments-page">
    <header class="page-header">
      <div>
        <h1 class="title">Atendimentos de Hoje</h1>
        <p class="subtitle">Confirme a chegada e inicie os atendimentos dos seus pacientes.</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <Plus :size="16" />
        Marcar Atendimento
      </button>
    </header>

    <div class="content-wrapper">
      <div v-if="appointmentsStore.isLoading" class="state-cell">Carregando agendamentos...</div>

      <div v-else-if="appointments.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <CalendarDays :size="48" />
        </div>
        <h2 class="empty-state-title">Nenhum atendimento para hoje</h2>
        <p class="empty-state-text">
          Aproveite para organizar a agenda ou marque o próximo atendimento.
        </p>
        <button class="btn-primary" @click="openCreateModal">
          <Plus :size="16" />
          Marcar Atendimento
        </button>
      </div>

      <div v-else class="appointments-list">
        <div
          v-for="appt in appointments"
          :key="appt._id"
          class="appointment-card"
          @click="openPopover(appt, $event)"
        >
          <div class="patient-info">
            <div class="patient-avatar">{{ appt.patient.name.charAt(0) }}</div>
            <div>
              <div class="patient-name">{{ appt.patient.name }}</div>
              <div class="appointment-time">
                {{ formatTime(appt.startTime) }} - {{ formatTime(appt.endTime) }}
              </div>
            </div>
          </div>
          <div class="status-wrapper">
            <div class="appointment-status" :class="appt.status.toLowerCase().replace(' ', '-')">
              {{ appt.status }}
            </div>
          </div>
          <div class="appointment-actions"></div>
        </div>
      </div>
    </div>
  </div>

  <AppointmentInfoPopover
    v-if="activePopover.appointment"
    :appointment="activePopover.appointment"
    :click-event="activePopover.event"
    @close="closePopover"
    @start="goToAppointmentPage(activePopover.appointment)"
    @view="goToAppointmentPage(activePopover.appointment)"
  />

  <CreateAppointmentModal v-if="isModalOpen" @close="isModalOpen = false" />
</template>

<style scoped>
/* Estilos permanecem os mesmos */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.subtitle {
  color: var(--cinza-texto);
}

.content-wrapper {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  min-height: 60vh;
}

.state-cell {
  padding: 4rem;
  text-align: center;
  color: var(--cinza-texto);
  font-size: 1rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
}

.appointment-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.appointment-card:last-child {
  border-bottom: none;
}
.appointment-card:hover {
  background-color: #f9fafb;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.patient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.patient-name {
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.appointment-time {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}

.status-wrapper {
  display: flex;
  justify-content: center;
}
.appointment-status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.875rem;
  width: fit-content;
}
.appointment-status.agendado {
  background-color: #eff6ff;
  color: #2563eb;
}
.appointment-status.realizado {
  background-color: #f0fdf4;
  color: #16a34a;
}
.appointment-status.cancelado {
  background-color: #fef2f2;
  color: #dc2626;
}
.appointment-status.nao-compareceu {
  background-color: #f1f5f9;
  color: #64748b;
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
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}

.btn-secondary {
  background-color: var(--branco);
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-secondary.btn-icon:hover {
  background-color: #f3f4f6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  margin-top: 1rem;
  min-height: 60vh;
}
.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f3f4f6;
  margin-bottom: 1.5rem;
}
.empty-state-icon svg {
  color: #9ca3af;
}
.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.empty-state-text {
  color: var(--cinza-texto);
  max-width: 400px;
  margin-bottom: 1.5rem;
}
</style>
