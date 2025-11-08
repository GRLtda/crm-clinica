import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createAppointment as apiCreateAppointment,
  updateAppointment as apiUpdateAppointment,
  getAppointments as apiGetAppointments,
} from '@/api/appointments'
import apiClient from '@/api'
import { useDashboardStore } from './dashboard'

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([])
  const patientAppointments = ref([])
  const isLoading = ref(false)

  const currentStartDate = ref(null)
  const currentEndDate = ref(null)

  async function fetchAppointmentsByDate(startDate, endDate) {
    isLoading.value = true

    currentStartDate.value = startDate
    currentEndDate.value = endDate

    try {
      const params = { startDate, endDate: endDate || startDate }
      const response = await apiGetAppointments(params)

      if (Array.isArray(response.data)) {
        appointments.value = response.data
      } else {
        console.warn('API de agendamentos não retornou um array.')
        appointments.value = []
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      appointments.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createAppointment(appointmentData) {
    isLoading.value = true
    try {
      await apiCreateAppointment(appointmentData)
      const dashboardStore = useDashboardStore()
      dashboardStore.fetchDashboardStats()

      if (currentStartDate.value) {
        fetchAppointmentsByDate(currentStartDate.value, currentEndDate.value)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function updateAppointment(appointmentId, appointmentData) {
    isLoading.value = true
    try {
      await apiUpdateAppointment(appointmentId, appointmentData)

      if (currentStartDate.value) {
        fetchAppointmentsByDate(currentStartDate.value, currentEndDate.value)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function updateAppointmentStatus(appointmentId, status) {
    isLoading.value = true
    try {
      await apiUpdateAppointment(appointmentId, { status })
      const dashboardStore = useDashboardStore()
      dashboardStore.fetchDashboardStats()

      if (currentStartDate.value) {
        fetchAppointmentsByDate(currentStartDate.value, currentEndDate.value)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAppointmentsByPatient(patientId) {
    this.isLoading = true
    try {
      const response = await apiClient.get(`/appointments/patient/${patientId}`)
      this.patientAppointments = response.data
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro ao buscar atendimentos do paciente:', error)
      this.patientAppointments = []
      return { success: false, error }
    } finally {
      this.isLoading = false
    }
  }

  return {
    isLoading,
    appointments,
    fetchAppointmentsByDate,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    fetchAppointmentsByPatient,
  }
})
