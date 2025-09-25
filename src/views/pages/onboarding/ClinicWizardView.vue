<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthCard from '@/components/pages/autenticacao/AuthCard.vue';
import Stepper from '@/components/pages/onboarding/Stepper.vue';
import StepCreateClinic from '@/components/pages/onboarding/steps/StepCreateClinic.vue';
import { Building, CheckCircle } from 'lucide-vue-next';

const router = useRouter();
const currentStep = ref(1);

// 1. Removemos a etapa "Bem-vindo"
const steps = [
  { name: 'Dados da Clínica', subtitle: 'Informações principais', icon: Building },
  { name: 'Concluído', subtitle: 'Tudo pronto!', icon: CheckCircle },
];

function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++;
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

      <div v-if="currentStep === 2" class="text-content">
        <h2>Tudo pronto!</h2>
        <p>Sua clínica foi configurada com sucesso. Você será redirecionado para o painel principal.</p>
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
}
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
p {
  color: var(--cinza-texto);
  line-height: 1.6;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}
.auth-button {
  display: inline-block;
  text-decoration: none;
  max-width: 300px;
  padding: 0.875rem;
  margin-top: 2rem;
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
