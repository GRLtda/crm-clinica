<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { Calendar } from 'lucide-vue-next';
import CreateAppointmentModal from '@/components/pages/dashboard/CreateAppointmentModal.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const isModalOpen = ref(false);

const stats = computed(() => dashboardStore.stats);

onMounted(() => {
  dashboardStore.fetchDashboardStats();
});

function formatTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // Adicionado para consistência
  });
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
    <div v-else class="stats-grid">
      <div class="stat-card">
        <h3>Pacientes Ativos</h3>
        <p class="stat-number">{{ stats.totalPatients }}</p>
      </div>
      <div class="stat-card">
        <h3>Atendimentos Hoje</h3>
        <p class="stat-number">{{ stats.appointmentsToday.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Cobranças Pendentes</h3>
        <p class="stat-number">R$ 4.320,00</p>
        <small>(API não disponível)</small>
      </div>
      <div class="stat-card">
        <h3>Próximo Agendamento</h3>
        <div v-if="stats.nextAppointment" class="stat-text">
          <span>{{ stats.nextAppointment.patient.name }}</span>
          <span>{{ formatTime(stats.nextAppointment.startTime) }}</span>
        </div>
        <p v-else class="stat-text-empty">Nenhum agendamento futuro para hoje.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  background-color: var(--branco);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}
.stat-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cinza-texto);
  margin-bottom: 0.5rem;
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--preto);
}
.stat-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--preto);
  display: flex;
  flex-direction: column;
}
.stat-text-empty {
  font-size: 1rem;
  color: var(--cinza-texto);
}
.stat-card small {
  font-size: 0.75rem;
  color: #f59e0b;
}
.loading-state {
  color: var(--cinza-texto);
  padding: 2rem 0;
}
</style>
