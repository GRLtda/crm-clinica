import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createAppointment as apiCreateAppointment } from '@/api/appointments';
import { useDashboardStore } from './dashboard';

export const useAppointmentsStore = defineStore('appointments', () => {
  const isLoading = ref(false);

  async function createAppointment(appointmentData) {
    isLoading.value = true;
    try {
      await apiCreateAppointment(appointmentData);
      // Atualiza os dados do dashboard após criar um novo agendamento
      const dashboardStore = useDashboardStore();
      dashboardStore.fetchDashboardStats();
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, createAppointment };
});
