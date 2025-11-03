<script setup>
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
]

const maxBirthDate = ref(new Date())
</script>

<template>
  <div class="form-section">
    <h2 class="section-title">Dados Pessoais</h2>
    <div class="form-grid">
      <FormInput
        :modelValue="modelValue.name"
        @update:modelValue="updateField('name', $event)"
        label="Nome Completo"
        placeholder="Nome do paciente"
        required
        :error="errors.name"
      />
      <div class="form-group">
        <label class="form-label">Data de Nascimento<span class="required-asterisk">*</span></label>
        <Datepicker
          :modelValue="modelValue.birthDate"
          @update:modelValue="updateField('birthDate', $event)"
          locale="pt-BR"
          format="dd/MM/yyyy"
          :enable-time-picker="false"
          :max-date="maxBirthDate"
          placeholder="Selecione ou digite a data"
          :enable-text-input="true"
          :input-class-name="errors.birthDate ? 'dp-custom-input has-error' : 'dp-custom-input'"
        />
        <p v-if="errors.birthDate" class="error-message">{{ errors.birthDate }}</p>
      </div>
      <FormInput
        :modelValue="modelValue.cpf"
        @update:modelValue="updateField('cpf', $event)"
        label="CPF"
        placeholder="000.000.000-00"
        cpf-mask
        :error="errors.cpf"
      />
      <FormInput
        :modelValue="modelValue.phone"
        @update:modelValue="updateField('phone', $event)"
        label="Telefone"
        placeholder="(00) 00000-0000"
        required
        phone-mask
        :error="errors.phone"
      />
      <StyledSelect
        :modelValue="modelValue.gender"
        @update:modelValue="updateField('gender', $event)"
        label="Gênero"
        :options="genderOptions"
        :error="!!errors.gender"
      />
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
}
.form-group {
  text-align: left;
  padding-bottom: 1.25rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap; /* ✨ 2. CORRIGIDO: Adicionado para impedir a quebra de linha */
}
.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
:deep(.dp-custom-input.has-error) {
  border-color: #ef4444;
}

/* ✨ INÍCIO DAS MUDANÇAS PARA RESPONSIVO ✨ */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* 1. Uma coluna por linha no mobile */
    gap: 0 1.5rem; /* 2. Remove o gap de linha, mantém o de coluna */
  }

  .form-group {
    /* 3. Reduz o espaçamento inferior para campos que não são FormInput */
    padding-bottom: 1rem;
  }
}
</style>
