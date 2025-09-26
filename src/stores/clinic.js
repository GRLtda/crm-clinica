import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createClinic as apiCreateClinic, updateClinic as apiUpdateClinic } from '@/api/clinics'
import { useAuthStore } from './auth'

export const useClinicStore = defineStore('clinic', () => {
  const currentClinic = ref(null)

  async function createClinic(clinicData) {
    try {
      const response = await apiCreateClinic(clinicData)
      currentClinic.value = response.data

      const authStore = useAuthStore()
      await authStore.fetchUser()

      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro ao criar clínica:', error)
      return { success: false, error }
    }
  }

  async function updateClinicDetails(clinicData) {
    try {
      const response = await apiUpdateClinic(clinicData)
      currentClinic.value = response.data

      const authStore = useAuthStore()
      if (authStore.user) {
        await authStore.fetchUser()
      }

      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro ao atualizar a clínica:', error)
      return { success: false, error }
    }
  }

  return { currentClinic, createClinic, updateClinicDetails }
})
