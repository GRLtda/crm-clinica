import { computed } from 'vue'

export function useStatusBadge(status) {
  const statusConfig = computed(() => {
    // ✨ CORREÇÃO AQUI: Acessar 'status.value' para obter a string reativa
    const normalizedStatus = status.value?.toLowerCase().replace(/\s+/g, '-')

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
    }

    return (
      configs[normalizedStatus] || {
        class: 'default',
        style: {
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
        },
      }
    )
  })

  const badgeClass = computed(() => `status-badge ${statusConfig.value.class}`)
  const badgeStyle = computed(() => statusConfig.value.style)
  // ✨ CORREÇÃO AQUI: Acessar 'status.value' para exibir o texto
  const displayText = computed(() => status.value || '')

  return {
    badgeClass,
    badgeStyle,
    displayText,
  }
}
