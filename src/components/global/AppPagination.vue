<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  limit: { type: Number, default: 10 },
})

const emit = defineEmits(['page-change'])

const pageNumbers = computed(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  const pages = new Set()
  pages.add(1)
  pages.add(props.totalPages)

  for (let i = -1; i <= 1; i++) {
    const page = props.currentPage + i
    if (page > 1 && page < props.totalPages) {
      pages.add(page)
    }
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sortedPages.length; i++) {
    result.push(sortedPages[i])
    if (i < sortedPages.length - 1 && sortedPages[i + 1] > sortedPages[i] + 1) {
      result.push('...')
    }
  }
  return result
})

const fromItem = computed(() => (props.currentPage - 1) * props.limit + 1)
const toItem = computed(() => Math.min(props.currentPage * props.limit, props.totalItems))
</script>

<template>
  <nav class="pagination-container" aria-label="Paginação">
    <button
      @click="$emit('page-change', currentPage - 1)"
      :disabled="currentPage === 1"
      class="btn-nav btn-prev"
    >
      <ChevronLeft :size="16" />
      <span class="btn-nav-text">Anterior</span>
    </button>

    <div class="pagination-summary desktop-summary">
      Mostrando <strong>{{ fromItem }}</strong>-<strong>{{ toItem }}</strong> de
      <strong>{{ totalItems }}</strong> pacientes
    </div>

    <div class="page-numbers desktop-only">
      <template v-for="(page, index) in pageNumbers" :key="index">
        <button
          v-if="page !== '...'"
          @click="$emit('page-change', page)"
          :class="['btn-page', { active: page === currentPage }]"
        >
          {{ page }}
        </button>
        <span v-else class="dots">...</span>
      </template>
    </div>

    <div class="pagination-summary mobile-summary">
      <strong>{{ fromItem }}</strong>-<strong>{{ toItem }}</strong> de
      <strong>{{ totalItems }}</strong>
    </div>

    <button
      @click="$emit('page-change', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="btn-nav btn-next"
    >
      <span class="btn-nav-text">Próxima</span>
      <ChevronRight :size="16" />
    </button>
  </nav>
</template>

<style scoped>
.pagination-container {
  position: relative; /* Posição relativa para o sumário mobile */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.pagination-summary {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  white-space: nowrap;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  /* Centraliza os números da página */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.btn-nav,
.btn-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: var(--branco);
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1; /* Garante que os botões fiquem sobre o sumário centralizado */
}
.btn-nav {
  padding: 0.5rem 1rem;
}
.btn-page {
  width: 36px;
  height: 36px;
}
.btn-nav:hover,
.btn-page:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}
.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-page.active {
  background-color: var(--azul-principal);
  color: var(--branco);
  border-color: var(--azul-principal);
}
.dots {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--cinza-texto);
}

/* Esconde o sumário mobile por padrão */
.mobile-summary {
  display: none;
}

/* ✨ INÍCIO DOS ESTILOS RESPONSIVOS ✨ */
@media (max-width: 768px) {
  .pagination-container {
    padding: 1rem; /* Menor padding no mobile */
  }

  /* Esconde os elementos de desktop */
  .desktop-only,
  .desktop-summary {
    display: none;
  }

  /* Mostra o sumário mobile e o centraliza */
  .mobile-summary {
    display: block;
    text-align: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 0;
  }

  /* Garante que os botões fiquem nas pontas */
  .btn-prev {
    margin-right: auto;
  }
  .btn-next {
    margin-left: auto;
  }
}

@media (max-width: 400px) {
  /* Em telas muito pequenas, esconde o texto dos botões */
  .btn-nav-text {
    display: none;
  }
  .btn-nav svg {
    margin: 0; /* Remove a margem do ícone quando o texto some */
  }
}
</style>
