import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createPatient as apiCreatePatient,
  searchPatients as apiSearchPatients,
  getPatientById as apiGetPatientById,
  updatePatient as apiUpdatePatient,
  getAllPatients as apiGetAllPatients, // ✨ 1. Importar a nova função
} from '@/api/patients'

export const usePatientsStore = defineStore('patients', () => {
  // STATE
  const allPatients = ref([]) // ✨ INICIALIZADO COMO ARRAY VAZIO (CRUCIAL)
  const searchResults = ref([])
  const selectedPatient = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  })

  // ACTIONS

  /**
   * ✨ 3. NOVA ACTION: Busca a lista paginada de pacientes.
   */
  async function fetchAllPatients(page = 1, limit = 10) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiGetAllPatients({ page, limit })

      // ✨ AQUI ESTÁ A CORREÇÃO PRINCIPAL ✨
      // Atribuímos o array de pacientes (response.data.data) ao nosso estado.
      allPatients.value = response.data.data

      // E guardamos as informações de paginação.
      pagination.value = {
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        limit: response.data.limit,
      }
      return { success: true }
    } catch (err) {
      error.value = 'Erro ao carregar pacientes.'
      allPatients.value = [] // Em caso de erro, garante que seja um array vazio
      console.error('Falha em fetchAllPatients:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function searchPatients(query) {
    if (!query) {
      searchResults.value = []
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const response = await apiSearchPatients(query)
      searchResults.value = response.data.data
    } catch (err) {
      error.value = 'Erro ao buscar pacientes.'
      searchResults.value = []
      console.error('Falha em searchPatients:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createPatient(patientData) {
    isLoading.value = true
    this.error = null
    try {
      const response = await apiCreatePatient(patientData)
      // Recarrega a lista para refletir a adição
      await fetchAllPatients(1, pagination.value.limit)
      return { success: true, data: response.data }
    } catch (err) {
      this.error = err.response?.data?.message || 'Erro ao criar o paciente.'
      console.error('Falha em createPatient:', err)
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async function fetchPatientById(patientId) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiGetPatientById(patientId)
      selectedPatient.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      error.value = 'Paciente não encontrado.'
      console.error('Falha em fetchPatientById:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updatePatient(patientId, patientData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiUpdatePatient(patientId, patientData)
      selectedPatient.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao atualizar o paciente.'
      console.error('Falha em updatePatient:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // RETURN
  return {
    allPatients,
    searchResults,
    selectedPatient,
    pagination, // ✨ 4. Expor o estado da paginação
    isLoading,
    error,
    createPatient,
    searchPatients,
    fetchPatientById,
    updatePatient,
    fetchAllPatients, // ✨ 5. Expor a nova action
  }
})
