<script setup>
import { formatPhone } from '@/directives/phone-mask.js' // ✨ 1. Importa a função de formatação
import { formatCPF } from '@/directives/cpf-mask.js'     // ✨ Importa outras funções se necessário
import { formatCNPJ } from '@/directives/cnpj-mask.js'   // ✨ Importa outras funções se necessário

const props = defineProps({
  modelValue: String,
  label: String,
  name: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  autocomplete: String,
  phoneMask: { type: Boolean, default: false },
  cpfMask: { type: Boolean, default: false },
  cnpjMask: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function handleInput(event) {
  let value = event.target.value
  // ✨ 2. Aplica a formatação ANTES de emitir, se a máscara estiver ativa
  if (props.phoneMask) {
    value = formatPhone(value)
    // Atualiza o valor no input imediatamente para manter a consistência visual
    // e a posição correta do cursor (embora a diretiva também faça isso depois)
    if (event.target.value !== value) {
       event.target.value = value
    }
  } else if (props.cpfMask) { // ✨ Adiciona lógica para outras máscaras se houver
     value = formatCPF(value)
     if (event.target.value !== value) {
       event.target.value = value
    }
  } else if (props.cnpjMask) { // ✨ Adiciona lógica para outras máscaras se houver
     value = formatCNPJ(value)
     if (event.target.value !== value) {
       event.target.value = value
    }
  }
  emit('update:modelValue', value) // ✨ 3. Emite o valor (potencialmente formatado)
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <input
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :value="modelValue"
      :autocomplete="autocomplete"
      @input="handleInput"
      v-phone-mask="phoneMask"
      v-cpf-mask="cpfMask"
      v-cnpj-mask="cnpjMask"
      class="form-input"
      :disabled="disabled"
    />
  </div>
</template>

<style scoped>
/* Estilos permanecem os mesmos */
.form-group {
  text-align: left;
  margin-bottom: 1.25rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: var(--branco);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
.form-input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}
</style>
