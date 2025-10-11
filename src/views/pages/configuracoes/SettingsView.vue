<script setup>
import { ref } from 'vue'
import GeneralSettings from '@/components/pages/configuracoes/tabs/GeneralSettings.vue'
import WorkingHoursSettings from '@/components/pages/configuracoes/tabs/WorkingHoursSettings.vue'
import AnamnesisTemplates from '@/components/pages/configuracoes/tabs/AnamnesisTemplates.vue'
import EmployeesSettings from '@/components/pages/configuracoes/tabs/EmployeesSettings.vue' // 1. Importar

// 1. Importar os ícones
import { SlidersHorizontal, Clock, FileText, Users } from 'lucide-vue-next' // 2. Adicionar ícone Users

const activeTab = ref('geral')
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
  white-space: nowrap; /* Impede que o texto quebre */
}
.tabs-nav button.active {
  color: var(--azul-principal);
  border-bottom-color: var(--azul-principal);
}

/* ✨ INÍCIO DAS MUDANÇAS PARA O RESPONSIVO ✨ */
@media (max-width: 768px) {
  .title {
    font-size: 1.875rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .tabs-nav {
    overflow-x: auto;
    /* Efeitos para esconder a barra de rolagem visualmente */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .tabs-nav::-webkit-scrollbar {
    display: none; /* Chrome, Safari, and Opera */
  }
  .tabs-nav button {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }
}
</style>
