<script setup>
import { onMounted, computed } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { useRouter } from 'vue-router'
import { Check, Play, FileText } from 'lucide-vue-next' // Adicionado FileText

const appointmentsStore = useAppointmentsStore()
const router = useRouter()
const appointments = computed(() => appointmentsStore.appointments)

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
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
</script>

<template>
  <div class="appointments-view">
    <header class="page-header">
      <div>
        <h1 class="title">Atendimentos de Hoje</h1>
        <p class="subtitle">Confirme a chegada e inicie os atendimentos dos seus pacientes.</p>
      </div>
    </header>

    <div v-if="appointmentsStore.isLoading">Carregando...</div>
    <div v-else-if="appointments.length === 0" class="empty-state">
      <h3>Nenhum atendimento para hoje.</h3>
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
            <button class="btn-secondary">
              <Check :size="16" />
              Cliente Chegou
            </button>
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
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
}
.subtitle {
  color: var(--cinza-texto);
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
.empty-state {
  text-align: center;
  padding: 3rem;
}
</style>
