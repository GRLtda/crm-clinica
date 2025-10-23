// src/views/pages/marketing/MarketingView.vue
<script setup>
import { ref } from 'vue'
// 👇 Importar ícone History e componente LogsTab
import { MessageSquare, LayoutTemplate, Link, History } from 'lucide-vue-next'
import ConnectionTab from '@/components/pages/marketing/tabs/ConnectionTab.vue'
import TemplatesTab from '@/components/pages/marketing/tabs/TemplatesTab.vue'
import MessagesTab from '@/components/pages/marketing/tabs/MessagesTab.vue'
import LogsTab from '@/components/pages/marketing/tabs/LogsTab.vue' // 👈 Importar

const activeTab = ref('mensagens')

const tabs = [
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare, component: MessagesTab },
  { id: 'modelos', label: 'Modelos', icon: LayoutTemplate, component: TemplatesTab },
  { id: 'conexao', label: 'Conexão', icon: Link, component: ConnectionTab },
  { id: 'logs', label: 'Histórico', icon: History, component: LogsTab }, // 👈 Adicionar aba
]
</script>

<template>
  <div class="marketing-page">
    <header class="page-header">
      <h1 class="title">Marketing & Automações</h1>
      <p class="subtitle">Gerencie suas conexões e campanhas de marketing.</p>
    </header>

    <div class="tabs-nav-wrapper">
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
        >
          <component :is="tab.icon" :size="18" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="tab-content">
      <KeepAlive>
        <component :is="tabs.find((t) => t.id === activeTab)?.component" />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
/* Os estilos continuam os mesmos */
.page-header {
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
.tabs-nav-wrapper {
  position: relative;
  margin-bottom: 2rem;
}
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-nav::-webkit-scrollbar {
  display: none;
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
@media (max-width: 768px) {
  .title {
    font-size: 1.75rem;
  }
  /* Estilos ::before e ::after para fade */
}
</style>
