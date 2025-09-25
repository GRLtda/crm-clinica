<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  /* Reutilizando o fundo consistente e simples */
  background: radial-gradient(ellipse at 50% 40%, #e0f2fe 0%, var(--branco) 60%);
}
</style>
