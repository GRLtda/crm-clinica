function formatCPF(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')

  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const cpfMask = {
  mounted(el, binding) {
    if (binding.value) {
      const onInput = (event) => {
        const value = event.target.value
        const formatted = formatCPF(value)

        if (formatted !== value) {
          event.target.value = formatted
          el.dispatchEvent(new Event('input'))
        }
      }

      el.addEventListener('input', onInput)
      el._onInput = onInput
    }
  },
  unmounted(el) {
    if (el._onInput) {
      el.removeEventListener('input', el._onInput)
    }
  },
}
