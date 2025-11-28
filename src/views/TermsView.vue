<script setup>
import { marked } from 'marked'
import AppHeader from '@/components/global/AppHeader.vue'

const markdownContent = `
# Termos de Uso

**Última atualização: 27 de Novembro de 2025**

Bem-vindo ao **Agenda Doutor**. Ao acessar ou usar nossa plataforma, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.

## 1. Aceitação dos Termos

Ao criar uma conta ou utilizar nossos serviços, você confirma que leu, entendeu e concorda em ficar vinculado a estes termos.

## 2. Descrição do Serviço

O Agenda Doutor é uma plataforma de gestão para clínicas e consultórios, oferecendo funcionalidades como agendamento online, prontuário eletrônico e gestão financeira.

## 3. Cadastro e Segurança

- Você é responsável por manter a confidencialidade de sua senha e conta.
- Você concorda em fornecer informações precisas e completas durante o registro.
- Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.

## 4. Uso Aceitável

Você concorda em não usar o serviço para:
- Violar leis ou regulamentos.
- Enviar spam ou comunicações não solicitadas.
- Tentar acessar áreas não autorizadas do sistema.

## 5. Planos e Pagamentos

- O uso de certas funcionalidades pode exigir o pagamento de taxas.
- Os preços e planos estão sujeitos a alterações mediante aviso prévio.
- O cancelamento pode ser feito a qualquer momento, sujeito às regras do plano contratado.

## 6. Propriedade Intelectual

Todo o conteúdo, design e código da plataforma são propriedade do Agenda Doutor e estão protegidos por leis de direitos autorais.

## 7. Limitação de Responsabilidade

O Agenda Doutor não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso do serviço.

## 8. Alterações nos Termos

Podemos atualizar estes termos periodicamente. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.

## 9. Contato

Se tiver dúvidas sobre estes Termos, entre em contato conosco através do nosso suporte.
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
