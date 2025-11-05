<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAnamnesisStore } from '@/stores/anamnesis'
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
} from 'lucide-vue-next' // Ícones adicionados
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  templateIdToEdit: { type: String, default: null },
  templateToDuplicate: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const anamnesisStore = useAnamnesisStore()
const toast = useToast()

const templateName = ref('')
const questions = ref([])
const openConditionalGroups = ref({}) // Novo: Para controlar o toggle UI

const isEditMode = computed(() => !!props.templateIdToEdit && !props.templateToDuplicate)

const questionTypes = [
  { value: 'text', label: 'Texto Curto' },
  { value: 'long_text', label: 'Texto Longo' },
  { value: 'yes_no', label: 'Sim / Não' },
  { value: 'single_choice', label: 'Múltipla Escolha (1 resposta)' },
  { value: 'multiple_choice', label: 'Múltipla Escolha (várias respostas)' },
]

// ✨ NOVO: Helper para gerar o qId
function generateQId() {
  // Gera um ID aleatório simples (Ex: "q_a98b2c1")
  return 'q_' + Math.random().toString(36).substring(2, 9)
}

// ✨ NOVO: Helper recursivo para processar perguntas (para duplicar/editar)
function processLoadedQuestions(questionArray) {
  if (!questionArray || questionArray.length === 0) {
    return []
  }

  return questionArray.map((q) => {
    // Garante um qId (seja do backend ou um novo para duplicação)
    const newQId = props.templateToDuplicate ? generateQId() : q.qId || generateQId()

    // Processa recursivamente as sub-perguntas
    const processedConditionalQuestions = (q.conditionalQuestions || []).map(
      (group) => {
        return {
          ...group,
          _tempId: Date.now() + Math.random(), // ID temporário para UI
          questions: processLoadedQuestions(group.questions || []), // Recursão
        }
      }
    )

    return {
      ...q,
      qId: newQId,
      _tempId: q._id || newQId, // ID temporário para o v-for
      options: q.options || [],
      conditionalQuestions: processedConditionalQuestions,
    }
  })
}

// ✨ onMounted ATUALIZADO (Usando os novos helpers) ✨
onMounted(async () => {
  console.log('Modal Montado.')

  try {
    if (props.templateToDuplicate) {
      // 1. MODO DUPLICAR
      console.log('Entrou em MODO DUPLICAR')
      templateName.value = `${props.templateToDuplicate.name} (Cópia)`
      // Processa as perguntas recursivamente para gerar novos qIds
      questions.value = processLoadedQuestions(props.templateToDuplicate.questions)
    } else if (isEditMode.value) {
      // 2. MODO EDIÇÃO
      console.log('Entrou em MODO EDIÇÃO', props.templateIdToEdit)
      const templateData = await anamnesisStore.fetchTemplateById(
        props.templateIdToEdit
      )
      if (templateData) {
        templateName.value = templateData.name
        // Processa as perguntas para garantir a estrutura local
        questions.value = processLoadedQuestions(templateData.questions)
      } else {
        toast.error('Não foi possível carregar o modelo para edição.')
        emit('close')
      }
    } else {
      // 3. MODO CRIAÇÃO
      console.log('Entrou em MODO CRIAÇÃO')
      // Adiciona uma primeira pergunta vazia
      addNewQuestion()
    }
  } catch (error) {
    console.error('Erro no onMounted do modal:', error)
    toast.error(
      error.response?.data?.message ||
        'Erro ao preparar o modal de anamnese.'
    )
    emit('close')
  }
})

function addNewQuestion() {
  questions.value.push({
    _tempId: Date.now(), // ID temporário para a UI (v-for key)
    qId: generateQId(), // ✨ NOVO: ID Único da Pergunta
    title: '',
    questionType: 'text',
    options: [],
    conditionalQuestions: [], // ✨ NOVO: Array para perguntas condicionais
  })
}

function removeQuestion(index) {
  questions.value.splice(index, 1)
}

function addOption(questionIndex) {
  questions.value[questionIndex].options.push('')
}

function removeOption(questionIndex, optionIndex) {
  questions.value[questionIndex].options.splice(optionIndex, 1)
}

// --- ✨ NOVAS FUNÇÕES PARA PERGUNTAS CONDICIONAIS ---

