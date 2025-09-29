<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { Calendar, Users, CircleDollarSign, Clock, User as UserIcon } from 'lucide-vue-next';
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import EventActionPopover from '@/components/shared/EventActionPopover.vue';
import { useAppointmentsStore } from '@/stores/appointments';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const appointmentsStore = useAppointmentsStore();
const toast = useToast();
const isModalOpen = ref(false);
const currentTime = ref(new Date());
let timer = null;

const popover = ref({
  visible: false,
  event: null,
  position: { top: '0px', left: '0px' },
});

const stats = computed(() => dashboardStore.stats);

onMounted(() => {
  dashboardStore.fetchDashboardStats();
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});

function isEventCurrent(event) {
  const now = currentTime.value;
  return now >= new Date(event.start) && now <= new Date(event.end);
}

const formattedEvents = computed(() => {
  if (!Array.isArray(stats.value.appointmentsToday)) return [];
  return stats.value.appointmentsToday.map(appt => ({
    start: new Date(appt.startTime),
    end: new Date(appt.endTime),
    title: appt.patient.name,
    class: isEventCurrent({ start: appt.startTime, end: appt.endTime })
      ? 'clinic-event current'
      : 'clinic-event',
    originalEvent: appt,
  }));
});

function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

const statCardsData = computed(() => [
  {
    title: 'Pacientes Ativos',
    icon: Users,
    color: 'blue',
    value: stats.value.totalPatients,
  },
  {
    title: 'Atendimentos Hoje',
    icon: Calendar,
    color: 'green',
    value: stats.value.appointmentsToday.length,
  },
  {
    title: 'Cobranças Pendentes',
    icon: CircleDollarSign,
    color: 'orange',
    value: 'R$ 4.320,00',
    note: '(API não disponível)',
  },
  {
    title: 'Próximo Agendamento',
    icon: Clock,
    color: 'purple',
    value: stats.value.nextAppointment,
  }
]);

function handleEventClick(event, domEvent) {
  domEvent.stopPropagation();
  popover.value.event = event;
  popover.value.position = {
    top: `${domEvent.clientY + 10}px`,
    left: `${domEvent.clientX}px`,
  };
  popover.value.visible = true;
}

async function handleStatusChange({ appointmentId, newStatus }) {
  popover.value.visible = false;
  const { success } = await appointmentsStore.updateAppointmentStatus(appointmentId, newStatus);
  if (success) {
    toast.success(`Status do agendamento alterado para "${newStatus}"!`);
  } else {
    toast.error("Não foi possível alterar o status.");
  }
}
</script>

<template>
  <div class="dashboard-overview">
    <CreateAppointmentModal v-if="isModalOpen" @close="isModalOpen = false" />
    <EventActionPopover
      v-if="popover.visible"
      :event="popover.event"
      :position="popover.position"
      @close="popover.visible = false"
      @status-change="handleStatusChange"
    />

    <header class="dashboard-header">
      <div>
        <h1 class="title">Visão Geral</h1>
        <p class="subtitle">Bem-vindo(a) de volta, {{ authStore.user?.name }}!</p>
      </div>
      <button @click="isModalOpen = true" class="btn-primary">
        <Calendar :size="16" />
        Agendar Atendimento
      </button>
    </header>

    <div v-if="dashboardStore.isLoading" class="loading-state">
      Carregando dados...
    </div>
    <div v-else>
      <div class="stats-grid">
        <div v-for="card in statCardsData" :key="card.title" class="stat-card" :class="card.color">
          <div class="card-icon">
            <component :is="card.icon" :size="24" />
          </div>
          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <div v-if="card.title === 'Próximo Agendamento'">
              <div v-if="card.value" class="appointment-details">
                <div class="appointment-line">
                  <UserIcon :size="16" />
                  <span class="appointment-name">{{ card.value.patient.name }}</span>
                </div>
                <div class="appointment-line">
                  <Clock :size="16" />
                  <span>{{ formatTime(card.value.startTime) }}</span>
                </div>
              </div>
              <p v-else class="stat-data-empty">Nenhum para hoje</p>
            </div>
            <p v-else class="stat-data">{{ card.value }}</p>
            <small v-if="card.note">{{ card.note }}</small>
          </div>
        </div>
      </div>

      <div class="calendar-section">
        <h2 class="section-title">Agenda de Hoje</h2>
        <div class="calendar-scroll-container">
          <vue-cal
            class="vuecal--full-height-delete"
            :events="formattedEvents"
            :show-current-time-indicator="true"
            @event-click="handleEventClick"
            active-view="day"
            :disable-views="['years', 'year', 'month', 'week']"
            hide-view-selector
            hide-title-bar
            :time-from="7 * 60"
            :time-to="22 * 60"
            :time-step="30"
            locale="pt-br"
          >
            <template #event="{ event }">
              <div class="custom-event-content" :class="{ current: isEventCurrent(event) }">
                <div class="event-line">
                  <UserIcon :size="14" />
                  <span class="event-title">{{ event.title }}</span>
                </div>
                <div class="event-line">
                  <Clock :size="14" />
                  <span class="event-time">{{ formatTime(event.start) }}</span>
                </div>
                <div v-if="isEventCurrent(event)" class="event-actions">
                  <button class="action-button">Cliente chegou</button>
                </div>
              </div>
            </template>
          </vue-cal>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.calendar-section { margin-top: 2.5rem; }
