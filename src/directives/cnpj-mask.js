function formatCNPJ(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')

  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export const cnpjMask = {
  mounted(el, binding) {
    if (binding.value) {
      const onInput = (event) => {
        const value = event.target.value
        const formatted = formatCNPJ(value)

        if (formatted !== value) {
          event.target.value = formatted
          el.dispatchEvent(new Event('input'))
        }
      }

      el.addEventListener('input', onInput)
      el._onInput = onInput
      
      setTimeout(() => {
        onInput({ target: el })
      }, 0)
    }
  },
  unmounted(el) {
    if (el._onInput) {
      el.removeEventListener('input', el._onInput)
    }
  },
}