function addConditionalQuestionGroup(questionIndex) {
  const question = questions.value[questionIndex]
  if (!question.conditionalQuestions) {
    question.conditionalQuestions = []
  }

  // Define a primeira resposta possível como padrão
  let defaultCondition = ''
  if (question.questionType === 'yes_no') {
    defaultCondition = true // "Sim"
  } else if (question.questionType === 'single_choice' && question.options.length > 0) {
    defaultCondition = question.options[0]
  }

  const newGroup = {
    _tempId: Date.now(), // ID temporário para UI
    showWhenAnswerIs: defaultCondition,
    questions: [],
  }

  question.conditionalQuestions.push(newGroup)

  // Adiciona a primeira sub-pergunta automaticamente
  addConditionalQuestion(questionIndex, question.conditionalQuestions.length - 1)

  // Abre o toggle da UI
  toggleConditionalGroup(question._tempId)
}

function removeConditionalQuestionGroup(questionIndex, groupIndex) {
  questions.value[questionIndex].conditionalQuestions.splice(groupIndex, 1)
}

function addConditionalQuestion(questionIndex, groupIndex) {
  const group = questions.value[questionIndex].conditionalQuestions[groupIndex]
  if (!group.questions) {
    group.questions = []
  }
  group.questions.push({
    _tempId: Date.now(),
    qId: generateQId(), // ✨ NOVO: qId para sub-pergunta
    title: '',
    questionType: 'text',
    options: [],
    // Sub-perguntas (nível 2) não podem ter condicionais (por enquanto)
    conditionalQuestions: [],
  })
}

function removeConditionalQuestion(questionIndex, groupIndex, subQuestionIndex) {
  questions.value[questionIndex].conditionalQuestions[groupIndex].questions.splice(
    subQuestionIndex,
    1
  )
}

// ✨ NOVA FUNÇÃO (Adicionar Opção na Sub-Pergunta)
function addSubQuestionOption(questionIndex, groupIndex, subQuestionIndex) {
  const subQuestion =
    questions.value[questionIndex].conditionalQuestions[groupIndex].questions[
      subQuestionIndex
    ]
  if (!subQuestion.options) {
    subQuestion.options = []
  }
  subQuestion.options.push('')
}

// ✨ NOVA FUNÇÃO (Remover Opção na Sub-Pergunta)
function removeSubQuestionOption(
  questionIndex,
  groupIndex,
  subQuestionIndex,
  optionIndex
) {
  questions.value[questionIndex].conditionalQuestions[groupIndex].questions[
    subQuestionIndex
  ].options.splice(optionIndex, 1)
}

// Controla a UI para abrir/fechar o <details> de um grupo condicional
function toggleConditionalGroup(questionTempId) {
  openConditionalGroups.value[questionTempId] =
    !openConditionalGroups.value[questionTempId]
}

// Retorna as opções de resposta que podem disparar uma condição
function getConditionOptions(question) {
  if (question.questionType === 'yes_no') {
    return [
      { label: 'Sim', value: true },
      { label: 'Não', value: false },
    ]
  }
  if (question.questionType === 'single_choice') {
    return question.options.map((opt) => ({ label: opt, value: opt }))
  }
  return []
}

// --- FIM DAS NOVAS FUNÇÕES ---

// ✨ NOVO: Helper recursivo para limpar o payload antes de enviar
function cleanPayload(questionArray) {
  if (!questionArray) return []
  return questionArray.map((q) => {
    // Remove o _tempId e outras chaves temporárias da UI
    const { _tempId, ...questionData } = q

    // Limpa recursivamente as sub-perguntas
    const cleanedConditionalQuestions = (
      questionData.conditionalQuestions || []
    ).map((group) => {
      const { _tempId: groupTempId, ...groupData } = group
      return {
        ...groupData,
        questions: cleanPayload(groupData.questions || []), // Recursão
      }
    })

    return {
      ...questionData,
      conditionalQuestions: cleanedConditionalQuestions,
    }
  })
}

