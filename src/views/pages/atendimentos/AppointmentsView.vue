<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRouter } from 'vue-router'
import {
  CalendarDays,
  Plus,
  User,
  CheckCircle,
  Clock,
  Search,
  Check,
  Play,
  X,
  CalendarPlus,
} from 'lucide-vue-next'
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue'
import AppointmentInfoPopover from '@/components/pages/atendimentos/AppointmentInfoPopover.vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'

const appointmentsStore = useAppointmentsStore()
const router = useRouter()
const toast = useToast()

const isModalOpen = ref(false)
const activePopover = ref({ appointment: null, event: null })
const searchQuery = ref('')

const filteredAndSortedAppointments = computed(() => {
  if (!appointmentsStore.appointments || appointmentsStore.appointments.length === 0) return []

  // 1. Filtra primeiro
  const filtered = appointmentsStore.appointments.filter((appt) =>
    appt.patient.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  // 2. Depois ordena
  const statusOrder = {
    Confirmado: 1,
    Agendado: 2,
    Realizado: 3,
    Cancelado: 4,
    'Não Compareceu': 5,
  }

  return filtered.sort((a, b) => {
    const orderA = statusOrder[a.status] || 99
    const orderB = statusOrder[b.status] || 99

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return new Date(a.startTime) - new Date(b.startTime)
  })
})

onMounted(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  appointmentsStore.fetchAppointmentsByDate(today)
})

