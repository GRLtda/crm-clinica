<script setup>
import { marked } from 'marked'
import AppHeader from '@/components/global/AppHeader.vue'

const markdownContent = `
# Política de Privacidade

**Última atualização: 27 de Novembro de 2025**

No **Agenda Doutor**, levamos sua privacidade a sério. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais.

## 1. Informações que Coletamos

Coletamos informações que você nos fornece diretamente, como:
- Dados de cadastro (nome, e-mail, telefone).
- Dados da clínica (endereço, CNPJ).
- Informações de pacientes inseridas no sistema (prontuários, agendamentos).

## 2. Como Usamos Suas Informações

Usamos as informações coletadas para:
- Fornecer, manter e melhorar nossos serviços.
- Processar transações e enviar avisos relacionados.
- Enviar comunicações técnicas, atualizações de segurança e suporte.
- Cumprir obrigações legais.

## 3. Compartilhamento de Informações

Não vendemos suas informações pessoais. Podemos compartilhar dados apenas nas seguintes circunstâncias:
- Com prestadores de serviços que nos ajudam a operar a plataforma (ex: processamento de pagamentos, hospedagem).
- Para cumprir leis ou responder a processos legais.
- Com seu consentimento explícito.

## 4. Segurança de Dados

Implementamos medidas de segurança robustas para proteger seus dados contra acesso não autorizado, alteração ou destruição. Utilizamos criptografia e protocolos de segurança padrão da indústria.

## 5. Seus Direitos

Você tem o direito de:
- Acessar, corrigir ou excluir suas informações pessoais.
- Solicitar a portabilidade dos dados.
- Retirar seu consentimento a qualquer momento.

## 6. Cookies e Rastreamento

Utilizamos cookies para melhorar a experiência do usuário e analisar o tráfego. Você pode configurar seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades.

## 7. Alterações nesta Política

Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por e-mail.

## 8. Contato

Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato conosco através do nosso canal de suporte.
`

const compiledMarkdown = marked(markdownContent)
</script>

<template>
  <div class="page-container">
    <AppHeader />
    <main class="content-wrapper">
      <div class="document-container">
        <div class="markdown-body" v-html="compiledMarkdown"></div>
      </div>
    </main>
    
    <footer class="simple-footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} Agenda Doutor. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding-top: 100px; /* Espaço para o header fixo */
  padding-bottom: 4rem;
}

.document-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

/* Estilização do Markdown Renderizado */
.markdown-body {
  font-family: 'Inter', sans-serif;
  color: #374151;
  line-height: 1.8;
}

:deep(h1) {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

:deep(p) {
  margin-bottom: 1.25rem;
}

:deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

:deep(li) {
  margin-bottom: 0.5rem;
}

:deep(strong) {
  font-weight: 600;
  color: #111827;
}

.simple-footer {
  padding: 2rem 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

@media (max-width: 768px) {
  .document-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  :deep(h1) {
    font-size: 1.75rem;
  }
}
</style>
