<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAnamnesisStore } from '@/stores/anamnesis'
import { useToast } from 'vue-toastification'
import confetti from 'canvas-confetti'
import { CheckCircle2, AlertTriangle } from 'lucide-vue-next'

const route = useRoute()
const anamnesisStore = useAnamnesisStore()
const toast = useToast()

const responseData = ref(null)
const answers = ref([])
const submissionStatus = ref('pending') // pending, success, error

onMounted(async () => {
  const token = route.params.token
  const { success } = await anamnesisStore.fetchPublicTemplate(token)

  if (success && anamnesisStore.publicTemplate) {
    responseData.value = anamnesisStore.publicTemplate

    const questions = responseData.value.template?.questions

    if (Array.isArray(questions)) {
      answers.value = questions.map((q) => ({
        questionTitle: q.title,
        answer: q.questionType === 'multiple_choice' ? [] : '',
      }))
    } else {
      submissionStatus.value = 'error'
    }
  } else {
    submissionStatus.value = 'error'
  }
})

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

async function handleSubmit() {
  const token = route.params.token
  const { success } = await anamnesisStore.submitPatientAnswers(token, answers.value)
  if (success) {
    submissionStatus.value = 'success'
  } else {
    toast.error('Ocorreu um erro ao enviar suas respostas.')
  }
}
</script>

<template>
  <div class="public-form-container">
    <div v-if="submissionStatus === 'success'" class="card success-card">
      <CheckCircle2 class="success-icon" :size="64" />
      <h2 class="success-title">Obrigado!</h2>
      <p class="success-message">
        Suas respostas foram enviadas com sucesso
        <span v-if="responseData?.clinic?.name"
          >para a <strong>{{ responseData.clinic.name }}</strong></span
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

    <div v-else-if="responseData" class="card">
      <header>
        <h1>{{ responseData.template.name }}</h1>
        <p>Preencha o formulário abaixo com atenção.</p>
      </header>
      <form @submit.prevent="handleSubmit">
        <div
          v-for="(question, index) in responseData.template.questions"
          :key="question.title"
          class="question-block"
        >
          <label class="question-title">{{ index + 1 }}. {{ question.title }}</label>

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
              <input type="radio" :id="`q-${index}-sim`" value="Sim" v-model="answers[index].answer" />
              <label :for="`q-${index}-sim`">Sim</label>
            </div>
            <div class="choice-item">
              <input type="radio" :id="`q-${index}-nao`" value="Não" v-model="answers[index].answer" />
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
    <div v-else>
      <p>Carregando formulário...</p>
    </div>
  </div>
</template>

<style scoped>
.public-form-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 2rem;
}
.card {
  background: var(--branco);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  width: 100%;
}
header {
  text-align: center;
  margin-bottom: 2rem;
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
  margin-bottom: 2rem;
}
.question-title {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
  text-align: left;
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
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
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.choice-item label:hover {
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
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
}

/* --- Telas de Status --- */

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
  color: #10b981; /* Verde sucesso */
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
  color: #9ca3af; /* Cinza mais claro */
  animation: slide-up 0.6s ease-out forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

.error-icon {
  color: #f59e0b; /* Laranja/Âmbar para alerta */
  margin-bottom: 1.5rem;
}

.error-title {
  font-family: var(--fonte-titulo);
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #b45309; /* Laranja mais escuro */
}

.error-message {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.6;
  max-width: 450px;
}

@keyframes pop-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
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
