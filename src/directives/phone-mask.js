function formatPhone(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')

  if (digits.length <= 2) {
    return `(${digits}`
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export const phoneMask = {
  mounted(el, binding) {
    if (binding.value) {
      const onInput = (event) => {
        const value = event.target.value
        const formatted = formatPhone(value)

        if (formatted === value) {
          return
        }

        event.target.value = formatted
        el.dispatchEvent(new Event('input'))
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