async function handleSubmit() {
  if (!templateName.value) {
    toast.error('Por favor, dê um nome ao modelo.')
    return
  }

  // ✨ ATUALIZADO: Limpa o payload usando o helper
  const preparedQuestions = cleanPayload(questions.value)

  const payload = {
    name: templateName.value,
    questions: preparedQuestions,
  }

  console.log('Payload final (limpo):', JSON.stringify(payload, null, 2))

  try {
    let response
    if (isEditMode.value) {
      // MODO EDIÇÃO
      response = await anamnesisStore.updateTemplate(
        props.templateIdToEdit,
        payload
      )
      toast.success(response.message || 'Modelo atualizado com sucesso!')
    } else {
      // MODO CRIAÇÃO (ou DUPLICAÇÃO)
      response = await anamnesisStore.createTemplate(payload)
      toast.success(response.message || 'Modelo criado com sucesso!')
    }
    emit('close')
  } catch (error) {
    console.error('Erro ao salvar o modelo:', error)
    toast.error(
      error.response?.data?.message || 'Não foi possível salvar o modelo.'
    )
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 v-if="isEditMode" class="modal-title">Editar Modelo de Anamnese</h3>
        <h3 v-else-if="props.templateToDuplicate" class="modal-title">
          Duplicar Modelo de Anamnese
        </h3>
        <h3 v-else class="modal-title">Criar Novo Modelo de Anamnese</h3>
        <button class="modal-close-btn" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <FormInput
          label="Nome do Modelo"
          v-model="templateName"
          placeholder="Ex: Anamnese Adulto Completa"
          required
        />

        <hr class="separator" />

        <div class="questions-list">
          <div
            v-for="(question, qIndex) in questions"
            :key="question._tempId"
            class="question-card"
          >
            <div class="question-header">
              <span class="question-number">{{ qIndex + 1 }}.</span>
              <div class="form-group-inline">
                <FormInput
                  label="Pergunta"
                  v-model="question.title"
                  placeholder="Ex: Você tem alguma alergia?"
                  class="question-title-input"
                />
                <StyledSelect
                  label="Tipo de Resposta"
                  v-model="question.questionType"
                  :options="questionTypes"
                  class="question-type-select"
                />
              </div>
              <button
                class="btn-icon btn-delete"
                @click="removeQuestion(qIndex)"
                title="Remover Pergunta"
              >
                <Trash2 :size="18" />
              </button>
            </div>

            <div
              v-if="
                question.questionType === 'single_choice' ||
                question.questionType === 'multiple_choice'
              "
              class="options-wrapper"
            >
              <label class="options-label">Opções de Resposta</label>
              <div
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="option-input-wrapper"
              >
                <FormInput
                  :label="`Opção ${oIndex + 1}`"
                  :hideLabel="true"
                  v-model="question.options[oIndex]"
                  placeholder="Digite o texto da opção"
                />
                <button
                  class="btn-icon btn-delete-option"
                  @click="removeOption(qIndex, oIndex)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
              <button class="add-option-btn" @click="addOption(qIndex)">
                <Plus :size="16" /> Adicionar Opção
              </button>
            </div>

            <div
              class="conditional-section"
              v-if="
                question.questionType === 'yes_no' ||
                question.questionType === 'single_choice'
              "
            >
              <button
                class="btn-toggle-conditional"
                @click="toggleConditionalGroup(question._tempId)"
              >
                <ChevronRight
                  :size="16"
                  v-if="!openConditionalGroups[question._tempId]"
                />
                <ChevronDown :size="16" v-else />
                Perguntas Condicionais
                <span
                  class="badge"
                  v-if="question.conditionalQuestions?.length > 0"
                >
                  {{ question.conditionalQuestions.length }}
                </span>
              </button>

              <div
                class="conditional-groups-wrapper"
                v-if="openConditionalGroups[question._tempId]"
              >
                <div
                  v-for="(group, gIndex) in question.conditionalQuestions"
                  :key="group._tempId"
                  class="conditional-group"
                >
                  <div class="group-header">
                    <span>
                      Mostrar perguntas SE a resposta for:
                    </span>
                    <StyledSelect
                      label="Condição"
                      :hideLabel="true"
                      v-model="group.showWhenAnswerIs"
                      :options="getConditionOptions(question)"
                      class="condition-select"
                    />
                    <button
                      class="btn-icon btn-delete-option"
                      @click="removeConditionalQuestionGroup(qIndex, gIndex)"
                      title="Remover Grupo Condicional"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>

                  <div class="sub-question-list">
                    <div
                      v-for="(subQuestion, sIndex) in group.questions"
                      :key="subQuestion._tempId"
                      class="sub-question-card"
                    >
                      <CornerDownRight :size="18" class="sub-q-icon" />

                      <div class="sub-question-content-wrapper">
                        <div class="form-group-inline">
                          <FormInput
                            label="Sub-Pergunta"
                            :hideLabel="true"
                            v-model="subQuestion.title"
                            placeholder="Ex: Quais alergias?"
                            class="question-title-input"
                          />
                          <StyledSelect
                            label="Tipo da Sub-Pergunta"
                            :hideLabel="true"
                            v-model="subQuestion.questionType"
                            :options="questionTypes"
                            class="question-type-select"
                          />
                        </div>

                        <div
                          v-if="
                            subQuestion.questionType === 'single_choice' ||
                            subQuestion.questionType === 'multiple_choice'
                          "
                          class="options-wrapper sub-options-wrapper"
                        >
                          <div
                            v-for="(option, oIndex) in subQuestion.options"
                            :key="oIndex"
                            class="option-input-wrapper"
                          >
                            <FormInput
                              :label="`Opção ${oIndex + 1}`"
                              :hideLabel="true"
                              v-model="subQuestion.options[oIndex]"
                              placeholder="Digite o texto da opção"
                            />
                            <button
                              class="btn-icon btn-delete-option"
                              @click="
                                removeSubQuestionOption(
                                  qIndex,
                                  gIndex,
                                  sIndex,
                                  oIndex
                                )
                              "
                            >
                              <Trash2 :size="16" />
                            </button>
                          </div>
                          <button
                            class="add-option-btn"
                            @click="
                              addSubQuestionOption(qIndex, gIndex, sIndex)
                            "
                          >
                            <Plus :size="16" /> Adicionar Opção
                          </button>
                        </div>
                      </div>
                      <button
                        class="btn-icon btn-delete"
                        @click="
                          removeConditionalQuestion(qIndex, gIndex, sIndex)
                        "
                        title="Remover Sub-Pergunta"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </div>
                  <button
                    class="add-option-btn add-sub-question"
                    @click="addConditionalQuestion(qIndex, gIndex)"
                  >
                    <Plus :size="16" /> Adicionar Sub-Pergunta
                  </button>
                </div>

                <button
                  class="add-group-btn"
                  @click="addConditionalQuestionGroup(qIndex)"
                >
                  <Plus :size="16" /> Adicionar Outra Condição
                </button>
              </div>
            </div>
            </div>
        </div>

        <button class="add-question-btn" @click="addNewQuestion">
          <Plus :size="20" />
          Adicionar Pergunta Principal
        </button>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          Cancelar
        </button>
        <button class="btn btn-primary" @click="handleSubmit">
          <span v-if="isEditMode">Salvar Alterações</span>
          <span v-else>Criar Modelo</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 95vh;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: var(--fonte-titulo);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--preto);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex-grow: 1;
}

