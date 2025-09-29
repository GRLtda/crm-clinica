<script setup>
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}
</script>

<template>
  <header class="app-header">
    <div class="container">
      <router-link to="/" class="logo">ClínicaCRM</router-link>

      <nav class="main-nav desktop-only">
        <router-link to="/">Soluções</router-link>
        <router-link to="/">Planos</router-link>
        <router-link to="/">Conteúdos</router-link>
        <router-link to="/">Sobre</router-link>
      </nav>
      <div class="actions desktop-only">
        <router-link to="/login" class="btn-login">Entrar</router-link>
        <router-link to="/register" class="btn-cta">Criar Conta</router-link>
      </div>

      <button @click="toggleMobileMenu" class="mobile-menu-toggle">
        <Menu :size="28" />
      </button>
    </div>

    <Transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-nav-overlay">
        <div class="mobile-nav-header">
          <router-link to="/" class="logo" @click="toggleMobileMenu">ClínicaCRM</router-link>
          <button @click="toggleMobileMenu" class="mobile-menu-toggle">
            <X :size="28" />
          </button>
        </div>
        <nav class="mobile-nav-links">
          <router-link to="/" @click="toggleMobileMenu" style="--delay: 0.1s">Soluções</router-link>
          <router-link to="/" @click="toggleMobileMenu" style="--delay: 0.2s">Planos</router-link>
          <router-link to="/" @click="toggleMobileMenu" style="--delay: 0.3s">Conteúdos</router-link>
          <router-link to="/" @click="toggleMobileMenu" style="--delay: 0.4s">Sobre</router-link>
        </nav>
        <div class="mobile-actions">
          <router-link to="/login" class="btn-login" @click="toggleMobileMenu">Entrar</router-link>
          <router-link to="/register" class="btn-cta" @click="toggleMobileMenu"
            >Criar Conta</router-link
          >
        </div>
      </div>
    </Transition>
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
  padding: 1rem 0;
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
  text-decoration: none;
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

/* Estilos para Mobile */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  color: var(--preto);
}
.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  /* ✨ CORREÇÃO AQUI: Fundo branco sólido para garantir a legibilidade */
  background-color: var(--branco);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}
.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
}
.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  flex-grow: 1;
}
.mobile-nav-links a {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--preto);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.4s ease forwards;
  animation-delay: var(--delay);
}
.mobile-nav-links a:hover {
  background-color: var(--cinza-claro);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}
.mobile-actions .btn-login,
.mobile-actions .btn-cta {
  width: 100%;
  text-align: center;
  padding: 1rem;
  border-radius: 0.75rem;
}

/* Transição para o menu mobile */
.slide-fade-enter-active {
  transition: opacity 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: opacity 0.3s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

/* Animação para os itens do menu */
@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media Query para ativar o modo mobile */
@media (max-width: 900px) {
  .desktop-only {
    display: none;
  }
  .mobile-menu-toggle {
    display: block;
  }
  .container {
    padding: 0 1rem;
  }
  .app-header {
    width: calc(100% - 2rem);
    padding: 0.75rem 0;
  }
}
</style>
