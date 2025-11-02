import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getEmployeesAndInvites as apiGetEmployees,
  inviteEmployee as apiInviteEmployee,
  deactivateEmployee as apiDeactivateEmployee,
  updateEmployeeRole as apiUpdateEmployeeRole,
  cancelInvitation as apiCancelInvitation,
} from '@/api/employees'

export const useEmployeesStore = defineStore('employees', () => {
  const activeEmployees = ref([])
  const pendingInvitations = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchEmployees() {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiGetEmployees()
      activeEmployees.value = response.data.activeEmployees
      pendingInvitations.value = response.data.pendingInvitations
      return { success: true }
    } catch (err) {
      error.value = 'Erro ao carregar funcionários.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function inviteEmployee(invitationData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiInviteEmployee(invitationData)
      await fetchEmployees() // Re-fetch para atualizar a lista de pendentes
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao enviar convite.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deactivateEmployee(employeeId) {
    try {
      await apiDeactivateEmployee(employeeId)
      await fetchEmployees()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Erro ao desativar funcionário.' }
    }
  }

  async function updateEmployeeRole(employeeId, role) {
    try {
      await apiUpdateEmployeeRole(employeeId, role)
      await fetchEmployees()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Erro ao atualizar cargo.' }
    }
  }

  async function cancelPendingInvitation(inviteId) {
    try {
      await apiCancelInvitation(inviteId)
      await fetchEmployees()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Erro ao cancelar convite.' }
    }
  }

  return {
    activeEmployees,
    pendingInvitations,
    isLoading,
    error,
    fetchEmployees,
    inviteEmployee,
    deactivateEmployee,
    updateEmployeeRole,
    cancelPendingInvitation,
  }
})
