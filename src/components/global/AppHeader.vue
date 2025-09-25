<script setup>
// No futuro, podemos usar <RouterLink> para os links
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">ClínicaCRM</div>
      <nav class="main-nav">
        <router-link to="/">Soluções</router-link>
        <router-link to="/">Planos</router-link>
        <router-link to="/">Conteúdos</router-link>
        <router-link to="/">Sobre</router-link>
      </nav>
      <div class="actions">
        <router-link to="/login" class="btn-login">Entrar</router-link>
        <router-link to="/register" class="btn-cta">Criar Conta</router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 1.5rem;
  z-index: 1000;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: calc(100% - 3rem);
  max-width: 1200px;
  padding: 1.25rem 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(229, 231, 235, 0.4);
  border-radius: 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--preto);
}
.main-nav {
  display: flex;
  gap: 2rem;
  flex-grow: 1;
  justify-content: center;
}
.main-nav a {
  color: var(--cinza-texto);
  font-weight: 500;
  transition: color 0.3s ease;
  text-decoration: none;
}
.main-nav a:hover {
  color: var(--preto);
}
.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.btn-login {
  font-weight: 600;
  color: var(--preto);
  text-decoration: none;
}
.btn-cta {
  background-color: var(--preto);
  color: var(--branco);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  text-decoration: none;
}
.btn-cta:hover {
  background-color: #333;
}
</style>
