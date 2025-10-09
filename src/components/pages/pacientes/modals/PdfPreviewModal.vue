<script setup>
import { Download, X } from 'lucide-vue-next'

defineProps({
  pdfUrl: { type: String, required: true },
  fileName: { type: String, default: 'documento.pdf' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2 class="title">Pré-visualização do Documento</h2>
        <div class="header-actions">
          <a :href="pdfUrl" :download="fileName" class="btn-download">
            <Download :size="16" />
            Baixar
          </a>
          <button @click="emit('close')" class="btn-close" title="Fechar">
            <X :size="24" />
          </button>
        </div>
      </header>
      <div class="pdf-viewer">
        <iframe :src="`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`" frameborder="0" width="100%" height="100%"></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
}
.modal-content {
  background: #f9fafb;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--branco);
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.title {
  font-size: 1.125rem;
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: var(--branco);
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-texto);
}
.pdf-viewer {
  flex-grow: 1;
}
</style>
