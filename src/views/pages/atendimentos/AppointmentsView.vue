<script setup>
import { onMounted, computed, ref } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRouter } from 'vue-router'
import { Check, Play, FileText, CalendarDays, Plus } from 'lucide-vue-next'
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue'

const appointmentsStore = useAppointmentsStore()
const router = useRouter()
const appointments = computed(() => appointmentsStore.appointments)

const isModalOpen = ref(false)

onMounted(() => {
  // A função fetchAppointmentsByDate já deve buscar pela data de hoje por padrão
  appointmentsStore.fetchAppointmentsByDate()
})

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC', // Lembre-se que UTC pode não ser seu fuso horário local
  })
}

function openCreateModal() {
  isModalOpen.value = true
}
</script>

<template>
  <div class="appointments-view">
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

    <div v-if="appointmentsStore.isLoading">
      <p>Carregando agendamentos...</p>
    </div>

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
      <div v-for="appt in appointments" :key="appt._id" class="appointment-card">
        <div class="patient-info">
          <div class="patient-avatar">{{ appt.patient.name.charAt(0) }}</div>
          <div>
            <div class="patient-name">{{ appt.patient.name }}</div>
            <div class="appointment-time">
              {{ formatTime(appt.startTime) }} - {{ formatTime(appt.endTime) }}
            </div>
          </div>
        </div>
        <div class="appointment-status" :class="appt.status.toLowerCase().replace(' ', '-')">
          {{ appt.status }}
        </div>
        <div class="appointment-actions">
          <template v-if="appt.status === 'Agendado'">
            <!-- <button class="btn-secondary">
              <Check :size="16" />
              Cliente Chegou
            </button> -->
            <router-link
              :to="`/app/atendimentos/${appt._id}/patient/${appt.patient._id}`"
              class="btn-primary"
            >
              <Play :size="16" />
              Iniciar Atendimento
            </router-link>
          </template>
          <template v-else-if="appt.status === 'Realizado'">
            <router-link
              :to="`/app/atendimentos/${appt._id}/patient/${appt.patient._id}`"
              class="btn-secondary btn-icon"
            >
              <FileText :size="16" />
              Ver Anotações
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>

  <CreateAppointmentModal v-if="isModalOpen" @close="isModalOpen = false" />
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 2.25rem;
  margin: 0;
}
.subtitle {
  color: var(--cinza-texto);
  margin: 0;
}
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.appointment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
}
.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.patient-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}
.patient-name {
  font-weight: 600;
}
.appointment-time {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}
.appointment-status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.875rem;
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

.appointment-actions {
  display: flex;
  gap: 1rem;
  min-width: 320px;
  justify-content: flex-end;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--azul-principal);
  color: var(--branco);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--branco);
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-secondary.btn-icon {
  text-decoration: none;
  color: inherit;
}

/* ✨ NOVOS ESTILOS PARA O EMPTY STATE ✨ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background-color: var(--branco);
  margin-top: 1rem;
}
.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f3f4f6; /* cinza-claro */
  margin-bottom: 1.5rem;
}
.empty-state-icon svg {
  color: #9ca3af; /* cinza-texto */
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
