<script setup>
import {
  MessageSquare,
  LayoutTemplate,
  Link,
  History,
  ArrowRight
} from 'lucide-vue-next'

// Definição dos cartões do dashboard.
const dashboardCards = [
  {
    id: 'mensagens',
    label: 'Mensagens Automáticas',
    description: 'Configure e gerencie os lembretes de consulta.',
    icon: MessageSquare,
    name: 'marketing-mensagens'
  },
  {
    id: 'modelos',
    label: 'Modelos de Mensagem',
    description: 'Crie e edite os textos padrão para envio.',
    icon: LayoutTemplate,
    name: 'marketing-modelos'
  },
  {
    id: 'conexao',
    label: 'Conexão',
    description: 'Gerencie o status da sua conexão com o WhatsApp.',
    icon: Link,
    name: 'marketing-conexao'
  },
  {
    id: 'logs',
    label: 'Histórico de Envios',
    description: 'Visualize todos os envios, sucessos e falhas.',
    icon: History,
    name: 'marketing-logs'
  }
]
</script>

<template>
  <div class="marketing-page">
    <div class="container">
      <header class="page-header">
        <h1 class="title">Marketing & Automações</h1>
        <p class="subtitle">
          Gerencie suas campanhas e ferramentas de automação em um só lugar.
        </p>
      </header>

      <div class="dashboard-grid">
        <router-link
          v-for="card in dashboardCards"
          :key="card.id"
          :to="{ name: card.name }"
          class="overview-card"
        >
          <div class="card-icon-wrapper">
            <component :is="card.icon" :size="28" stroke-width="1.5" />
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ card.label }}</h3>
            <p class="card-description">{{ card.description }}</p>
          </div>

          <div class="card-action">
            <span class="action-text">Acessar</span>
            <ArrowRight :size="18" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marketing-page {
  padding: 2rem;
  min-height: 100vh;
  background-color: var(--bg-page, #f9fafb); /* Fundo suave para a página */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 3rem;
  text-align: left;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--preto, #111827);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--cinza-texto, #6b7280);
  font-weight: 400;
}

/* Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

/* Cards */
.overview-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  border-color: rgba(59, 130, 246, 0.1);
}

/* Icon */
.card-icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: var(--azul-leve, #eff6ff);
  color: var(--azul-principal, #3b82f6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.overview-card:hover .card-icon-wrapper {
  background-color: var(--azul-principal, #3b82f6);
  color: #ffffff;
}

/* Content */
.card-content {
  flex-grow: 1;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--preto, #1f2937);
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 0.95rem;
  color: var(--cinza-texto, #6b7280);
  line-height: 1.6;
}

/* Action Footer */
.card-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--azul-principal, #3b82f6);
  font-weight: 500;
  font-size: 0.95rem;
  margin-top: auto;
  opacity: 0.8;
  transition: opacity 0.3s ease, gap 0.3s ease;
}

.overview-card:hover .card-action {
  opacity: 1;
  gap: 0.75rem;
}

.action-text {
  position: relative;
}

/* Responsividade */
@media (max-width: 640px) {
  .marketing-page {
    padding: 1.5rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 1.75rem;
  }
}
</style>
