<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAnamnesisStore } from '@/stores/anamnesis'
import { useToast } from 'vue-toastification'
import confetti from 'canvas-confetti'
import { CheckCircle2, AlertTriangle, Building } from 'lucide-vue-next'

const route = useRoute()
const anamnesisStore = useAnamnesisStore()
const toast = useToast()

const responseData = ref(null)
const answers = ref([])
const submissionStatus = ref('pending') // pending, success, error
const validationErrors = ref({}) // ✨ Armazena os erros de validação

onMounted(async () => {
  const token = route.params.token
  const storageKey = `anamnesis-answers-${token}` // Chave única para o localStorage

  const { success } = await anamnesisStore.fetchPublicTemplate(token)

  if (success && anamnesisStore.publicTemplate) {
    responseData.value = anamnesisStore.publicTemplate
    const questions = responseData.value.template?.questions

    if (Array.isArray(questions)) {
      // 1. Inicializa a estrutura do formulário com base nas perguntas
      answers.value = questions.map((q) => ({
        questionTitle: q.title,
        answer: q.questionType === 'multiple_choice' ? [] : '',
      }))

      // 2. Tenta carregar as respostas salvas do localStorage
      const savedAnswersRaw = localStorage.getItem(storageKey)
      if (savedAnswersRaw) {
        try {
          const savedAnswers = JSON.parse(savedAnswersRaw)
          if (Array.isArray(savedAnswers)) {
            // 3. Mescla as respostas salvas com a estrutura do formulário
            answers.value.forEach((answerItem, index) => {
              const savedItem = savedAnswers.find(
                (sa) => sa.questionTitle === answerItem.questionTitle,
              )
              if (savedItem) {
                answers.value[index].answer = savedItem.answer
              }
            })
            toast.info('Seu progresso anterior foi restaurado!')
          }
        } catch (e) {
          console.error('Falha ao carregar respostas do localStorage:', e)
          localStorage.removeItem(storageKey) // Limpa dados corrompidos
        }
      }
    } else {
      submissionStatus.value = 'error'
    }
  } else {
    submissionStatus.value = 'error'
  }
})

// Observa por mudanças nas respostas e salva no localStorage
watch(
  answers,
  (newAnswers) => {
    if (responseData.value && submissionStatus.value === 'pending') {
      const token = route.params.token
      const storageKey = `anamnesis-answers-${token}`
      localStorage.setItem(storageKey, JSON.stringify(newAnswers))

      // Limpa o erro de um campo assim que ele é preenchido
      newAnswers.forEach((answer) => {
        if (
          (Array.isArray(answer.answer) ? answer.answer.length > 0 : !!answer.answer) &&
          validationErrors.value[answer.questionTitle]
        ) {
          delete validationErrors.value[answer.questionTitle]
        }
      })
    }
  },
  { deep: true },
)

watch(submissionStatus, (newStatus) => {
  if (newStatus === 'success') {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      zIndex: 9999,
    })
  }
})

// ✨ FUNÇÃO DE VALIDAÇÃO ✨
function validateForm() {
  validationErrors.value = {}
  answers.value.forEach((answer) => {
    const isAnswerEmpty = Array.isArray(answer.answer)
      ? answer.answer.length === 0
      : !answer.answer
    if (isAnswerEmpty) {
      validationErrors.value[answer.questionTitle] = true
    }
  })
  return Object.keys(validationErrors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    toast.error('Por favor, responda todas as perguntas antes de enviar.')
    return
  }

  const token = route.params.token
  const storageKey = `anamnesis-answers-${token}`

  const { success } = await anamnesisStore.submitPatientAnswers(token, answers.value)
  if (success) {
    localStorage.removeItem(storageKey)
    submissionStatus.value = 'success'
  } else {
    toast.error('Ocorreu um erro ao enviar suas respostas.')
  }
}
</script>

