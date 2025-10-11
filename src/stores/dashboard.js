import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getClinicSummary } from '@/api/clinics'; // Importa a nova função

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref({
    totalPatients: 0,
    appointmentsToday: [], 
    nextAppointment: null,
  });
  const isLoading = ref(false);

  async function fetchDashboardStats(params = {}) {
    isLoading.value = true;
    try {
      // Faz uma única chamada para o novo endpoint de sumário
      const response = await getClinicSummary(params);
      const summary = response.data;

      // Atualiza o estado com os dados recebidos
      stats.value.totalPatients = summary.totalPatients;
      stats.value.appointmentsToday = summary.todaysAppointments;

      // A lógica para encontrar o próximo agendamento continua a mesma,
      // mas agora usa a lista 'todaysAppointments' da resposta.
      const now = new Date();
      stats.value.nextAppointment = summary.todaysAppointments
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
