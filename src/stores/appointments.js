import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  createAppointment as apiCreateAppointment,
  updateAppointment as apiUpdateAppointment,
  getAppointments as apiGetAppointments
} from '@/api/appointments';
import { useDashboardStore } from './dashboard';

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([]); // Garante que o estado inicial seja um array vazio
  const isLoading = ref(false);

  async function fetchAppointmentsByDate(date) {
    isLoading.value = true;
    try {
      const response = await apiGetAppointments({ startDate: date, endDate: date });
      if (Array.isArray(response.data)) {
        appointments.value = response.data;
      } else {
        console.warn('API de agendamentos não retornou um array.');
        appointments.value = [];
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      appointments.value = []; // Garante que seja um array em caso de erro
    } finally {
      isLoading.value = false;
    }
  }

  async function createAppointment(appointmentData) {
    isLoading.value = true;
    try {
      await apiCreateAppointment(appointmentData);
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

  async function updateAppointmentStatus(appointmentId, status) {
    isLoading.value = true;
    try {
      await apiUpdateAppointment(appointmentId, { status });
      const dashboardStore = useDashboardStore();
      dashboardStore.fetchDashboardStats(); // Atualiza o dashboard também
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, appointments, fetchAppointmentsByDate, createAppointment, updateAppointmentStatus };
});
