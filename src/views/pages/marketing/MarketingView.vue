<script setup>
import {
  MessageSquare,
  LayoutTemplate,
  Link,
  History,
  ArrowRight
} from 'lucide-vue-next'

// Definição dos cartões do dashboard.
// Cada objeto representa um card no grid e aponta para uma rota nomeada.
const dashboardCards = [
  {
    id: 'mensagens',
    label: 'Mensagens Automáticas',
    description: 'Configure e gerencie os lembretes de consulta.',
    icon: MessageSquare,
    name: 'marketing-mensagens' // Rota nomeada definida em dashboard.js
  },
  {
    id: 'modelos',
    label: 'Modelos de Mensagem',
    description: 'Crie e edite os textos padrão para envio.',
    icon: LayoutTemplate,
    name: 'marketing-modelos' // Rota nomeada definida em dashboard.js
  },
  {
    id: 'conexao',
    label: 'Conexão',
    description: 'Gerencie o status da sua conexão com o WhatsApp.',
    icon: Link,
    name: 'marketing-conexao' // Rota nomeada definida em dashboard.js
  },
  {
    id: 'logs',
    label: 'Histórico de Envios',
    description: 'Visualize todos os envios, sucessos e falhas.',
    icon: History,
    name: 'marketing-logs' // Rota nomeada definida em dashboard.js
  }
  // 💡 Futuramente, novos cards (ex: Aniversariantes) podem ser adicionados aqui.
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
        :to="{ name: card.name }"
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
/* Estilos para o cabeçalho da página */
.page-header {
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--preto); /* Garante cor escura para o título */
}
.subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto); /* Cor padrão para subtítulos */
}

/* Estilos para o grid de cartões do dashboard */
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

/* Estilos para cada cartão de navegação */
.overview-card {
  /* Layout interno do card */
  display: flex;
  align-items: flex-start; /* Alinha o ícone e o texto no topo */
  gap: 1.5rem; /* Espaço entre ícone, texto e seta */

  /* Aparência do card */
  padding: 1.5rem;
  background-color: var(--branco, #fff);
  border: 1px solid var(--cinza-borda-leve, #e5e7eb);
  border-radius: 12px;
  box-shadow: var(--shadow-sm); /* Sombra suave */

  /* Interação */
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.overview-card:hover {
  border-color: var(--azul-principal, #3b82f6);
  box-shadow: var(--shadow-md); /* Sombra mais forte no hover */
  transform: translateY(-2px); /* Efeito sutil de "levantar" */
}

/* Círculo de fundo do ícone */
.card-icon {
  flex-shrink: 0; /* Impede que o ícone encolha */
  padding: 0.75rem;
  background-color: var(--azul-leve, #eff6ff); /* Fundo azul claro */
  border-radius: 8px;
  color: var(--azul-principal, #3b82f6); /* Cor do ícone */
}

/* Bloco de texto (título e descrição) */
.card-content {
  flex-grow: 1; /* Faz o conteúdo de texto ocupar o espaço restante */
}

.card-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--preto, #111827);
}

.card-description {
  font-size: 0.875rem; /* 14px */
  color: var(--cinza-texto, #6b7280);
  line-height: 1.4; /* Melhora a legibilidade */
}

/* Seta no final do card */
.card-arrow {
  flex-shrink: 0;
  align-self: center; /* Centraliza a seta verticalmente */
  color: var(--cinza-texto-leve, #9ca3af);
  transition: color 0.2s ease;
}

.overview-card:hover .card-arrow {
  color: var(--azul-principal, #3b82f6); /* Seta fica azul no hover */
}
</style>
