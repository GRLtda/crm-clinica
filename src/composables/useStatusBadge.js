// import { computed } from 'vue' // <-- REMOVIDO

export function useStatusBadge(status) {
  // 'status' agora é uma string, não um ref.
  // Esta é a linha 5 que estava dando erro:
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-')

  const configs = {
    realizado: {
      class: 'realizado',
      style: {
        backgroundColor: '#f0fdf4',
        color: '#16a34a',
      },
    },
    agendado: {
      class: 'agendado',
      style: {
        backgroundColor: '#eff6ff',
        color: '#2563eb',
      },
    },
    confirmado: {
      class: 'confirmado',
      style: {
        backgroundColor: '#fefce8',
        color: '#a16207',
      },
    },
    cancelado: {
      class: 'cancelado',
      style: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
      },
    },
    'não-compareceu': {
      class: 'não-compareceu',
      style: {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
      },
    },
    'em-atendimento': {
      class: 'em-atendimento',
      style: {
        backgroundColor: '#f3e8ff', // Roxo claro
        color: '#7e22ce', // Roxo escuro
      },
    },
    // V-- Alteração aqui --V
    beta: {
      class: 'beta',
      style: {
        backgroundColor: '#eff6ff', // Azul claro (estilo "info")
        color: '#2563eb', // Azul (estilo "info")
      },
    },
    // ^-- Fim da alteração --^
  }

  // Não é mais 'computed'
  const statusConfig =
    configs[normalizedStatus] || {
      class: 'default',
      style: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
      },
    }

  // Não é mais 'computed'
  const badgeClass = `status-badge ${statusConfig.class}`
  // Não é mais 'computed'
  const badgeStyle = statusConfig.style
  // Não é mais 'computed' e acessa a string 'status' diretamente
  const displayText = status || ''

  return {
    badgeClass,
    badgeStyle,
    displayText,
  }
}
