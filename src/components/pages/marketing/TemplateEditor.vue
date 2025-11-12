<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCrmTemplatesStore } from '@/stores/crmTemplates'
import { ArrowLeft, Eye, Info } from 'lucide-vue-next'
import FormInput from '@/components/global/FormInput.vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  templateId: { type: String, default: null },
})
const emit = defineEmits(['close', 'save'])

const templatesStore = useCrmTemplatesStore()
const toast = useToast()

const templateName = ref('')
const templateContent = ref('')
const templateTags = ref('')
const editorError = ref(null)
const isLoading = ref(false)
const activeInfoTab = ref('variables')

const isEditMode = computed(() => !!props.templateId)
const availableVariables = computed(() => templatesStore.availableVariables)

// Regex para encontrar as variáveis no texto
const variableRegex = /({[a-zA-Z_]+})/g

// Computado para destacar variáveis no preview
const formattedPreview = computed(() => {
  let html = templateContent.value || ''

  // Escapa HTML básico para segurança no preview
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Aplica formatação básica do WhatsApp (negrito, itálico, riscado)
  html = html.replace(/\*(.*?)\*/g, '<b>$1</b>') // Negrito (*)
  html = html.replace(/_(.*?)_/g, '<i>$1</i>') // Itálico (_)
  html = html.replace(/~(.*?)~/g, '<s>$1</s>') // Riscado (~)
  // Monospace (` ` `) é mais complexo, pode ser adicionado depois

  // Destaca as variáveis
  html = html.replace(variableRegex, '<span class="variable-highlight">$1</span>')

  // Substitui quebras de linha por <br> para o HTML
  return html.replace(/\n/g, '<br>')
})

// Carrega dados do template se estiver editando
onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true
    const { success, data } = await templatesStore.getTemplateById(props.templateId)
    if (success && data) {
      templateName.value = data.name
      templateContent.value = data.content
      templateTags.value = Array.isArray(data.tags) ? data.tags.join(', ') : ''
    } else {
      toast.error('Não foi possível carregar o modelo para edição.')
      emit('close') // Fecha se não conseguir carregar
    }
    isLoading.value = false
  }
  // Garante que as variáveis estejam carregadas (ou usa fallback)
  if (templatesStore.availableVariables.length <= 6) {
    // Heurística simples
    templatesStore.fetchVariables()
  }
})

function insertVariable(variable) {
  // Idealmente, isso inseriria a variável na posição do cursor do textarea
  templateContent.value += variable
}

async function handleSave() {
  editorError.value = null
  if (!templateName.value || !templateContent.value) {
    editorError.value = 'O nome e o conteúdo do modelo são obrigatórios.'
    toast.error(editorError.value)
    return
  }

  const payload = {
    name: templateName.value,
    content: templateContent.value,
    tags: templateTags.value
      ? templateTags.value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  }

  let success = false
  if (isEditMode.value) {
    const result = await templatesStore.updateTemplate(props.templateId, payload)
    success = result.success
  } else {
    const result = await templatesStore.createTemplate(payload)
    success = result.success
  }

  if (success) {
    emit('save') // Emite evento para o pai (TemplatesTab) fechar
  }
  // O toast de sucesso/erro já é mostrado pela store
}
</script>

<template>
  <div class="template-editor">
    <div class="editor-header">
      <button @click="$emit('close')" class="back-button">
        <ArrowLeft :size="20" /> Voltar para Lista
      </button>
      <h2>{{ isEditMode ? 'Editar Modelo' : 'Criar Novo Modelo' }}</h2>
    </div>

    <div v-if="isLoading" class="loading-state">Carregando dados do modelo...</div>

    <div v-else class="editor-grid">
      <div class="editor-column config-column">
        <FormInput
          v-model="templateName"
          label="Nome do Modelo *"
          placeholder="Ex: Lembrete Consulta 24h"
          required
        />

        <div class="form-group">
          <label class="form-label">Conteúdo da Mensagem *</label>
          <textarea
            v-model="templateContent"
            placeholder="Digite sua mensagem aqui... Use *negrito*, _itálico_ ou ~riscado~. Insira variáveis usando a aba ao lado."
            rows="10"
            class="message-textarea"
          ></textarea>
        </div>

        <FormInput
          v-model="templateTags"
          label="Tags (separadas por vírgula)"
          placeholder="Ex: Lembrete, Consulta, Agendamento"
        />

        <div class="info-tabs">
          <div class="info-tab-buttons">
            <button
              :class="{ active: activeInfoTab === 'variables' }"
              @click="activeInfoTab = 'variables'"
            >
              Variáveis
            </button>
            <button
              :class="{ active: activeInfoTab === 'formatting' }"
              @click="activeInfoTab = 'formatting'"
            >
              Formatação
            </button>
          </div>
          <div class="info-tab-content">
            <div v-if="activeInfoTab === 'variables'">
              <p class="info-text">Clique para inserir uma variável no texto:</p>
              <ul class="variables-list">
                <li
                  v-for="v in availableVariables"
                  :key="v.variable"
                  @click="insertVariable(v.variable)"
                >
                  <code>{{ v.variable }}</code> - {{ v.description }}
                </li>
              </ul>
            </div>
            <div v-if="activeInfoTab === 'formatting'">
              <p class="info-text">Use os seguintes caracteres para formatar:</p>
              <ul class="formatting-list">
                <li><code>*texto*</code> para <b>negrito</b></li>
                <li><code>_texto_</code> para <i>itálico</i></li>
                <li><code>~texto~</code> para <s>riscado</s></li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="editorError" class="error-message">{{ editorError }}</div>

        <div class="editor-actions">
          <button @click="$emit('close')" type="button" class="btn-secondary">Cancelar</button>
          <button
            @click="handleSave"
            type="button"
            class="btn-primary"
            :disabled="templatesStore.isLoading"
          >
            {{
              templatesStore.isLoading
                ? 'Salvando...'
                : isEditMode
                  ? 'Salvar Alterações'
                  : 'Salvar Modelo'
            }}
          </button>
        </div>
      </div>

      <div class="editor-column preview-column">
        <div class="preview-header"><Eye :size="16" /> Pré-visualização (WhatsApp)</div>
        <div class="preview-box">
          <div v-if="templateContent" class="whatsapp-bubble" v-html="formattedPreview"></div>
          <div v-else class="preview-placeholder">A pré-visualização aparecerá aqui.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-editor {
  padding: 1.5rem;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  margin-bottom: 2rem; /* Espaço abaixo do editor */
  animation: slide-in 0.3s ease-out;
}
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}
.back-button {
  background: none;
  border: 1px solid #e5e7eb;
  color: var(--cinza-texto);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}