<template>
  <div class="anamnesis-page">
    <div v-if="submissionStatus === 'success'" class="card success-card">
      <CheckCircle2 class="success-icon" :size="64" />
      <h2 class="success-title">Obrigado!</h2>
      <p class="success-message">
        Suas respostas foram enviadas com sucesso
        <span v-if="responseData?.clinicInfo?.name"
          >para a <strong>{{ responseData.clinicInfo.name }}</strong></span
        >.
      </p>
      <p class="success-footer">Você já pode fechar esta página.</p>
    </div>

    <div v-else-if="submissionStatus === 'error'" class="card error-card">
      <AlertTriangle class="error-icon" :size="64" />
      <h2 class="error-title">Link Inválido ou Expirado</h2>
      <p class="error-message">
        Não foi possível carregar o formulário. Por favor, entre em contato com a clínica para
        solicitar um novo link.
      </p>
    </div>

    <template v-else-if="responseData">
      <header class="page-header">
        <div class="clinic-branding">
          <img
            v-if="responseData.clinicInfo?.logoUrl"
            :src="responseData.clinicInfo.logoUrl"
            alt="Logo da clínica"
            class="clinic-logo"
          />
          <div v-else class="clinic-logo-placeholder">
            <Building :size="24" />
          </div>
          <span class="clinic-name">{{ responseData.clinicInfo.name }}</span>
        </div>
      </header>

      <main class="main-content">
        <div class="card">
          <div v-if="responseData.patientInfo" class="patient-info-header">
            <div class="patient-avatar">
              {{ responseData.patientInfo.name.charAt(0) }}
            </div>
            <div class="patient-details">
              <h2 class="patient-name">{{ responseData.patientInfo.name }}</h2>
              <div class="patient-meta">
                <span>{{ responseData.patientInfo.gender }}</span>
                <span v-if="responseData.patientInfo.cpf"
                  >CPF: {{ responseData.patientInfo.cpf }}.***.***-**</span
                >
              </div>
            </div>
          </div>

          <header class="form-header">
            <h1>{{ responseData.template.name }}</h1>
            <p>
              Preencha o formulário abaixo com atenção. Suas respostas são confidenciais e
              importantes para o seu atendimento.
            </p>
          </header>

          <form @submit.prevent="handleSubmit">
            <div
              v-for="(question, index) in responseData.template.questions"
              :key="question.title"
              class="question-block"
              :class="{ 'has-error': validationErrors[question.title] }"
            >
              <label class="question-title"
                ><span>{{ index + 1 }}.</span> {{ question.title }}</label
              >

              <input
                v-if="question.questionType === 'text'"
                type="text"
                v-model="answers[index].answer"
                class="form-input"
              />
              <textarea
                v-if="question.questionType === 'long_text'"
                v-model="answers[index].answer"
                class="form-textarea"
              ></textarea>

              <div v-if="question.questionType === 'yes_no'" class="choice-group">
                <div class="choice-item">
                  <input
                    type="radio"
                    :id="`q-${index}-sim`"
                    value="Sim"
                    v-model="answers[index].answer"
                  />
                  <label :for="`q-${index}-sim`">Sim</label>
                </div>
                <div class="choice-item">
                  <input
                    type="radio"
                    :id="`q-${index}-nao`"
                    value="Não"
                    v-model="answers[index].answer"
                  />
                  <label :for="`q-${index}-nao`">Não</label>
                </div>
              </div>

              <div v-if="question.questionType === 'single_choice'" class="choice-group">
                <div v-for="option in question.options" :key="option" class="choice-item">
                  <input
                    type="radio"
                    :id="`q-${index}-${option}`"
                    :value="option"
                    v-model="answers[index].answer"
                  />
                  <label :for="`q-${index}-${option}`">{{ option }}</label>
                </div>
              </div>

              <div v-if="question.questionType === 'multiple_choice'" class="choice-group">
                <div v-for="option in question.options" :key="option" class="choice-item">
                  <input
                    type="checkbox"
                    :id="`q-${index}-${option}`"
                    :value="option"
                    v-model="answers[index].answer"
                  />
                  <label :for="`q-${index}-${option}`">{{ option }}</label>
                </div>
              </div>
            </div>
            <button type="submit" class="submit-button">Enviar Respostas</button>
          </form>
        </div>
      </main>
      <footer class="page-footer">
        <p>Plataforma segura por <strong>ClínicaCRM</strong></p>
      </footer>
    </template>
    <div v-else>
      <p>Carregando formulário...</p>
    </div>
  </div>
