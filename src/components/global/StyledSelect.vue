<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  options: { type: Array, required: true },
  required: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectButtonRef = ref(null); // Ref para o botão
const dropdownStyle = ref({}); // Estilo dinâmico para o dropdown

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue);
  return selectedOption ? selectedOption.label : 'Selecione';
});

// ✨ NOVA FUNÇÃO PARA CALCULAR A POSIÇÃO DO DROPDOWN ✨
async function updateDropdownPosition() {
  if (!isOpen.value || !selectButtonRef.value) return;

  // Espera o DOM ser atualizado para garantir que o botão está visível
  await nextTick();

  const rect = selectButtonRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'absolute',
    top: `${rect.bottom + 4}px`, // 4px abaixo do botão
    left: `${rect.left}px`,
    width: `${rect.width}px`, // A mesma largura do botão
  };
}

// Observa quando o menu é aberto para calcular sua posição
watch(isOpen, (newValue) => {
  if (newValue) {
    updateDropdownPosition();
    // Adiciona "escutas" para reposicionar se a tela rolar ou mudar de tamanho
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
  } else {
    // Remove as "escutas" quando o menu é fechado
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
  }
});


function selectOption(option) {
  emit('update:modelValue', option.value);
  isOpen.value = false;
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    <div class="styled-select">
      <button
        ref="selectButtonRef"
        type="button"
        class="select-button"
        :class="{ 'has-error': error }"
        @click="isOpen = !isOpen"
      >
        <span>{{ selectedLabel }}</span>
        <ChevronDown :size="16" class="arrow-icon" :class="{ 'is-open': isOpen }" />
      </button>

      <Teleport to="body">
        <Transition name="fade">
          <ul v-if="isOpen" class="options-list" :style="dropdownStyle">
            <li
              v-for="option in options"
              :key="option.value"
              @mousedown.prevent="selectOption(option)"
              class="option-item"
            >
              {{ option.label }}
            </li>
          </ul>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  text-align: left;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}
.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}
.styled-select {
  position: relative;
  width: 100%;
}
.select-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--branco);
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.select-button.has-error {
  border-color: #ef4444;
}
.select-button:focus, .select-button:focus-visible {
  outline: none;
  border-color: var(--azul-principal);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
.arrow-icon {
  color: #6b7281;
  transition: transform 0.2s ease;
}
.arrow-icon.is-open {
  transform: rotate(180deg);
}
.options-list {
  /* ✨ A posição agora é calculada dinamicamente, mas mantemos o resto ✨ */
  position: absolute; /* Mudará para 'fixed' ou 'absolute' pelo JS */
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--branco);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1); /* Sombra mais pronunciada */
  z-index: 5000;
  padding: 0.5rem;
  list-style: none;
  margin: 0;
}
.option-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}
.option-item:hover {
  background-color: #f3f4f6;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
