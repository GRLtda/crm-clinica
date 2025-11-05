import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAnamnesisTemplates as apiGetTemplates,
  createAnamnesisTemplate as apiCreateTemplate,
  deleteAnamnesisTemplate as apiDeleteTemplate,
  getAnamnesisTemplateById as apiGetTemplateById,
  updateAnamnesisTemplate as apiUpdateTemplate,
  getPublicAnamnesis as apiGetPublic,
  submitPublicAnamnesis as apiSubmitPublic,
  assignAnamnesis as apiAssignAnamnesis,
  getAnamnesisForPatient as apiGetForPatient,
  updateAnamnesisResponse as apiUpdateResponse,
} from '@/api/anamnesis'
import { useToast } from 'vue-toastification'

export const useAnamnesisStore = defineStore('anamnesis', () => {
  const toast = useToast()

  const templates = ref([])
  const publicTemplate = ref(null) // Para o formulário público
  const patientAnamneses = ref([]) // ✨ Sempre inicializado como um array
  const isLoading = ref(false)

  // --- Ações para Templates de Anamnese ---

  async function fetchTemplates() {
    isLoading.value = true
    try {
      const response = await apiGetTemplates()
      templates.value = response.data
    } catch (error) {
      console.error('Erro ao buscar modelos de anamnese:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido'
      toast.error(`Erro ao buscar modelos: ${errorMessage}`)
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createTemplate(payload) {
    isLoading.value = true
    try {
      const response = await apiCreateTemplate(payload)
      templates.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      // Propaga o erro para o modal tratar
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTemplate(templateId) {
    isLoading.value = true
    try {
      await apiDeleteTemplate(templateId)
      templates.value = templates.value.filter((t) => t._id !== templateId)
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir modelo:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido'
      toast.error(`Erro ao excluir modelo: ${errorMessage}`)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTemplateById(templateId) {
    isLoading.value = true
    try {
      const response = await apiGetTemplateById(templateId)
      return response.data // Retorna o template específico
    } catch (error) {
      console.error('Erro ao buscar modelo por ID:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido'
      toast.error(`Erro ao carregar modelo: ${errorMessage}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateTemplate(templateId, payload) {
    isLoading.value = true
    try {
      const response = await apiUpdateTemplate(templateId, payload)
      const index = templates.value.findIndex((t) => t._id === templateId)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error)
      // Propaga o erro para o modal tratar
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // --- Ações para Respostas de Anamnese (Paciente e Médico) ---

  async function fetchPublicAnamnesis(token) {
    isLoading.value = true
    try {
      const response = await apiGetPublic(token)
      publicTemplate.value = response.data
      return { success: true }
    } catch (error) {
      console.error('Erro ao buscar anamnese pública:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Token inválido ou expirado'
      toast.error(`Erro ao carregar formulário: ${errorMessage}`)
      publicTemplate.value = null
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Ação para o PACIENTE enviar o formulário público
  async function submitPublicAnamnesis(token, answersPayload) {
    isLoading.value = true
    try {
      // O payload é { answers: [...] }
      const response = await apiSubmitPublic(token, answersPayload)
      toast.success(response.data.message || 'Respostas enviadas com sucesso!')
      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar respostas da anamnese:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido'
      toast.error(`Erro ao enviar respostas: ${errorMessage}`)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  // Ação para o MÉDICO atribuir uma anamnese a um paciente
  async function assignAnamnesisToPatient(patientId, templateId) {
    isLoading.value = true
    try {
      // Garante que o payload é { templateId }
      const response = await apiAssignAnamnesis(patientId, { templateId })
      if (response.data) {
        patientAnamneses.value.unshift(response.data) // Adiciona no início da lista
      }
      toast.success(response.data.message || 'Anamnese enviada ao paciente!')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro ao atribuir anamnese:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao enviar para o paciente'
      toast.error(`Erro: ${errorMessage}`)
      return { success: false, error }
    }
  }

  // ✨✨ FUNÇÃO CORRIGIDA (para o erro .filter) ✨✨
  // Ação para buscar TODAS as anamneses (respostas) de um paciente
  async function fetchAnamnesisForPatient(patientId) {
    isLoading.value = true
    patientAnamneses.value = [] // Reseta para um array vazio antes da chamada
    try {
      const response = await apiGetForPatient(patientId)

      // ✨ CORREÇÃO:
      // Garante que 'patientAnamneses.value' seja SEMPRE um array.
      if (Array.isArray(response.data)) {
        patientAnamneses.value = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        // Fallback para caso a API embrulhe a resposta em um objeto { data: [...] }
        patientAnamneses.value = response.data.data
      } else {
        // Se a API retornar algo inesperado (null, {}, etc.), mantém como array vazio
        console.warn(
          'API de anamnese do paciente não retornou um array:',
          response.data,
        )
        patientAnamneses.value = []
      }
    } catch (error) {
      console.error('Erro ao buscar anamneses do paciente:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido'
      toast.error(`Erro ao buscar anamneses do paciente: ${errorMessage}`)
      patientAnamneses.value = [] // Garante que seja um array no erro
    } finally {
      isLoading.value = false
    }
  }

  // AÇÃO para o MÉDICO salvar/atualizar o formulário
  async function updateAnamnesisResponse(patientId, responseId, answersPayload) {
    isLoading.value = true
    try {
      // O payload é { answers: [...] }
      const response = await apiUpdateResponse(
        patientId,
        responseId,
        answersPayload,
      )

      // Atualiza a resposta na lista local (patientAnamneses)
      const index = patientAnamneses.value.findIndex(
        (a) => a._id === responseId,
      )
      if (index !== -1) {
        // Mescla os dados para manter o template populado
        patientAnamneses.value[index] = {
          ...patientAnamneses.value[index],
          ...response.data, // response.data deve ser a AnamnesisResponse atualizada
        }
      }

      toast.success(response.data.message || 'Respostas atualizadas com sucesso!')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro ao atualizar respostas da anamnese:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecidu'
      toast.error(`Erro ao salvar respostas: ${errorMessage}`)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const answeredAnamneses = computed(() =>
    // Esta linha agora é segura, pois 'patientAnamneses.value' é sempre um array
    patientAnamneses.value.filter((a) => a.status === 'Preenchido'),
  )
  const pendingAnamneses = computed(() =>
    // Esta linha agora é segura
    patientAnamneses.value.filter((a) => a.status === 'Pendente'),
  )

  return {
    templates,
    publicTemplate,
    isLoading,
    patientAnamneses,
    answeredAnamneses,
    pendingAnamneses,

    // Funções de Template
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    fetchTemplateById,
    updateTemplate,

    // Funções de Resposta
    fetchPublicAnamnesis,
    submitPublicAnamnesis,
    assignAnamnesisToPatient,
    fetchAnamnesisForPatient,
    updateAnamnesisResponse,
  }
})
