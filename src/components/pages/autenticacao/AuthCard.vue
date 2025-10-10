<script setup>
import { defineProps } from 'vue'

defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  panelWidth: {
    type: String,
    default: 'default', // 'default' ou 'large'
  },
})
</script>

<template>
  <div class="auth-container">
    <div class="form-panel" :class="`panel-${panelWidth}`">
      <div class="form-content">
        <div v-if="$slots.title" class="content-title">
          <slot name="title" />
        </div>
        <div class="content-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="content-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
    <div class="image-panel" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--branco);
}

.form-panel {
  width: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
}

.form-content {
  width: 100%;
}

.panel-default .form-content {
  max-width: 450px;
}
.panel-large .form-content {
  max-width: 700px;
}

.content-title {
  margin-bottom: 2.5rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: left;
}

.content-footer {
  margin-top: 2rem;
  font-size: 0.875rem;
  color: var(--cinza-texto);
  text-align: center;
}

.image-panel {
  width: 55%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* ✨ INÍCIO DAS ALTERAÇÕES PARA RESPONSIVIDADE ✨ */
@media (max-width: 900px) {
  .auth-container {
    position: relative;
    display: block;
  }

  .image-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  /* Sobreposição escura sobre a imagem para melhor legibilidade */
  .image-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(25, 30, 50, 0.75); /* Sobreposição azulada escura */
    backdrop-filter: blur(8px); /* Aumenta o desfoque do fundo */
  }

  .form-panel {
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 100vh;
    background-color: transparent;
    color: var(--branco);
    padding: 2rem 1.5rem;
  }

  .content-title {
    text-align: center;
    font-size: 1.75rem;
    color: var(--branco);
  }

  .content-footer {
    color: #d1d5db;
  }

  /* Estilos aplicados aos componentes filhos (inputs, links, etc.) */
  .form-panel :deep(.link) {
    color: var(--branco);
    font-weight: 700;
  }

  .form-panel :deep(.form-label) {
    color: #d1d5db; /* Cinza claro para labels */
    font-weight: 500;
  }
  .form-panel :deep(.required-asterisk) {
    color: #f87171; /* Vermelho claro para o asterisco */
  }

  .form-panel :deep(.form-input),
  .form-panel :deep(.select-button) {
    background-color: rgba(255, 255, 255, 0.08); /* Fundo translúcido */
    border: 1px solid rgba(255, 255, 255, 0.2); /* Borda translúcida */
    color: var(--branco);
    padding-top: 0.875rem;
    padding-bottom: 0.875rem;
    transition: all 0.2s ease;
  }

  .form-panel :deep(.form-input::placeholder) {
    color: #9ca3af;
  }

  .form-panel :deep(.form-input:focus),
  .form-panel :deep(.select-button:focus) {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4); /* Mantém o brilho azul no foco */
  }

  /* Estilos para o componente de senha */
  .form-panel :deep(.visibility-toggle) {
    color: #d1d5db;
  }
  .form-panel :deep(.strength-text),
  .form-panel :deep(.requirements-list) {
    color: #d1d5db;
  }
  .form-panel :deep(.requirements-list li.satisfied) {
    color: #34d399; /* Verde para requisitos atendidos */
  }
  .form-panel :deep(.bar-segment) {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}
</style>
