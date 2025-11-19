<script setup>
import { ref, computed } from 'vue'
import { Search, ChevronDown, Mail, LifeBuoy } from 'lucide-vue-next'

const searchQuery = ref('')
const openQuestionId = ref(null)

const faqs = ref([
  {
    category: 'Gerenciamento de Pacientes',
    items: [
      {
        id: 'p1',
        question: 'Como faço para cadastrar um novo paciente?',
        answer:
          'Para cadastrar um novo paciente, vá para a seção "Pacientes" no menu lateral e clique no botão "Adicionar Paciente". Preencha os dados necessários e salve.',
      },
      {
        id: 'p2',
        question: 'É possível editar as informações de um paciente?',
        answer:
          'Sim. Acesse a lista de pacientes, clique no paciente desejado para abrir seu perfil e, em seguida, clique no botão "Editar Paciente".',
      },
    ],
  },
  {
    category: 'Agenda e Atendimentos',
    items: [
      {
        id: 'a1',
        question: 'Como marcar um novo atendimento?',
        answer:
          'Você pode marcar um novo atendimento diretamente da tela de "Calendário" ou da tela de "Atendimentos", clicando no botão "Agendar Atendimento". Uma janela modal se abrirá para que você preencha os detalhes.',
      },
      {
        id: 'a2',
        question: 'Como funcionam os lembretes automáticos de consulta?',
        answer:
          'Os lembretes são enviados via WhatsApp para o paciente 1 dia antes e 2 horas antes do horário agendado. Você pode ativar ou desativar essa opção ao criar ou editar um agendamento.',
      },
      {
        id: 'a3',
        question: 'Onde registro as informações do atendimento (prontuário)?',
        answer:
          'Na tela de "Atendimentos", encontre o agendamento do dia e clique em "Iniciar Atendimento". Isso levará você à tela de registro clínico, onde você pode preencher o prontuário eletrônico do paciente.',
      },
    ],
  },
  {
    category: 'Configurações da Clínica',
    items: [
      {
        id: 'c1',
        question: 'Como altero o horário de funcionamento da clínica?',
        answer:
          'Vá para "Configurações" no menu lateral e selecione a aba "Horário de Funcionamento". Lá você pode ajustar os dias e horários em que a clínica está aberta.',
      },
    ],
  },
])

const filteredFaqs = computed(() => {
  if (!searchQuery.value) {
    return faqs.value
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  const filtered = []
  faqs.value.forEach((category) => {
    const matchingItems = category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(lowerCaseQuery) ||
        item.answer.toLowerCase().includes(lowerCaseQuery),
    )
    if (matchingItems.length > 0) {
      filtered.push({ ...category, items: matchingItems })
    }
  })
  return filtered
})

function toggleQuestion(id) {
  openQuestionId.value = openQuestionId.value === id ? null : id
}
</script>

<template>
  <div class="help-page">
    <aside class="help-sidebar">
      <div class="sidebar-content">
        <div class="icon-wrapper">
          <LifeBuoy :size="32" />
        </div>
        <h1 class="title">Central de Ajuda</h1>
        <p class="subtitle">Encontre respostas para as suas dúvidas mais comuns.</p>
        <div class="search-bar">
          <Search :size="18" class="search-icon" />
          <input type="text" v-model="searchQuery" placeholder="Pesquisar..." />
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div class="faq-section">
        <div v-if="filteredFaqs.length === 0" class="no-results">
          <h3>Nenhum resultado encontrado para "{{ searchQuery }}"</h3>
          <p>Tente pesquisar com outros termos ou verifique a ortografia.</p>
        </div>
        <div v-for="category in filteredFaqs" :key="category.category" class="faq-category">
          <h2 class="category-title">{{ category.category }}</h2>
          <div class="faq-list">
            <div v-for="item in category.items" :key="item.id" class="faq-item">
              <button class="faq-question" @click="toggleQuestion(item.id)">
                <span>{{ item.question }}</span>
                <ChevronDown class="chevron-icon" :class="{ 'is-open': openQuestionId === item.id }" />
              </button>
              <div v-if="openQuestionId === item.id" class="faq-answer" v-auto-animate>
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="support-card">
        <h3 class="support-title">Não encontrou o que precisava?</h3>
        <p class="support-text">Nossa equipe de suporte está pronta para te ajudar.</p>
        <a href="mailto:suporte@clinicacrm.com" class="support-button">
          <Mail :size="16" />
          Enviar um E-mail
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped>
.help-page {
  display: flex;
}

.help-sidebar {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  padding-right: 3rem;
}
.sidebar-content {
  position: sticky;
  top: 2rem;
  text-align: left;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  background-color: #eef2ff;
  color: var(--azul-principal);
  margin-bottom: 1.5rem;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1rem;
  color: var(--cinza-texto);
  margin: 0 0 2rem 0;
}
.search-bar {
  position: relative;
  width: 100%;
  margin: 0;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: var(--cinza-texto);
}
.search-bar input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.search-bar input:focus {
  outline: none;
  background-color: var(--branco);
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.main-content {
  flex-grow: 1;
  min-width: 0;
  padding-left: 3rem;
}

.faq-section {
  padding-bottom: 3rem;
}

.faq-category {
  margin-bottom: 2.5rem;
}
.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: var(--branco);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}
.faq-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
}
.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}
.chevron-icon {
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 1rem;
  color: var(--cinza-texto);
}
.chevron-icon.is-open {
  transform: rotate(180deg);
}
.faq-answer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: var(--cinza-texto);
  line-height: 1.7;
}
.faq-answer p {
  margin: 0;
}
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9fafb;
  border-radius: 1rem;
  color: var(--cinza-texto);
}
.no-results h3 {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  color: #374151;
}

.support-card {
  background-color: #f3f4f6;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.support-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.support-text {
  color: var(--cinza-texto);
  margin-bottom: 1.5rem;
}
.support-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 250px;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.support-button:hover {
  background-color: var(--azul-escuro);
}

@media (max-width: 1024px) {
  .help-page {
    flex-direction: column;
  }
  .icon-wrapper {
    margin: 0 auto;
    margin-bottom: 20px;
  }
  .help-sidebar {
    width: 100%;
    border-right: none;
    padding-right: 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .sidebar-content {
    position: static;
    text-align: center;
    padding-bottom: 2rem;
  }
  .sidebar-content .subtitle,
  .sidebar-content .search-bar {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .main-content {
    padding-left: 0;
  }
  .support-card {
    margin-top: 2rem;
  }
}
</style>
