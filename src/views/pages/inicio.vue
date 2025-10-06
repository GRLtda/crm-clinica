<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { Calendar, Users, CircleDollarSign, Clock, User as UserIcon, CalendarCheck, Check, Play } from 'lucide-vue-next';
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { useAppointmentsStore } from '@/stores/appointments';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const appointmentsStore = useAppointmentsStore();
const toast = useToast();
const router = useRouter();
const isModalOpen = ref(false);
const currentTime = ref(new Date());
let timer = null;

const stats = computed(() => dashboardStore.stats);

const todayFormatted = computed(() => {
    return new Date().toLocaleDateString('pt-br', {
        day: 'numeric',
        month: 'long'
    })
});

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
    class: 'clinic-event',
    originalEvent: appt,
  }));
});

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
  try {
    return date.toLocaleTimeString('pt-BR', options);
  } catch (e) {
    console.error("Data inválida para formatação:", dateString);
    return 'Inválido';
  }
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

async function handleConfirmArrival(event) {
    const { _id: appointmentId } = event.originalEvent;
    const { success } = await appointmentsStore.updateAppointmentStatus(appointmentId, 'Confirmado');
    if (success) {
        toast.success(`Chegada do paciente confirmada!`);
        dashboardStore.fetchDashboardStats();
    } else {
        toast.error("Não foi possível confirmar a chegada.");
    }
}

function handleStartAppointment(event) {
    const { _id: appointmentId, patient } = event.originalEvent;
    router.push(`/app/atendimentos/${appointmentId}/patient/${patient._id}`);
}
</script>

<template>
  <div class="dashboard-overview">
    <CreateAppointmentModal v-if="isModalOpen" @close="isModalOpen = false" />

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
        <div class="section-header">
            <h2 class="section-title">Agenda de Hoje</h2>
            <span class="section-subtitle">{{ todayFormatted }}</span>
        </div>

        <div class="calendar-container">
            <div v-if="formattedEvents.length === 0" class="empty-agenda">
                <CalendarCheck :size="48" />
                <h3 class="empty-title">Agenda Limpa!</h3>
                <p class="empty-text">Você não tem atendimentos agendados para hoje.</p>
            </div>
            <div v-else class="calendar-scroll-container">
                <vue-cal
                    class="vuecal--full-height-delete"
                    :events="formattedEvents"
                    :show-current-time-indicator="true"
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
                          <div class="event-details-wrapper">
                              <div class="patient-avatar-placeholder">
                                  {{ event.title.charAt(0) }}
                              </div>
                              <div class="event-info">
                                  <div class="event-line">
                                      <UserIcon :size="16" />
                                      <span class="event-title">{{ event.title }}</span>
                                  </div>
                                  <div class="event-line">
                                      <Clock :size="16" />
                                      <span class="event-time">{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</span>
                                  </div>
                              </div>
                          </div>

                          <div class="event-actions">
                              <button class="action-btn confirm" @click.stop="handleConfirmArrival(event)" title="Confirmar chegada">
                                  <Check :size="16" />
                              </button>
                              <button class="action-btn start" @click.stop="handleStartAppointment(event)" title="Iniciar atendimento">
                                  <Play :size="16" />
                              </button>
                          </div>
                      </div>
                    </template>
                </vue-cal>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.calendar-section { margin-top: 1.5rem; }
.section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.section-title { font-family: var(--fonte-titulo); font-size: 1.5rem; font-weight: 600; margin: 0; }
.section-subtitle { font-size: 1rem; color: var(--cinza-texto); font-weight: 500; }
.calendar-container {
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    background-color: var(--branco);
    height: 550px;
    display: flex;
}

.vuecal__event {
    cursor: default;
    border: none;
}
.vuecal__event.clinic-event {
    background-color: #eef2ff;
    border-left: 5px solid #818cf8;
    color: #4338ca;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-out;
    display: flex;
}
.vuecal__event.clinic-event:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.vuecal__event.clinic-event .custom-event-content.current {
    border-left-color: var(--azul-principal);
    box-shadow: 0 0 0 2px var(--branco), 0 0 0 4px var(--azul-principal);
    animation: pulse-shadow 2s infinite;
}

@keyframes pulse-shadow {
  0% { box-shadow: 0 0 0 2px var(--branco), 0 0 0 4px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 2px var(--branco), 0 0 0 7px rgba(59, 130, 246, 0.2); }
  100% { box-shadow: 0 0 0 2px var(--branco), 0 0 0 4px rgba(59, 130, 246, 0.4); }
}

.vuecal__time-cell-label {
    font-family: 'Poppins', sans-serif;
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 500;
}
.vuecal--day-view .vuecal__bg { height: auto; }
.vuecal__no-event { display: none; }

.vuecal__time-cell::after {
    content: '';
    position: absolute;
    top: 0;
    left: 3.5rem;
    right: 0;
    height: 1px;
    background-color: #f3f4f6;
}
.vuecal__time-cell:nth-of-type(2n+1)::after {
    background-color: #e5e7eb;
}

.vuecal__current-time-indicator {
    border-top: 2px solid #ef4444;
    z-index: 1;
}
.vuecal__current-time-indicator::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 3rem;
    width: 10px;
    height: 10px;
    background-color: #ef4444;
    border-radius: 50%;
}

.custom-event-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
}

.event-details-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-grow: 1;
    min-width: 0;
}

.patient-avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #c7d2fe;
    color: var(--azul-principal);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 600;
    flex-shrink: 0;
}

.event-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
}

.event-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
}
.event-line svg {
    flex-shrink: 0;
    color: #6b7280;
}
.event-title {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    color: #312e81;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.event-time {
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event-actions {
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    flex-shrink: 0;
}
.vuecal__event:hover .event-actions,
.custom-event-content.current .event-actions {
    opacity: 1;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 36px;
    height: 36px;
}
.action-btn.confirm {
    background-color: #dcfce7;
    color: #16a34a;
}
.action-btn.confirm:hover {
    background-color: #bbf7d0;
}
.action-btn.start {
    background-color: var(--azul-principal);
    color: var(--branco);
}
.action-btn.start:hover {
    background-color: var(--azul-escuro);
}
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

.calendar-scroll-container { flex-grow: 1; max-height: 600px; overflow-y: auto; }
.calendar-scroll-container::-webkit-scrollbar { width: 8px; }
.calendar-scroll-container::-webkit-scrollbar-track { background: #f9fafb; }
.calendar-scroll-container::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 8px; }
.calendar-scroll-container::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

.empty-agenda {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #9ca3af;
}
.empty-agenda svg {
    margin-bottom: 1.5rem;
}
.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #4b5563;
}
.empty-text {
    color: var(--cinza-texto);
}
</style>
