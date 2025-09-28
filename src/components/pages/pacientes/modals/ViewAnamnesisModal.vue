<script setup>
import { X } from 'lucide-vue-next';

const props = defineProps({
  anamnesis: { type: Object, required: true },
});
const emit = defineEmits(['close']);

function formatSimpleDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Função para encontrar o tipo da pergunta com base no título
function getQuestionType(questionTitle) {
  // Adiciona uma verificação para garantir que a lista de perguntas existe
  const questions = props.anamnesis.template?.questions || [];
  const question = questions.find(q => q.title === questionTitle);
  return question ? question.questionType : 'text';
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <div>
          <h2 class="title">{{ anamnesis.template.name }}</h2>
          <p class="subtitle">Respostas fornecidas em {{ formatSimpleDate(anamnesis.updatedAt) }}</p>
        </div>
        <button @click="$emit('close')" class="close-btn" title="Fechar">
          <X :size="24" />
        </button>
      </header>

      <div class="modal-body">
        <div v-for="answer in anamnesis.answers" :key="answer.questionTitle" class="answer-block">
          <label class="question-title">{{ answer.questionTitle }}</label>
          <div class="answer-field" :class="getQuestionType(answer.questionTitle)">
            <ul v-if="Array.isArray(answer.answer) && answer.answer.length > 0">
              <li v-for="item in answer.answer" :key="item">{{ item }}</li>
            </ul>
            <span v-else>{{ answer.answer || 'Não respondido' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(249, 250, 251, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: var(--branco);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.3s ease-out;
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.subtitle {
  color: var(--cinza-texto);
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
}
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}
.answer-block {
  margin-bottom: 1.5rem;
}
.answer-block:last-child {
  margin-bottom: 0;
}
.question-title {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--preto);
}
.answer-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-size: 1rem;
  color: #374151;
  min-height: 44px;
  display: flex;
  align-items: center;
  line-height: 1.6;
}
.answer-field.single_choice,
.answer-field.yes_no {
  justify-content: space-between;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7281' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1em 1em;
}
.answer-field.long_text {
  min-height: 120px;
  align-items: flex-start;
}
.answer-field.multiple_choice {
  padding: 0;
  background-color: transparent;
  border: none;
}
.answer-field ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.answer-field ul li {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>