</template>

<style scoped>
.anamnesis-page {
  display: flex;
  justify-items: center;
  flex-direction: column;
  align-items: center;
  background-color: #f9fafb;
  min-height: 100vh;
}
.page-header {
  padding: 1rem 2rem;
  width: 100%;
  background-color: var(--branco);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}
.main-content {
  padding: 2rem;
}
.page-footer {
  text-align: center;
  padding: 1.5rem;
}
.card {
  background: var(--branco);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  border: 1px solid #e5e7eb;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 3rem;
}
.clinic-branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.clinic-logo {
  height: 40px;
  max-height: 40px;
  border-radius: 1vh;
  width: auto;
  object-fit: contain;
}
.clinic-logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #eef2ff;
  color: var(--azul-principal);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clinic-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: #374151;
}
.patient-info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}
.patient-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #eef2ff;
  color: var(--azul-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.patient-name {
  font-size: 1.25rem;
  margin: 0;
  text-align: left;
}
.patient-meta {
  display: flex;
  gap: 1rem;
  color: var(--cinza-texto);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
h1 {
  font-size: 1.75rem;
}
h2 {
  font-size: 1.75rem;
  text-align: center;
}
p {
  color: var(--cinza-texto);
  text-align: center;
}
.question-block {
  margin-bottom: 2.5rem;
}
.question-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  border-left: 3px solid var(--azul-principal);
  padding-left: 1rem;
  text-align: left;
  transition: color 0.2s;
}
.question-title span {
  color: var(--azul-principal);
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.form-textarea {
  min-height: 120px;
}
.choice-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.choice-item input[type='radio'],
.choice-item input[type='checkbox'] {
  display: none;
}
.choice-item label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.choice-item label:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}
.choice-item label::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  background-color: var(--branco);
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.choice-item input[type='radio'] + label::before {
  border-radius: 50%;
}
.choice-item input[type='checkbox'] + label::before {
  border-radius: 0.25rem;
}
.choice-item input:checked + label {
  border-color: var(--azul-principal);
  background-color: #eef2ff;
  font-weight: 500;
}
.choice-item input:checked + label::before {
  background-color: var(--azul-principal);
  border-color: var(--azul-principal);
  box-shadow: inset 0 0 0 3px var(--branco);
}
.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  background: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  margin-top: 2rem;
  transition: background-color 0.2s;
}
.submit-button:hover {
  background-color: var(--azul-escuro);
}
.question-block.has-error .question-title {
  color: #ef4444;
  border-left-color: #ef4444;
}
.question-block.has-error .question-title span {
  color: #ef4444;
}
.question-block.has-error .form-input,
.question-block.has-error .form-textarea {
  border-color: #ef4444;
}
.question-block.has-error .choice-item label {
  border-color: #ef4444;
  background-color: #fee2e2;
}

/* --- Telas de Status (ESTILOS CORRIGIDOS E RESTAURADOS) --- */
.success-card,
.error-card {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-icon {
  color: #10b981;
  margin-bottom: 1.5rem;
  animation: pop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.success-title {
  font-family: var(--fonte-titulo);
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  animation: slide-up 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.success-message {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.6;
  max-width: 450px;
  margin-bottom: 2rem;
  animation: slide-up 0.6s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.success-message strong {
  color: var(--preto);
  font-weight: 600;
}

.success-footer {
  font-size: 0.875rem;
  color: #9ca3af;
  animation: slide-up 0.6s ease-out forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

.error-icon {
  color: #f59e0b;
  margin-bottom: 1.5rem;
}

.error-title {
  font-family: var(--fonte-titulo);
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #b45309;
}

.error-message {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.6;
  max-width: 450px;
}

@keyframes pop-in {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
