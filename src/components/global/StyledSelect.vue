<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  options: { type: Array, required: true },
});
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue);
  return selectedOption ? selectedOption.label : 'Selecione';
});

// A função de fechar agora usa um pequeno delay.
// Isso é necessário para que o clique em uma opção seja registrado ANTES do menu fechar.
function closeDropdown() {
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
}

function selectOption(option) {
  emit('update:modelValue', option.value);
  isOpen.value = false; // Fechamento imediato ao selecionar
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="styled-select">
      <button type="button" class="select-button" @click="isOpen = !isOpen" @blur="closeDropdown">
        <span>{{ selectedLabel }}</span>
        <ChevronDown :size="16" class="arrow-icon" :class="{ 'is-open': isOpen }" />
      </button>
      <Transition name="fade">
        <ul v-if="isOpen" class="options-list">
          <li
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="option-item"
          >
            {{ option.label }}
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Os estilos permanecem os mesmos */
.form-group { text-align: left; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
.styled-select { position: relative; width: 100%; }
.select-button { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0.75rem 1rem; background-color: var(--branco); border: 1px solid #d1d5db; border-radius: 0.75rem; font-size: 1rem; cursor: pointer; text-align: left; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.select-button:focus, .select-button:focus-visible { outline: none; border-color: var(--azul-principal); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
.arrow-icon { color: #6b7281; transition: transform 0.2s ease; }
.arrow-icon.is-open { transform: rotate(180deg); }
.options-list { position: absolute; top: calc(100% + 0.5rem); left: 0; width: 100%; max-height: 200px; overflow-y: auto; background-color: var(--branco); border: 1px solid #e5e7eb; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); z-index: 10; padding: 0.5rem; list-style: none; margin: 0; }
.option-item { padding: 0.75rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; }
.option-item:hover { background-color: #f3f4f6; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
