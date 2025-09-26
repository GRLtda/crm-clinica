<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue'
import Stepper from '@/components/pages/onboarding/Stepper.vue'
import StepCreateClinic from '@/components/pages/onboarding/steps/StepCreateClinic.vue'
import StepWorkingHours from '@/components/pages/onboarding/steps/StepWorkingHours.vue' // 1. Importar nova etapa
import { Building, Clock, CheckCircle, CalendarPlus, UserPlus, PartyPopper } from 'lucide-vue-next' // 2. Importar ícone Clock

const router = useRouter()
const currentStep = ref(1)

// 3. Adicionar a nova etapa ao array
const steps = [
  { name: 'Dados da Clínica', subtitle: 'Informações principais', icon: Building },
  { name: 'Horário', subtitle: 'Funcionamento', icon: Clock },
  { name: 'Concluído', subtitle: 'Tudo pronto!', icon: CheckCircle },
]

function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}
</script>

<template>
  <AuthCard
    image-url="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    panel-width="large"
  >
    <template #title>
      <Stepper :steps="steps" :currentStep="currentStep" />
    </template>

    <div class="step-content-wrapper">
      <div v-if="currentStep === 1">
        <StepCreateClinic @success="nextStep" />
      </div>

      <div v-if="currentStep === 2">
        <StepWorkingHours @success="nextStep" />
      </div>

      <div v-if="currentStep === 3" class="text-content">
        <div class="success-icon-wrapper">
          <PartyPopper :size="48" />
        </div>
        <h2>Tudo pronto!</h2>
        <p>
          Sua clínica foi configurada com sucesso. Aqui estão algumas sugestões para começar a usar
          o sistema:
        </p>

        <ul class="next-steps-list">
          <li>
            <UserPlus :size="20" />
            <span>Cadastre seu primeiro paciente.</span>
          </li>
          <li>
            <CalendarPlus :size="20" />
            <span>Marque um atendimento na agenda.</span>
          </li>
        </ul>

        <button @click="router.push('/app')" class="auth-button">Ir para o Dashboard</button>
      </div>
    </div>
  </AuthCard>
</template>

<style scoped>
.step-content-wrapper {
  margin-top: 2rem;
}
.text-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.success-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: #eef2ff; /* Azul bem claro */
  color: var(--azul-principal);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
p {
  color: var(--cinza-texto);
  line-height: 1.6;
  max-width: 450px;
  margin-bottom: 2rem;
}
.next-steps-list {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #374151;
  font-weight: 500;
}
.next-steps-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.next-steps-list li svg {
  color: var(--azul-principal);
}
.auth-button {
  display: inline-block;
  text-decoration: none;
  max-width: 300px;
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: none;
  background-color: var(--azul-principal);
  color: var(--branco);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.auth-button:hover {
  background-color: var(--azul-escuro);
}
</style>
