<script setup>
import { ref, watch } from 'vue'; // Importe o 'watch'
import { useClinicStore } from '@/stores/clinic';
import FormInput from '@/components/global/FormInput.vue';
import { fetchAddressByCEP } from '@/api/external'; // Importe a nova função

const emit = defineEmits(['success']);
const clinicStore = useClinicStore();

const clinicData = ref({
  name: '',
  responsibleName: '',
  cnpj: '',
  address: {
    cep: '',
    street: '',
    number: '',
    district: '',
    city: '',
    state: '',
  },
});
watch(() => clinicData.value.address.cep, async (newCep) => {
  // Remove a máscara para verificar o tamanho
  const numericCep = newCep.replace(/\D/g, '');
  if (numericCep.length === 8) {
    const address = await fetchAddressByCEP(numericCep);
    if (address) {
      clinicData.value.address.street = address.street;
      clinicData.value.address.district = address.neighborhood;
      clinicData.value.address.city = address.city;
      clinicData.value.address.state = address.state;
      // Opcional: focar no campo de número após preencher
      // document.querySelector('input[label="Número"]').focus();
    }
  }
});

const errorMessage = ref(null)

async function handleCreateClinic() {
  if (!clinicData.value.name || !clinicData.value.responsibleName) {
    errorMessage.value = 'Por favor, preencha pelo menos o Nome da Clínica e o Nome do Responsável.'
    return
  }
  errorMessage.value = null
  const { success } = await clinicStore.createClinic(clinicData.value)

  if (success) {
    emit('success')
  } else {
    errorMessage.value = 'Ocorreu um erro ao criar a clínica. Verifique os dados.'
  }
}
</script>

<template>
  <form @submit.prevent="handleCreateClinic" class="clinic-form">
    <div class="form-header">
      <h2>Dados da Clínica</h2>
      <p>Preencha as informações principais da sua clínica para começar.</p>
    </div>

    <div class="form-grid">
      <FormInput
        v-model="clinicData.name"
        label="Nome da Clínica"
        placeholder="Ex: Clínica Bem-Estar"
      />
      <FormInput
        v-model="clinicData.responsibleName"
        label="Nome do Responsável"
        placeholder="Quem é o responsável legal"
      />
      <FormInput v-model="clinicData.cnpj" label="CNPJ" :mask="'##.###.###/####-##'" placeholder="00.000.000/0000-00" />
      <FormInput v-model="clinicData.address.cep" label="CEP" :mask="'#####-###'" placeholder="00000-000" />
      <FormInput
        v-model="clinicData.address.street"
        label="Rua / Logradouro"
        placeholder="Ex: Av. Brasil"
      />
      <FormInput v-model="clinicData.address.number" label="Número" placeholder="Ex: 123" />
      <FormInput v-model="clinicData.address.district" label="Bairro" placeholder="Ex: Centro" />
      <FormInput v-model="clinicData.address.city" label="Cidade" placeholder="Sua cidade" />
      <FormInput v-model="clinicData.address.state" label="Estado" placeholder="Seu estado" />
    </div>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <button type="submit" class="auth-button">Salvar e Continuar</button>
  </form>
</template>

<style scoped>
.form-header {
  text-align: left;
  margin-bottom: 2rem;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
p {
  color: var(--cinza-texto);
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem; /* Espaçamento vertical e horizontal */
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
}
.auth-button {
  width: 100%;
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
