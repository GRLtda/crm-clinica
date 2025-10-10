<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRouter } from 'vue-router'
import {
  Calendar,
  Users,
  User as UserIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  FileText,
  Bell,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-vue-next'
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue'
import AppointmentDetailsModal from '@/components/pages/dashboard/AppointmentDetailsModal.vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { startOfWeek, endOfWeek, format, addDays, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const appointmentsStore = useAppointmentsStore()
const router = useRouter()
const toast = useToast()

const isModalOpen = ref(false)
const isDetailsModalOpen = ref(false)
const selectedEventForDetails = ref(null)
const initialAppointmentData = ref(null)
const selectedDate = ref(new Date())
const currentTime = ref(new Date())
let timer = null
const calendarView = ref('week')
const isMobile = ref(window.innerWidth <= 768)
const wasMobile = ref(isMobile.value)

const stats = computed(() => dashboardStore.stats)
const weekAppointments = computed(() => appointmentsStore.appointments)

const todaysAppointmentsSorted = computed(() => {
  if (!stats.value || !Array.isArray(stats.value.appointmentsToday)) {
    return []
  }
  return [...stats.value.appointmentsToday].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime),
  )
})

const weekStart = computed(() => startOfWeek(selectedDate.value, { weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(selectedDate.value, { weekStartsOn: 1 }))

const calendarHeader = computed(() => {
  if (calendarView.value === 'day') {
    return format(selectedDate.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const startMonth = format(weekStart.value, 'MMMM', { locale: ptBR })
  const endMonth = format(weekEnd.value, 'MMMM', { locale: ptBR })
  const year = format(weekStart.value, 'yyyy')

  if (startMonth === endMonth) {
    return `${format(weekStart.value, 'dd')} - ${format(
      weekEnd.value,
      'dd',
    )} de ${startMonth} de ${year}`
  }
  return `${format(weekStart.value, "dd 'de' MMMM")} - ${format(
    weekEnd.value,
    "dd 'de' MMMM 'de' yyyy",
  )}`
})

const getAbbreviatedDay = (fullDay) => {
  const dayName = fullDay.split(' ')[0]
  if (dayName.toLowerCase() === 'sábado') return 'SÁB'
  return dayName.substring(0, 3).toUpperCase()
}

async function fetchDataForView() {
  let startDate, endDate
  if (calendarView.value === 'day') {
    startDate = format(startOfDay(selectedDate.value), 'yyyy-MM-dd')
    endDate = format(endOfDay(selectedDate.value), 'yyyy-MM-dd')
  } else {
    startDate = format(weekStart.value, 'yyyy-MM-dd')
    endDate = format(weekEnd.value, 'yyyy-MM-dd')
  }
  await appointmentsStore.fetchAppointmentsByDate(startDate, endDate)
}

function goToPrevious() {
  const daysToSubtract = calendarView.value === 'day' ? 1 : 7
  selectedDate.value = subDays(selectedDate.value, daysToSubtract)
  fetchDataForView()
}

function goToToday() {
  selectedDate.value = new Date()
  fetchDataForView()
}

function goToNext() {
  const daysToAdd = calendarView.value === 'day' ? 1 : 7
  selectedDate.value = addDays(selectedDate.value, daysToAdd)
  fetchDataForView()
}

const updateCalendarView = () => {
  const isNowMobile = window.innerWidth <= 768
  isMobile.value = isNowMobile

  // Se a tela mudou de estado (desktop > mobile ou mobile > desktop)
  if (isNowMobile !== wasMobile.value) {
    calendarView.value = isNowMobile ? 'day' : 'week'
    fetchDataForView()
  }

  wasMobile.value = isNowMobile
}


function handleDayHeaderClick(date) {
  if (calendarView.value === 'week' && !isMobile.value) {
    selectedDate.value = date
    calendarView.value = 'day'
  }
}

function backToWeekView() {
  if (!isMobile.value) {
    calendarView.value = 'week'
  }
}

onMounted(() => {
  dashboardStore.fetchDashboardStats()
  updateCalendarView()
  window.addEventListener('resize', updateCalendarView)
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', updateCalendarView)
})

function formatToVueCalString(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formattedEvents = computed(() => {
  if (!Array.isArray(weekAppointments.value)) return []
  return weekAppointments.value.map((appt) => ({
    start: formatToVueCalString(appt.startTime),
    end: formatToVueCalString(appt.endTime),
    title: appt.patient.name,
    class: `clinic-event status--${appt.status.toLowerCase().replace(' ', '-')}`,
    originalEvent: appt,
  }))
})

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleCellClick(date) {
  const now = new Date()
  if (date < now) {
    return
  }
  initialAppointmentData.value = {
    date: date,
    startTime: format(date, 'HH:mm'),
  }
  isModalOpen.value = true
}

function handleEventClick(event) {
  selectedEventForDetails.value = event
  isDetailsModalOpen.value = true
}

function handleModalClose() {
  isModalOpen.value = false
  fetchDataForView()
}

function handleDetailsModalClose() {
  isDetailsModalOpen.value = false
  fetchDataForView()
}

function handleStartAppointment(appointment) {
  const { _id: appointmentId, patient } = appointment
  router.push(`/app/atendimentos/${appointmentId}/patient/${patient._id}`)
}

async function handleConfirmArrival(appointment) {
  const { _id: appointmentId } = appointment
  if (appointment.status !== 'Agendado') {
    toast.info('Este atendimento já teve sua chegada confirmada ou foi iniciado.')
    return
  }
  const { success } = await appointmentsStore.updateAppointmentStatus(appointmentId, 'Confirmado')
  if (success) {
    toast.success(`Chegada de ${appointment.patient.name} confirmada!`)
    dashboardStore.fetchDashboardStats()
  } else {
    toast.error('Não foi possível confirmar a chegada.')
  }
}

function handleReschedule(appointmentToEdit) {
  isDetailsModalOpen.value = false
  toast.info('Funcionalidade de reagendamento em desenvolvimento!')
}
</script>

<template>
  <div class="dashboard-overview">
    <CreateAppointmentModal
      v-if="isModalOpen"
      @close="handleModalClose"
      :initial-data="initialAppointmentData"
    />
    <AppointmentDetailsModal
      v-if="isDetailsModalOpen && selectedEventForDetails"
      :event="selectedEventForDetails"
      @close="handleDetailsModalClose"
      @edit="handleReschedule"
    />

    <header class="dashboard-header">
      <div class="header-main">
        <div>
          <h1 class="title">Visão Geral</h1>
          <p class="subtitle">Bem-vindo(a) de volta, {{ authStore.user?.name.split(' ')[0] }}!</p>
        </div>
        <button @click="isModalOpen = true" class="btn-primary">
          <Plus :size="16" />
          Agendar Atendimento
        </button>
      </div>

      <div class="header-toolbar">
        <div class="calendar-nav">
          <button v-if="calendarView === 'day' && !isMobile" @click="backToWeekView" class="today-btn">
             <ChevronLeft :size="16" />
            Semana
          </button>
          <div class="nav-buttons">
            <button @click="goToPrevious" class="nav-btn" title="Anterior">
              <ChevronLeft :size="20" />
            </button>
            <button @click="goToToday" class="today-btn">Hoje</button>
            <button @click="goToNext" class="nav-btn" title="Próximo">
              <ChevronRight :size="20" />
            </button>
          </div>
          <span class="calendar-header-display">{{ calendarHeader }}</span>
        </div>

        <div class="toolbar-filters">
          <div class="search-wrapper">
            <Search :size="18" class="search-icon" />
            <input type="text" placeholder="Buscar na agenda..." />
          </div>
          <button class="btn-filter">
            <SlidersHorizontal :size="16" />
            <span>Filtros</span>
          </button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="agenda-column">
        <div class="calendar-container" :class="{ 'is-loading': appointmentsStore.isLoading }">
          <div class="loading-overlay" v-if="appointmentsStore.isLoading">
            <span>Carregando...</span>
          </div>
          <vue-cal
            class="vuecal--full-height-delete"
            :selected-date="selectedDate"
            :events="formattedEvents"
            :active-view="calendarView"
            :disable-views="['years', 'year', 'month', 'week']"
            hide-view-selector
            :time-from="7 * 60"
            :time-to="22 * 60"
            :time-step="60"
            :snap-to-time="15"
            :min-cell-width="120"
            locale="pt-br"
            @cell-click="handleCellClick"
            @event-click="handleEventClick"
            no-events-text=""
          >
            <template #weekday-heading="{ heading }">
              <div class="custom-weekday-heading" @click="handleDayHeaderClick(heading.date)">
                <div class="day-name">{{ getAbbreviatedDay(heading.label) }}</div>
                <div class="day-number" :class="{ 'is-today': heading.today }">
                  {{ heading.date.getDate() }}
                </div>
              </div>
            </template>

            <template #event="{ event }">
              <div class="custom-event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">
                  {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
                </div>
              </div>
            </template>
          </vue-cal>
        </div>
      </div>

      <aside class="action-column">
        <div class="action-card">
          <h3 class="action-card-title">Atendimentos de Hoje</h3>
          <div v-if="todaysAppointmentsSorted.length > 0" class="today-appointments-list">
            <div
              v-for="appt in todaysAppointmentsSorted"
              :key="appt._id"
              class="today-appointment-item"
            >
              <div class="item-main-info">
                <div class="item-avatar">{{ appt.patient.name.charAt(0) }}</div>
                <div class="item-details">
                  <div class="item-patient-name">{{ appt.patient.name }}</div>
                  <div class="item-time"><Clock :size="14" /> {{ formatTime(appt.startTime) }}</div>
                </div>
              </div>
              <div class="item-status-actions">
                <span class="status-badge" :class="appt.status.toLowerCase().replace(' ', '-')">{{
                  appt.status
                }}</span>
                <div class="item-actions">
                  <button
                    v-if="appt.status === 'Agendado'"
                    @click="handleConfirmArrival(appt)"
                    class="action-btn confirm"
                    title="Confirmar Chegada"
                  >
                    <Check :size="16" />
                  </button>
                  <button
                    v-if="['Agendado', 'Confirmado'].includes(appt.status)"
                    @click="handleStartAppointment(appt)"
                    class="action-btn start"
                    title="Iniciar Atendimento"
                  >
                    <Play :size="16" />
                  </button>
                  <button
                    v-if="appt.status === 'Realizado'"
                    @click="handleStartAppointment(appt)"
                    class="action-btn view"
                    title="Ver Prontuário"
                  >
                    <FileText :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-list">
            <p>Nenhum atendimento para hoje.</p>
          </div>
        </div>

        <div class="action-card">
          <h3 class="action-card-title">Ações Recomendadas</h3>
          <div class="recommended-actions-list">
            <div class="recommended-action-item">
              <div class="action-icon blue"><Bell :size="18" /></div>
              <div class="action-details">
                <p>Confirmar agendamentos de amanhã</p>
                <span>Você tem <strong>5</strong> agendamentos para confirmar.</span>
              </div>
              <ChevronRight :size="18" class="action-arrow" />
            </div>
            <div class="recommended-action-item">
              <div class="action-icon orange"><Users :size="18" /></div>
              <div class="action-details">
                <p>Aniversariantes da semana</p>
                <span>Envie uma mensagem para <strong>3</strong> pacientes.</span>
              </div>
              <ChevronRight :size="18" class="action-arrow" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style>
/* Reset de estilos do vue-cal */
.vuecal__menu,
.vuecal__title-bar {
  display: none;
}
.vuecal__event {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 8px;
  box-sizing: border-box;
  font-family: var(--fonte-principal);
  transition: all 0.2s ease-in-out;
  border: none;
  position: relative; /* Essencial para o efeito de flutuar */
}

/* Efeito de hover que faz o evento saltar para frente */
.vuecal__event:hover {
  transform: scale(1.05);
  z-index: 10; /* Garante que ele fique na frente dos outros */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.vuecal__event.clinic-event {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.vuecal__event.status--confirmado {
  background-color: #16a34a; /* Verde */
  color: var(--branco);
}
.vuecal__event.status--realizado {
  background-color: #6b7281; /* Cinza */
  color: var(--branco);
}
.vuecal--week-view .vuecal__bg .vuecal__time-column {
  width: 70px;
}
.vuecal__cell-events-count {
  display: none;
}
.vuecal--overflow-x.vuecal--week-view .vuecal__time-column {
  margin-top: 4.2em;
}

.vuecal--day-view .vuecal__bg .vuecal__time-column {
  margin-top: 0;
}

.vuecal__event-time {
  display: none;
}
.vuecal__heading {
  height: auto;
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
}

.vuecal--day-view .vuecal__heading {
  display: none;
}
.vuecal__time-cell-label {
  font-size: 0.75rem;
  color: var(--cinza-texto);
  transform: translateY(-8px);
}
.vuecal__bg .vuecal__time-cell {
  border-bottom: 1px solid #e5e7eb;
}
.custom-weekday-heading {
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--fonte-principal);
  padding: 0.75rem 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.custom-weekday-heading:hover {
  background-color: #f9fafb;
}
.day-name {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--cinza-texto);
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.day-number {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--preto);
  line-height: 1;
}
.day-number.is-today {
  color: var(--azul-principal);
  font-weight: 700;
}

@media (max-width: 768px) {
  .custom-weekday-heading {
    padding: 0.5rem 0;
    cursor: default; /* Remove cursor de ponteiro no mobile */
  }
  .custom-weekday-heading:hover {
    background-color: transparent;
  }
  .day-name {
    font-size: 0.6rem;
  }
  .day-number {
    font-size: 1.25rem;
  }

  .vuecal--week-view .vuecal__bg .vuecal__time-column,
  .vuecal--day-view .vuecal__bg .vuecal__time-column {
    width: 55px; /* Reduz a largura da coluna de horário */
  }

  .vuecal__time-cell-label {
    font-size: 0.65rem;
  }

  .event-title {
    font-size: 0.75rem;
  }

  .event-time {
    font-size: 0.7rem;
  }
}
</style>

<style scoped>
/* --- Novo Header --- */
.dashboard-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}
.subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  margin: 0;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}
.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.search-wrapper {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cinza-texto);
}
.search-wrapper input {
  width: 250px;
  padding: 0.65rem 0.75rem 0.65rem 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: var(--branco);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.search-wrapper input:focus {
  outline: none;
  background-color: var(--branco);
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.btn-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: var(--branco);
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-filter:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}
.btn-filter svg {
  color: var(--cinza-texto);
}
.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.calendar-header-display {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  font-weight: 500;
}
.nav-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-btn,
.today-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  background-color: var(--branco);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.nav-btn:hover,
.today-btn:hover {
  background-color: #f3f4f6;
}
.nav-btn {
  width: 32px;
  height: 32px;
}
.today-btn {
  height: 32px;
  padding: 0 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  gap: 0.25rem;
}
/* --- Fim do Novo Header --- */

.loading-state {
  color: var(--cinza-texto);
  padding: 2rem 0;
}
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: flex-start;
}
.agenda-column {
  grid-column: 1 / 2;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}
.action-column {
  grid-column: 2 / 3;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.calendar-container {
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background-color: var(--branco);
  height: 75vh;
  min-height: 600px;
  overflow: hidden;
  position: relative;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-weight: 500;
  color: var(--cinza-texto);
  border-radius: 1rem;
}
.custom-event-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
}
.event-title {
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-time {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-card {
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
}
.action-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}
.today-appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.today-appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.item-main-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}
.item-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.item-patient-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-time {
  font-size: 0.8rem;
  color: var(--cinza-texto);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.item-status-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
.status-badge {
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  text-transform: capitalize;
}
.status-badge.agendado {
  background-color: #eff6ff;
  color: #2563eb;
}
.status-badge.confirmado {
  background-color: #fefce8;
  color: #a16207;
}
.status-badge.realizado {
  background-color: #f0fdf4;
  color: #16a34a;
}
.status-badge.cancelado {
  background-color: #fef2f2;
  color: #dc2626;
}
.item-actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn.confirm {
  background-color: #f0fdf4;
  color: #16a34a;
}
.action-btn.confirm:hover {
  background-color: #dcfce7;
}
.action-btn.start {
  background-color: #eef2ff;
  color: var(--azul-principal);
}
.action-btn.start:hover {
  background-color: #dbeafe;
}
.action-btn.view {
  background-color: #f3f4f6;
  color: #4b5563;
}
.action-btn.view:hover {
  background-color: #e5e7eb;
}
.empty-list {
  text-align: center;
  padding: 1rem 0;
  color: var(--cinza-texto);
  font-size: 0.875rem;
}
.recommended-actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.recommended-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background-color: #f9fafb;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.recommended-action-item:hover {
  background-color: #f3f4f6;
}
.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action-icon.blue {
  background-color: #dbeafe;
  color: #3b82f6;
}
.action-icon.orange {
  background-color: #ffedd5;
  color: #f97316;
}
.action-details p {
  margin: 0;
  font-weight: 500;
  color: #374151;
}
.action-details span {
  font-size: 0.8rem;
  color: var(--cinza-texto);
}
.action-arrow {
  margin-left: auto;
  color: #9ca3af;
}

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .title {
    font-size: 1.875rem; /* 30px */
  }

  .subtitle {
    font-size: 1rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 0.875rem;
  }

  .header-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .calendar-nav {
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-filters {
    display: none; /* Esconde filtros e busca no mobile para simplificar */
  }

  /* Oculta a coluna de ações no mobile */
  .action-column {
    display: none;
  }

  /* Faz a coluna da agenda ocupar todo o espaço */
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
