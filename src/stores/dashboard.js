import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePatientsStore } from './patients';
import { getAppointments } from '@/api/appointments';

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref({
    totalPatients: 0,
    appointmentsToday: [],
    nextAppointment: null,
  });
  const isLoading = ref(false);

  async function fetchDashboardStats() {
    isLoading.value = true;
    try {
      // Busca o total de pacientes
      const patientsStore = usePatientsStore();
      await patientsStore.fetchPatients({ limit: 1 }); // Busca só 1 para pegar o total
      stats.value.totalPatients = patientsStore.pagination.total;

      // Busca agendamentos de hoje
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const response = await getAppointments({ startDate: today, endDate: today });

      stats.value.appointmentsToday = response.data;

      // Encontra o próximo agendamento
      const now = new Date();
      stats.value.nextAppointment = response.data
        .filter(appt => new Date(appt.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
    } finally {
      isLoading.value = false;
    }
  }

  return { stats, isLoading, fetchDashboardStats };
});
