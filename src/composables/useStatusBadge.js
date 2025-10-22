import { computed } from 'vue'

export function useStatusBadge(status) {
  const statusConfig = computed(() => {
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
  const displayText = computed(() => status || '')

  return {
    badgeClass,
    badgeStyle,
    displayText,
  }
}
