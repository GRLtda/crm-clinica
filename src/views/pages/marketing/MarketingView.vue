<script setup>
import {
  MessageSquare,
  LayoutTemplate,
  Link,
  History,
  ArrowRight
} from 'lucide-vue-next'

// Em vez de 'tabs', agora temos 'cards' para o dashboard.
// Note que cada um agora tem um 'path' para o roteador.
const dashboardCards = [
  {
    id: 'mensagens',
    label: 'Mensagens Automáticas',
    description: 'Configure e gerencie os lembretes de consulta.',
    icon: MessageSquare,
    path: 'marketing/mensagens' // 👈 Rota de destino
  },
  {
    id: 'modelos',
    label: 'Modelos de Mensagem',
    description: 'Crie e edite os textos padrão para envio.',
    icon: LayoutTemplate,
    path: 'marketing/modelos' // 👈 Rota de destino
  },
  {
    id: 'conexao',
    label: 'Conexão',
    description: 'Gerencie o status da sua conexão com o WhatsApp.',
    icon: Link,
    path: 'marketing/conexao' // 👈 Rota de destino
  },
  {
    id: 'logs',
    label: 'Histórico de Envios',
    description: 'Visualize todos os envios, sucessos e falhas.',
    icon: History,
    path: 'marketing/logs' // 👈 Rota de destino
  }
]
</script>

<template>
  <div class="marketing-page">
    <header class="page-header">
      <h1 class="title">Marketing & Automações</h1>
      <p class="subtitle">
        Visão geral das suas ferramentas de automação e marketing.
      </p>
    </header>

    <div class="dashboard-grid">
      <router-link
        v-for="card in dashboardCards"
        :key="card.id"
        :to="card.path"
        class="overview-card"
      >
        <div class="card-icon">
          <component :is="card.icon" :size="24" />
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ card.label }}</h3>
          <p class="card-description">{{ card.description }}</p>
        </div>
        <div class="card-arrow">
          <ArrowRight :size="20" />
        </div>
      </router-link>
    </div>

    </div>
</template>

<style scoped>
/* Os estilos do header permanecem os mesmos */
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

/* Estilos antigos das abas (.tabs-nav-wrapper, .tabs-nav, etc.)
  foram removidos e substituídos pelos estilos do dashboard.
*/

.dashboard-grid {
  display: grid;
  /* Cria colunas responsivas:
     - Mínimo de 280px de largura.
     - Se encaixam quantas puderem (auto-fill).
     - O '1fr' faz com que ocupem todo o espaço disponível.
  */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem; /* Espaçamento entre os cartões */
}

.overview-card {
  /* Layout interno do card */
  display: flex;
  align-items: flex-start; /* Alinha o ícone e o texto no topo */
  gap: 1.5rem;

  /* Aparência do card */
  padding: 1.5rem;
  background-color: #fff; /* ou var(--branco) */
  border: 1px solid var(--cinza-borda-leve, #e5e7eb);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);

  /* Interação */
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.overview-card:hover {
  border-color: var(--azul-principal, #3b82f6);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px); /* Efeito sutil de "levantar" */
}

.card-icon {
  flex-shrink: 0; /* Impede que o ícone encolha */
  padding: 0.75rem;
  background-color: var(--azul-leve, #eff6ff); /* Fundo do ícone */
  border-radius: 8px;
  color: var(--azul-principal, #3b82f6); /* Cor do ícone */
}

.card-content {
  flex-grow: 1; /* Faz o conteúdo de texto ocupar o espaço restante */
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--preto, #111827);
}

.card-description {
  font-size: 0.875rem;
  color: var(--cinza-texto, #6b7280);
  line-height: 1.4;
}

.card-arrow {
  flex-shrink: 0;
  align-self: center; /* Centraliza a seta verticalmente */
  color: var(--cinza-texto-leve, #9ca3af);
  transition: color 0.2s ease;
}

.overview-card:hover .card-arrow {
  color: var(--azul-principal, #3b82f6);
}
</style>
