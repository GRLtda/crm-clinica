export const clickOutside = {
  // Usamos 'mounted' para garantir que o elemento já está no DOM
  mounted(el, binding) {
    el.__vueClickOutside__ = event => {
      // Se o clique foi no elemento da diretiva ou dentro dele, não faz nada
      if (el === event.target || el.contains(event.target)) {
        return
      }
      // Se o clique foi fora, chama a função que foi passada para a diretiva
      binding.value(event, el)
    }

    // Adiciona o 'escutador' de evento no próximo ciclo do navegador.
    // Isso evita que o mesmo clique que abre o pop-up também o feche.
    setTimeout(() => {
      document.addEventListener('click', el.__vueClickOutside__)
    }, 0)
  },
  unmounted(el) {
    // Limpa o 'escutador' de evento quando o elemento é destruído
    document.removeEventListener('click', el.__vueClickOutside__)
  },
}
