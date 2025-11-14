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
  margin-bottom: 1.0rem;
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
    display: block; /* Remove o flex layout */
  }

  .image-panel {
    display: none; /* Esconde completamente o painel da imagem */
  }

  .form-panel {
    width: 100%; /* Ocupa a largura total */
    min-height: 100vh;
    padding: 2rem 1.5rem;
    /* Não precisa mais de z-index ou fundo transparente */
  }

  .content-title {
    text-align: center; /* Centraliza o título no mobile */
    font-size: 1.75rem;
  }

  /*
    Como o fundo agora é branco, não precisamos mais sobrescrever as cores
    dos componentes filhos, então as regras :deep() foram removidas para
    que eles voltem a usar seus estilos padrão.
  */
}
</style>
