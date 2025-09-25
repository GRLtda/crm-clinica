<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-overview">
    <header class="dashboard-header">
      <h1 class="title">Visão Geral</h1>
      <p class="subtitle">Bem-vindo(a) de volta, {{ authStore.user?.name }}!</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Pacientes Ativos</h3>
        <p class="stat-number">124</p>
      </div>
      <div class="stat-card">
        <h3>Atendimentos Hoje</h3>
        <p class="stat-number">8</p>
      </div>
      <div class="stat-card">
        <h3>Cobranças Pendentes</h3>
        <p class="stat-number">R$ 4.320,00</p>
      </div>
      <div class="stat-card">
        <h3>Próximo Agendamento</h3>
        <p class="stat-text">Ana Silva - 15:30</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  margin-bottom: 2rem;
}
.title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}
.stat-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cinza-texto);
  margin-bottom: 0.5rem;
}
.stat-number,
.stat-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--preto);
}
.stat-text {
  font-size: 1.5rem;
}
</style>
