// src/stores/clinic.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createClinic as apiCreateClinic,
  updateClinic as apiUpdateClinic,
} from '@/api/clinics'
import { uploadImage as apiUploadImage } from '@/api/uploads'
import { useAuthStore } from './auth'

export const useClinicStore = defineStore('clinic', () => {
  const currentClinic = ref(null)

  function setClinic(clinicData) {
    currentClinic.value = clinicData
  }

  async function createClinic(clinicData) {
    try {
      const response = await apiCreateClinic(clinicData)
      setClinic(response.data)

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
      setClinic(response.data)

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

  async function uploadLogo(formData) {
    try {
      const response = await apiUploadImage(formData)
      // Pega a 'imageUrl' da resposta, conforme você especificou
      const logoUrl = response.data.imageUrl

      if (currentClinic.value) {
        currentClinic.value.logoUrl = logoUrl
      }

      const authStore = useAuthStore()
      await authStore.fetchUser()

      return { success: true, data: { logoUrl } }
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error)
      return { success: false, error }
    }
  }

  return { currentClinic, createClinic, updateClinicDetails, setClinic, uploadLogo }
})
