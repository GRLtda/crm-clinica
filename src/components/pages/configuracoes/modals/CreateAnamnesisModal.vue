<script setup>
import { ref } from 'vue';
import { useAnamnesisStore } from '@/stores/anamnesis';
import { Plus, Trash2 } from 'lucide-vue-next';
import FormInput from '@/components/global/FormInput.vue';
import StyledSelect from '@/components/global/StyledSelect.vue';

const emit = defineEmits(['close']);
const anamnesisStore = useAnamnesisStore();

const templateName = ref('');
const questions = ref([]);

const questionTypes = [
  { value: 'text', label: 'Texto Curto' },
  { value: 'long_text', label: 'Texto Longo' },
  { value: 'yes_no', label: 'Sim / Não' },
  { value: 'single_choice', label: 'Múltipla Escolha (1 resposta)' },
  { value: 'multiple_choice', label: 'Múltipla Escolha (várias respostas)' },
];

function addQuestion() {
  questions.value.push({
    title: '',
    questionType: 'text',
    options: [],
  });
}

function removeQuestion(index) {
  questions.value.splice(index, 1);
}

function addOption(question) {
  question.options.push('');
}

function removeOption(question, optIndex) {
  question.options.splice(optIndex, 1);
}

async function saveTemplate() {
  const templateData = {
    name: templateName.value,
    questions: questions.value,
  };
  // A chamada da função acontece aqui
  const { success } = await anamnesisStore.createTemplate(templateData);
  if (success) {
    emit('close');
  }
}
</script>
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Criar Novo Modelo de Anamnese</h2>
        <p>Construa um formulário personalizado para suas consultas.</p>
      </header>

      <div class="form-body">
        <FormInput v-model="templateName" label="Nome do Modelo" placeholder="Ex: Anamnese Pediátrica" />

        <div v-for="(question, index) in questions" :key="index" class="question-card">
          <FormInput v-model="question.title" :label="`Pergunta ${index + 1}`" placeholder="Digite o título da pergunta" />

          <div class="question-type-selector">
            <label>Tipo de Resposta</label>
            <StyledSelect v-model="question.questionType" :options="questionTypes" />
          </div>

          <div v-if="['single_choice', 'multiple_choice'].includes(question.questionType)" class="options-section">
            <label>Opções de Resposta</label>
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-input-wrapper">
              <FormInput v-model="question.options[optIndex]" :placeholder="`Opção ${optIndex + 1}`" />
              <button @click="removeOption(question, optIndex)" type="button" class="delete-option-btn"><Trash2 :size="16"/></button>
            </div>
            <button @click="addOption(question)" type="button" class="add-option-btn"><Plus :size="16"/> Adicionar Opção</button>
          </div>

          <button @click="removeQuestion(index)" type="button" class="delete-question-btn"><Trash2 :size="16"/></button>
        </div>

        <button @click="addQuestion" type="button" class="add-question-btn"><Plus :size="16" /> Adicionar Pergunta</button>
      </div>

      <footer class="modal-footer">
        <button @click="$emit('close')" type="button" class="btn-secondary">Cancelar</button>
        <button @click="saveTemplate" type="button" class="btn-primary">Salvar Modelo</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(249, 250, 251, 0.7); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background: var(--branco); width: 90%; max-width: 800px; height: 90vh; border-radius: 1rem; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
h2 { font-size: 1.25rem; }
p { color: var(--cinza-texto); }
.form-body { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
.question-card { position: relative; border: 1px solid #e5e7eb; padding: 1.5rem; border-radius: 0.75rem; margin-top: 1.5rem; background-color: #f9fafb; }
.delete-question-btn { position: absolute; top: 0.5rem; right: 0.5rem; color: var(--cinza-texto); cursor: pointer; background: none; border: none; }
.question-type-selector { margin-top: 1rem; text-align: left; }
.question-type-selector label, .options-section label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
.options-section { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
.option-input-wrapper { display: flex; align-items: center; gap: 0.5rem; }
.option-input-wrapper .form-group { flex-grow: 1; margin-bottom: 0.5rem; }
.delete-option-btn { color: #ef4444; cursor: pointer; background: none; border: none; }
.add-option-btn { background: none; border: none; color: var(--azul-principal); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem; }
.add-question-btn { width: 100%; padding: 0.75rem; margin-top: 1.5rem; border-radius: 0.5rem; background: #f9fafb; border: 1px dashed #d1d5db; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; color: #374151; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 1rem; background-color: #f9fafb; }
.btn-primary { background: var(--azul-principal); color: var(--branco); border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.btn-secondary { background: var(--branco); border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
</style>
