<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GeneralSettings from '@/components/pages/configuracoes/tabs/GeneralSettings.vue'
import WorkingHoursSettings from '@/components/pages/configuracoes/tabs/WorkingHoursSettings.vue'
import AnamnesisTemplates from '@/components/pages/configuracoes/tabs/AnamnesisTemplates.vue'
import EmployeesSettings from '@/components/pages/configuracoes/tabs/EmployeesSettings.vue' // 1. Importar

import { SlidersHorizontal, Clock, FileText, Users } from 'lucide-vue-next'

const activeTab = ref('geral')
const route = useRoute()

const tabs = [
  { id: 'geral', label: 'Geral', icon: SlidersHorizontal },
  { id: 'horario', label: 'Horário de Funcionamento', icon: Clock },
  { id: 'anamnese', label: 'Modelos de Anamnese', icon: FileText },
  { id: 'funcionarios', label: 'Usuários e Convites', icon: Users },
]

onMounted(() => {
  if (route.query.tab && tabs.some(tab => tab.id === route.query.tab)) {
    activeTab.value = route.query.tab
  }
})
</script>

<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1 class="title">Configurações</h1>
      <p class="subtitle">Gerencie as informações e preferências da sua clínica.</p>
    </header>

    <div class="tabs-nav">
      <button @click="activeTab = 'geral'" :class="{ active: activeTab === 'geral' }">
        <SlidersHorizontal :size="18" />
        <span>Geral</span>
      </button>
      <button @click="activeTab = 'horario'" :class="{ active: activeTab === 'horario' }">
        <Clock :size="18" />
        <span>Horário de Funcionamento</span>
      </button>
      <button @click="activeTab = 'anamnese'" :class="{ active: activeTab === 'anamnese' }">
        <FileText :size="18" />
        <span>Modelos de Anamnese</span>
      </button>
      <button @click="activeTab = 'funcionarios'" :class="{ active: activeTab === 'funcionarios' }">
        <Users :size="18" />
        <span>Funcionários</span>
      </button>
    </div>

    <div class="tab-content">
      <GeneralSettings v-if="activeTab === 'geral'" />
      <WorkingHoursSettings v-if="activeTab === 'horario'" />
      <AnamnesisTemplates v-if="activeTab === 'anamnese'" />
      <EmployeesSettings v-if="activeTab === 'funcionarios'" />
    </div>
  </div>
</template>

<style scoped>
.settings-header {
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
}
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  overflow-x: auto; /* Para melhor visualização em telas pequenas */
}
.tabs-nav button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: var(--cinza-texto);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.tabs-nav button.active {
  color: var(--azul-principal);
  border-bottom-color: var(--azul-principal);
}
</style>