.section-title { font-family: var(--fonte-titulo); font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
.vuecal__event { cursor: pointer; }
.vuecal__event.clinic-event { background-color: #eef2ff; border: 1px solid #c7d2fe; color: #312e81; border-radius: 0.5rem; padding: 0.5rem; box-sizing: border-box; }
.vuecal__event-title { font-family: 'Poppins', sans-serif; font-weight: 600; }
.vuecal__time-cell-label { font-family: 'Poppins', sans-serif; font-size: 0.8rem; color: var(--cinza-texto); }
.vuecal__no-event { display: none; }
.vuecal--day-view .vuecal__bg { height: auto; }
.vuecal__current-time-indicator { border-top: 2px solid #ef4444; z-index: 1; }
.custom-event-content.current { background-color: rgba(59, 130, 246, 0.25); }
.event-actions { margin-top: 0.5rem; }
.action-button { width: 100%; padding: 0.25rem; background-color: var(--branco); border: 1px solid #c7d2fe; color: var(--azul-principal); font-weight: 600; font-size: 0.75rem; border-radius: 0.375rem; cursor: pointer; }
.custom-event-content { display: flex; flex-direction: column; gap: 0.25rem; height: 100%; justify-content: center; }
.event-line { display: flex; align-items: center; gap: 0.5rem; }
.event-title, .event-time { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-title { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 0.875rem; }
.event-time { font-family: 'Poppins', sans-serif; font-size: 0.75rem; }
</style>

<style scoped>
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.title { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem; }
.subtitle { font-size: 1.125rem; color: var(--cinza-texto); }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; border: none; background-color: var(--azul-principal); color: var(--branco); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease; }
.btn-primary:hover { background-color: var(--azul-escuro); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.stat-card { display: flex; align-items: flex-start; gap: 1rem; background-color: var(--bg-color, var(--branco)); padding: 1.5rem; border-radius: 1rem; }
.card-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: var(--icon-color, var(--preto)); color: var(--branco); flex-shrink: 0; }
.card-content { display: flex; flex-direction: column; }
.card-content h3 { font-size: 1rem; font-weight: 500; color: #555; margin-bottom: 0.25rem; margin-top: 0; }
.stat-data { font-size: 1.75rem; font-weight: 700; color: var(--preto); margin: 0; }
.stat-data-empty { font-size: 1rem; font-weight: 500; color: var(--cinza-texto); margin: 0; padding-top: 0.5rem; }
.stat-card small { font-size: 0.75rem; color: #f59e0b; }
.stat-card.blue { --icon-color: #3b82f6; --bg-color: #eff6ff; }
.stat-card.green { --icon-color: #10b981; --bg-color: #f0fdf4; }
.stat-card.orange { --icon-color: #f97316; --bg-color: #fff7ed; }
.stat-card.purple { --icon-color: #8b5cf6; --bg-color: #f5f3ff; }
.appointment-details { display: flex; flex-direction: column; gap: 0.5rem; }
.appointment-line { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600; }
.appointment-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.loading-state { color: var(--cinza-texto); padding: 2rem 0; }
.calendar-scroll-container { max-height: 600px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 1rem; background-color: var(--branco); }
.calendar-scroll-container::-webkit-scrollbar { width: 8px; }
.calendar-scroll-container::-webkit-scrollbar-track { background: #f9fafb; border-radius: 1rem; }
.calendar-scroll-container::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 8px; }
.calendar-scroll-container::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
