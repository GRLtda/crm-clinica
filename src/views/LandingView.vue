<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/global/AppHeader.vue'
import { ChevronRight, Check, X, Monitor } from 'lucide-vue-next'

const planos = ref([
  {
    name: 'Essencial',
    price: 'R$ 99',
    period: '/mês',
    description: 'Perfeito para clínicas que estão começando.',
    featured: false,
    buttonText: 'Começar agora',
    benefits: ['Gestão de Pacientes', 'Agenda Online'],
    limitations: ['Prontuário Eletrônico', 'Faturamento e Cobranças'],
  },
  {
    name: 'Profissional',
    price: 'R$ 199',
    period: '/mês',
    description: 'Ideal para clínicas em fase de crescimento.',
    featured: true,
    buttonText: 'Escolher plano',
    benefits: [
      'Tudo do plano Essencial',
      'Prontuário Eletrônico',
      'Faturamento e Cobranças',
      'Até 5 Usuários',
    ],
    limitations: ['APIs e Integrações'],
  },
  {
    name: 'Empresarial',
    price: 'Contato',
    period: '',
    description: 'Para clínicas com múltiplas unidades e necessidades.',
    featured: false,
    buttonText: 'Fale conosco',
    benefits: [
      'Tudo do plano Profissional',
      'APIs e Integrações',
      'Suporte Dedicado',
      'Usuários Ilimitados',
    ],
    limitations: [],
  },
])
</script>

<template>
  <AppHeader />
  <main>
    <section class="hero">
      <div class="container">
        <div class="badge">✨ Teste 30 dias grátis</div>
        <h1 class="hero-title">Sua clínica no piloto automático</h1>
        <p class="hero-subtitle">
          Impulsione o sucesso da sua clínica com uma solução que elimina tarefas manuais e acelera
          o seu faturamento.
        </p>
        <div class="hero-actions">
          <router-link to="/app" class="btn-primary">
            Entrar <ChevronRight :size="20" />
          </router-link>
          <button class="btn-secondary">Agentes Digitais <ChevronRight :size="20" /></button>
        </div>
      </div>
    </section>

    <section class="platform-section">
      <div class="platform-container">
        <div class="platform-content">
          <div class="platform-icon">
            <Monitor :size="28" />
          </div>
          <h2 class="platform-title">Plataforma</h2>
          <p class="platform-description">
            Automatize cobranças e a emissão de documentos, centralize prontuários e agendamentos e
            aumente a eficiência da sua clínica.
          </p>
          <a href="#" class="btn-learn-more"> Saiba mais <ChevronRight :size="16" /> </a>
        </div>
        <div class="platform-image">
          <img src="" alt="Interface da plataforma do ClínicaCRM" />
        </div>
      </div>
    </section>

    <section class="plans-section">
      <div class="container-plans">
        <h2 class="section-title">Planos flexíveis para sua necessidade</h2>
        <p class="section-subtitle">Comece de graça e evolua conforme sua clínica cresce.</p>
        <div class="plans-grid">
          <div
            v-for="plano in planos"
            :key="plano.name"
            class="plan-card"
            :class="{ featured: plano.featured }"
          >
            <h3 class="plan-name">{{ plano.name }}</h3>
            <p class="plan-price">
              {{ plano.price }}<span class="plan-period">{{ plano.period }}</span>
            </p>
            <p class="plan-description">{{ plano.description }}</p>

            <ul class="plan-features">
              <li v-for="benefit in plano.benefits" :key="benefit" class="benefit">
                <Check :size="16" /> {{ benefit }}
              </li>
            </ul>

            <ul v-if="plano.limitations.length > 0" class="plan-features">
              <li v-for="limitation in plano.limitations" :key="limitation" class="limitation">
                <X :size="16" /> {{ limitation }}
              </li>
            </ul>

            <button :class="plano.featured ? 'btn-primary-featured' : 'btn-outline'">
              {{ plano.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Efeitos de fundo na tag <main> */
main {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 40%, #dbeafe 0%, var(--branco) 50%);
}
main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/noise.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}
main::after {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 1;
  animation: pulse-light 8s infinite alternate ease-in-out;
}
.hero,
.plans-section,
.platform-section {
  position: relative;
  z-index: 2;
}
.hero {
  text-align: center;
  padding: 10rem 0 6rem 0;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}
.badge {
  display: inline-block;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.hero-title {
  font-size: 3.75rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
}
.hero-subtitle {
  font-size: 1.25rem;
  color: var(--cinza-texto);
  max-width: 600px;
  margin: 0 auto 2.5rem auto;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.hero-actions .btn-primary,
.hero-actions .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* Para o router-link */
}
.btn-primary {
  background-color: var(--azul-principal);
  color: var(--branco);
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
}
.btn-secondary {
  background-color: var(--cinza-claro);
  color: var(--preto);
  border: none;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Nova Seção de Plataforma */
.platform-section {
  padding: 6rem 0;
}
.platform-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 4rem;
}
.platform-content {
  flex-basis: 50%;
  text-align: left;
}
.platform-icon {
  margin-bottom: 1rem;
  color: var(--preto);
}
.platform-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.platform-description {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.7;
  margin-bottom: 2rem;
}
.btn-learn-more {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: var(--azul-principal);
  transition: gap 0.3s ease;
}
.btn-learn-more:hover {
  gap: 0.5rem;
}
.platform-image {
  flex-basis: 50%;
}
.platform-image img {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(80, 80, 120, 0.15);
}

/* Seção de planos */
.plans-section {
  padding: 6rem 0;
}
.plans-section::before {
  content: '';
  position: absolute;
  bottom: -150px;
  right: -150px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(200, 220, 255, 0.2) 0%, transparent 60%);
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 1;
  animation: pulse-light-alt 10s infinite alternate-reverse ease-in-out;
}
@keyframes pulse-light {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05) translate(20px, 10px);
    opacity: 0.4;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.3;
  }
}
@keyframes pulse-light-alt {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1) translate(-15px, -5px);
    opacity: 0.3;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.2;
  }
}
.container-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.section-subtitle {
  font-size: 1.125rem;
  color: var(--cinza-texto);
  margin-bottom: 4rem;
}
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: left;
}
.plan-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}
.plan-card.featured {
  background-color: var(--preto);
  color: var(--branco);
  border-color: var(--preto);
}
.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.plan-price {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.plan-period {
  font-size: 1rem;
  font-weight: 500;
  color: var(--cinza-texto);
}
.featured .plan-period {
  color: #a1a1aa;
}
.plan-description {
  margin-bottom: 2rem;
  min-height: 40px;
}
.featured .plan-description {
  color: #d4d4d8;
}
.plan-features {
  list-style: none;
  margin-bottom: 2rem;
  padding: 0;
}
.plan-card:not(.featured) .plan-features:has(+ .plan-features) {
  margin-bottom: 1rem;
}
.plan-features:last-of-type {
  flex-grow: 1;
}
.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.benefit svg {
  color: var(--azul-principal);
}
.limitation {
  color: var(--cinza-texto);
}
.limitation svg {
  color: #ef4444;
}
.featured .limitation {
  color: #a1a1aa;
}
.btn-outline {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--preto);
  color: var(--preto);
  background-color: transparent;
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background-color: var(--preto);
  color: var(--branco);
}
.btn-primary-featured {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--azul-principal);
  background-color: var(--azul-principal);
  color: var(--branco);
  font-weight: 600;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-primary-featured:hover {
  background-color: var(--azul-escuro);
}
</style>