.separator {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}
.question-card:focus-within {
  border-color: var(--azul-principal-leve);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.question-number {
  font-family: var(--fonte-titulo);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--azul-principal);
  padding-top: 0.75rem; /* Alinha com o input */
}

.form-group-inline {
  display: flex;
  flex-grow: 1;
  gap: 1rem;
  align-items: flex-end;
}
.question-title-input {
  flex-grow: 1;
}
.question-type-select {
  width: 220px;
  flex-shrink: 0;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--cinza-texto);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  margin-top: 1.75rem; /* Alinha com botões */
}
.btn-icon:hover {
  background-color: #f3f4f6;
  color: var(--preto);
}
.btn-icon.btn-delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}
.btn-icon.btn-delete-option {
  color: #9ca3af;
  margin-top: 0;
  padding: 0.25rem;
}
.btn-icon.btn-delete-option:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.options-wrapper {
  padding-left: 2.5rem;
  margin-top: 1rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}
.options-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}
.option-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.option-input-wrapper .form-group {
  flex-grow: 1;
  margin-bottom: 0.5rem;
}

.add-option-btn {
  background: none;
  border: none;
  color: var(--azul-principal);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  padding: 0.25rem;
}

.add-question-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
}
.add-question-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: #f9fafb;
}

/* --- ✨ NOVOS ESTILOS CONDICIONAIS --- */
.conditional-section {
  padding-left: 2.5rem;
  margin-top: 1rem;
}

.btn-toggle-conditional {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: var(--cinza-texto);
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
.btn-toggle-conditional:hover {
  background-color: #f3f4f6;
  color: var(--preto);
}
.badge {
  background-color: #e0e7ff;
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
  margin-left: 0.25rem;
}

.conditional-groups-wrapper {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.conditional-group {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
}
.condition-select {
  width: 150px;
  flex-shrink: 0;
}
.group-header .btn-icon {
  margin-top: 0;
  margin-left: auto;
}

.sub-question-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.sub-question-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.sub-q-icon {
  color: #9ca3af;
  flex-shrink: 0;
  margin-top: 0.85rem;
}
.sub-question-card .form-group-inline {
  align-items: flex-start;
}
.sub-question-card .btn-icon {
  margin-top: 0.5rem;
}

/* --- ✨ NOVOS ESTILOS PARA CORREÇÃO (OPÇÕES EM SUB-PERGUNTAS) --- */
.sub-question-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.sub-options-wrapper {
  /* Remove o padding-left e margin-top excessivo do .options-wrapper principal */
  padding-left: 0;
  margin-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
}
/* --- FIM DOS NOVOS ESTILOS --- */


.add-sub-question {
  margin-top: 1rem;
  padding-left: 0.5rem;
}

.add-group-btn {
  background: none;
  border: 1px dashed #d1d5db;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  align-self: flex-start;
}
.add-group-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
</style>
