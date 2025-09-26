import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAnamnesisTemplates as apiGetTemplates,
  createAnamnesisTemplate as apiCreateTemplate,
  deleteAnamnesisTemplate as apiDeleteTemplate,
  getAnamnesisTemplateById as apiGetTemplateById,
  updateAnamnesisTemplate as apiUpdateTemplate,
  assignAnamnesis as apiAssignAnamnesis
} from '@/api/anamnesis'

export const useAnamnesisStore = defineStore('anamnesis', () => {
  const templates = ref([])
  const isLoading = ref(false)

  async function fetchTemplates() {
    isLoading.value = true
    try {
      const response = await apiGetTemplates()
      templates.value = response.data
    } catch (error) {
      console.error('Erro ao buscar modelos de anamnese:', error)
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Ação para criar um modelo
  async function createTemplate(templateData) {
    isLoading.value = true
    try {
      await apiCreateTemplate(templateData)
      await fetchTemplates() // Atualiza a lista após a criação
      return { success: true }
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTemplate(templateId) {
    isLoading.value = true
    try {
      await apiDeleteTemplate(templateId)
      await fetchTemplates() // Atualiza a lista após a exclusão
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTemplateById(templateId) {
    isLoading.value = true
    try {
      const response = await apiGetTemplateById(templateId)
      return response.data // Retorna os dados do modelo específico
    } catch (error) {
      console.error('Erro ao buscar modelo por ID:', error)
    } finally {
      isLoading.value = false
    }
  }

  // NOVA AÇÃO: Atualiza um modelo existente
  async function updateTemplate(templateId, templateData) {
    isLoading.value = true
    try {
      await apiUpdateTemplate(templateId, templateData)
      await fetchTemplates() // Atualiza a lista após a edição
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error)
      return { success: false, error }
    } finally {
      isLoading.value = false
    }
  }

  async function assignAnamnesis(patientId, templateId) {
    try {
      const response = await apiAssignAnamnesis(patientId, templateId);
      // A resposta contém o token de acesso do paciente
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erro ao atribuir anamnese:", error);
      return { success: false, error };
    }
  }

  return {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    fetchTemplateById,
    updateTemplate,
    assignAnamnesis
  }
})
