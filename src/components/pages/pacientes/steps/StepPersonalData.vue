<script setup>
import FormInput from '@/components/global/FormInput.vue'
import StyledSelect from '@/components/global/StyledSelect.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

// Função genérica para atualizar o objeto pai
function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
]
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
      />
      <FormInput
        :modelValue="modelValue.birthDate"
        @update:modelValue="updateField('birthDate', $event)"
        label="Data de Nascimento"
        type="date"
        required
      />
      <FormInput
        :modelValue="modelValue.cpf"
        @update:modelValue="updateField('cpf', $event)"
        label="CPF"
        placeholder="000.000.000-00"
        cpf-mask
      />
      <FormInput
        :modelValue="modelValue.phone"
        @update:modelValue="updateField('phone', $event)"
        label="Telefone"
        placeholder="(00) 00000-0000"
        required
        phone-mask
      />
      <StyledSelect
        :modelValue="modelValue.gender"
        @update:modelValue="updateField('gender', $event)"
        label="Gênero"
        :options="genderOptions"
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
</style>