.back-button:hover {
  background-color: #f9fafb;
}
.editor-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}
.loading-state {
  text-align: center;
  color: var(--cinza-texto);
  padding: 2rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.editor-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Espaço entre os elementos da coluna */
}

.form-group {
  text-align: left;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}
.message-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical; /* Permite redimensionar verticalmente */
}
.message-textarea:focus {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.info-tabs {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}
.info-tab-buttons {
  display: flex;
  background-color: #f9fafb;
}
.info-tab-buttons button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--cinza-texto);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}
.info-tab-buttons button.active {
  color: var(--azul-principal);
  border-bottom-color: var(--azul-principal);
  background-color: var(--branco);
}
.info-tab-content {
  padding: 1rem;
  background-color: var(--branco);
  max-height: 150px;
  overflow-y: auto;
}
.info-text {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  margin-bottom: 0.75rem;
}
.variables-list,
.formatting-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}
.variables-list li {
  padding: 0.3rem 0;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}
.variables-list li:hover {
  background-color: #f3f4f6;
}
.variables-list code,
.formatting-list code {
  font-family: monospace;
  background-color: #eef2ff;
  color: var(--azul-principal);
  padding: 0.1em 0.4em;
  border-radius: 0.25rem;
  font-weight: bold;
}
.formatting-list li {
  margin-bottom: 0.3rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem; /* Adiciona espaço acima dos botões */
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}
.btn-primary {
  background: var(--azul-principal);
  color: var(--branco);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-secondary {
  background: var(--branco);
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

/* Coluna de Preview */
.preview-column {
  background-color: #f9fafb; /* Fundo levemente diferente */
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}
.preview-header {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.preview-header svg {
  color: var(--cinza-texto);
}
.preview-box {
  background-color: #e5ddd5; /* Cor de fundo similar ao WhatsApp */
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAEKCAYAAAD1zPHHAAABUklEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgZA3sAASUizRMAAAAASUVORK5CYII='); /* Adicionar textura sutil se desejar */
  border-radius: 0.75rem;
  padding: 1rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinha balões à esquerda */
}
.whatsapp-bubble {
  background-color: #dcf8c6; /* Verde claro do balão do WhatsApp */
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border-top-left-radius: 0; /* Canto do balão */
  max-width: 80%;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 0.9rem;
  color: #303030; /* Cor do texto no WhatsApp */
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}
/* Estilo para destacar variáveis no preview */
.whatsapp-bubble :deep(.variable-highlight) {
  color: #005fff; /* Azul para variáveis */
  font-weight: bold;
  background-color: rgba(0, 95, 255, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

/* Estilo para formatação básica */
.whatsapp-bubble :deep(b) {
  font-weight: bold;
}
.whatsapp-bubble :deep(i) {
  font-style: italic;
}
.whatsapp-bubble :deep(s) {
  text-decoration: line-through;
}
.whatsapp-bubble :deep(tt) {
  font-family: monospace;
} /* Para ``` (precisa de regex melhor) */

.preview-placeholder {
  color: var(--cinza-texto);
  font-style: italic;
  margin: auto; /* Centraliza vertical e horizontalmente */
}

/* Responsivo */
@media (max-width: 900px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
  .preview-column {
    order: -1; /* Coloca o preview em cima no mobile */
  }
}
@media (max-width: 768px) {
  .template-editor {
    padding: 1rem;
  }
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }
  .editor-header h2 {
    font-size: 1.25rem;
  }
  .editor-grid {
    gap: 1.5rem;
  }
  .editor-column {
    gap: 1rem;
  }
  .editor-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  .editor-actions button {
    width: 100%;
    justify-content: center;
  }
}
</style>