function formatTime(dateString) {
  if (!dateString) return ''
  // ✨ CORREÇÃO AQUI: Removido o 'timeZone: UTC'
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
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

function openPopover(appointment, event) {
  activePopover.value = {
    appointment: appointment,
    event: event,
  }
}

function closePopover() {
  activePopover.value = { appointment: null, event: null }
}

async function handleStatusChange(appointment, newStatus) {
  const { success } = await appointmentsStore.updateAppointmentStatus(appointment._id, newStatus)
  if (success) {
    toast.success(`Status alterado para "${newStatus}"!`)
  } else {
    toast.error(`Não foi possível alterar o status.`)
  }
}

function rebookAppointment() {
  isModalOpen.value = true
}
</script>

<template>
  <div class="appointments-page">
    <header class="page-header">
      <div>
        <h1 class="title">Atendimentos de Hoje</h1>
        <p class="subtitle">Confirme a chegada e inicie os atendimentos dos seus pacientes.</p>
      </div>
      <div class="header-actions">
        <div class="search-wrapper">
          <Search :size="18" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar por paciente..."
            class="search-input"
          />
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <Plus :size="16" />
          Marcar Atendimento
        </button>
      </div>
    </header>

    <div class="content-wrapper">
      <div v-if="appointmentsStore.isLoading" class="state-cell">Carregando agendamentos...</div>

      <div v-else-if="filteredAndSortedAppointments.length === 0" class="empty-state">
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

      <div v-else>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="patient-header">
                  <User :size="14" />
                  <span>Paciente</span>
                </th>
                <th class="status-header">
                  <CheckCircle :size="14" />
                  <span>Status</span>
                </th>
                <th class="time-header">
                  <Clock :size="14" />
                  <span>Horário</span>
                </th>
              </tr>
            </thead>
            <tbody v-auto-animate>
              <tr
                v-for="appt in filteredAndSortedAppointments"
                :key="appt._id"
                class="appointment-row"
                @click="openPopover(appt, $event)"
              >
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar">{{ appt.patient.name.charAt(0) }}</div>
                    <span class="patient-name">{{ appt.patient.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="status-wrapper">
                    <span
                      class="appointment-status"
                      :class="appt.status.toLowerCase().replace(' ', '-')"
                    >
                      {{ appt.status }}
                    </span>
                  </div>
                </td>
                <td class="time-cell">
                  {{ formatTime(appt.startTime) }} - {{ formatTime(appt.endTime) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="appointments-cards">
          <div
            v-for="appt in filteredAndSortedAppointments"
            :key="appt._id"
            class="appointment-card"
          >
            <div class="card-content">
              <div class="card-top">
                <div class="patient-info">
                  <div class="patient-avatar">{{ appt.patient.name.charAt(0) }}</div>
                  <span class="patient-name">{{ appt.patient.name }}</span>
                </div>
                <span
                  class="appointment-status"
                  :class="appt.status.toLowerCase().replace(' ', '-')"
                >
                  {{ appt.status }}
                </span>
              </div>
              <div class="card-bottom">
                <Clock :size="14" />
                <span>{{ formatTime(appt.startTime) }} - {{ formatTime(appt.endTime) }}</span>
              </div>
            </div>
            <div
              class="card-actions"
              v-if="
                appt.status === 'Agendado' ||
                appt.status === 'Confirmado' ||
                appt.status === 'Não Compareceu'
              "
            >
              <template v-if="appt.status === 'Agendado'">
                <button
                  @click.stop="handleStatusChange(appt, 'Confirmado')"
                  class="btn-card-action confirm"
                >
                  <Check :size="16" /> Confirmar Chegada
                </button>
                <button
                  @click.stop="handleStatusChange(appt, 'Cancelado')"
                  class="btn-card-icon cancel"
                  title="Cancelar"
                >
                  <X :size="18" />
                </button>
              </template>
              <template v-else-if="appt.status === 'Confirmado'">
                <button @click.stop="goToAppointmentPage(appt)" class="btn-card-action start">
                  <Play :size="16" /> Iniciar Atendimento
                </button>
              </template>
              <template v-else-if="appt.status === 'Não Compareceu'">
                <button @click.stop="rebookAppointment(appt)" class="btn-card-action rebook">
                  <CalendarPlus :size="16" /> Reagendar
                </button>
              </template>
            </div>
          </div>
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: var(--cinza-texto);
  pointer-events: none;
}

.search-input {
  width: 280px;
  height: 44px;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  background-color: var(--branco);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
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

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: none;
}

th {
  background-color: #f9fafb;
  color: var(--cinza-texto);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: table-cell;
  vertical-align: middle;
}

th > * {
  vertical-align: middle;
  margin-right: 0.5rem;
}

.patient-header {
  width: 50%;
}
.status-header,
.time-header {
  width: 25%;
  text-align: center;
}

.appointment-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.appointment-row:hover {
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
.time-cell {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.status-wrapper {
  display: flex;
  justify-content: center;
}
.appointment-status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  width: fit-content;
  text-transform: capitalize;
}
.appointment-status.agendado {
  background-color: #eff6ff;
  color: #2563eb;
}
.appointment-status.confirmado {
  background-color: #fefce8;
  color: #a16207;
}
.appointment-status.realizado {
  background-color: #f0fdf4;
  color: #16a34a;
}
.appointment-status.cancelado {
  background-color: #fef2f2;
  color: #dc2626;
}
.appointment-status.não-compareceu {
  background-color: #f1f5f9;
  color: #64748b;
}

.btn-primary {
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
  background-color: var(--azul-principal);
  color: var(--branco);
  height: 44px; /* Garante a mesma altura da busca */
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
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

/* 📱 INÍCIO DOS ESTILOS RESPONSIVOS 📱 */

.appointments-cards {
  display: none;
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .header-actions {
    width: 100%;
  }

  .search-input {
    width: 100%;
    flex-grow: 1;
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 1.75rem;
  }
  .table-container {
    display: none;
  }

  .content-wrapper {
    background-color: transparent;
    border: none;
    padding: 0;
  }

  .appointments-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-card {
    display: flex;
    flex-direction: column;
    background-color: var(--branco);
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    cursor: default;
    overflow: hidden; /* Garante que os cantos arredondados sejam respeitados */
  }

  .card-content {
    padding: 1rem;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--cinza-texto);
    font-weight: 500;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }

  .btn-card-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    flex-grow: 1;
    justify-content: center;
  }

  .btn-card-action.confirm {
    background-color: #f0fdf4;
    color: #16a34a;
  }

  .btn-card-action.start,
  .btn-card-action.rebook {
    background-color: #eef2ff;
    color: var(--azul-principal);
  }

  .btn-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    width: 34px;
    height: 34px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .btn-card-icon.cancel {
    color: #ef4444;
    border-color: #fecaca;
  }
}
</style>
