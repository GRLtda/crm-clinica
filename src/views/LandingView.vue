<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppHeader from '@/components/global/AppHeader.vue'
import { RouterLink } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
// 💡 Importei os ícones necessários
import {
  Building,
  Check,
  Zap,
  Clock,
  LifeBuoy,
  X,
  KeyRound,
  Monitor,
  ChevronRight,
} from 'lucide-vue-next'

// 🎯 Foco apenas no plano Empresarial
const planos = ref([
  {
    name: 'Empresarial',
    icon: Building,
    price: 'Sob Consulta', // Trocado de 'Contato' para 'Sob Consulta'
    period: '',
    description: 'Para clínicas com múltiplas unidades e necessidades complexas.',
    featured: true, // Deixei como 'featured' para dar mais destaque
    buttonText: 'Fale conosco',
    benefits: [
      'Gestão Completa de Pacientes',
      'Agenda Online Avançada',
      'Prontuário Eletrônico Personalizável',
      'Usuários Ilimitados',
    ],
    limitations: [], // Sem limitações
  },
])

// Lógica para o efeito 3D
const platformImageWrapper = ref(null)

function handleMouseMove(event) {
  if (!platformImageWrapper.value) return
  const el = platformImageWrapper.value
  const { width, height, left, top } = el.getBoundingClientRect()
  const x = event.clientX - left
  const y = event.clientY - top
  const mouseX = x / width - 0.5
  const mouseY = y / height - 0.5
  const rotateY = mouseX * 20
  const rotateX = -mouseY * 20
  el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
  el.style.transition = 'transform 0.1s linear'
}

function resetTilt() {
  if (!platformImageWrapper.value) return
  platformImageWrapper.value.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`
  platformImageWrapper.value.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
}

// 💡 --- NOVO CÓDIGO PARA FUNDO INTERATIVO --- 💡
const mainElement = ref(null)

/**
 * Atualiza a posição do fundo com base no movimento do mouse.
 */
function handleMainMouseMove(event) {
  if (!mainElement.value) return
  const el = mainElement.value
  const { left, top, width, height } = el.getBoundingClientRect()
  const x = event.clientX - left
  const y = event.clientY - top

  const percentX = (x / width) * 100
  const percentY = (y / height) * 100

  el.style.setProperty('--bg-x', `${percentX}%`)
  el.style.setProperty('--bg-y', `${percentY}%`)
  el.style.transition = 'background 0.1s linear' // Transição rápida ao mover
}

/**
 * Reseta a posição do fundo quando o mouse sai.
 */
function resetMainBackground() {
  if (!mainElement.value) return
  const el = mainElement.value
  el.style.setProperty('--bg-x', '50%')
  el.style.setProperty('--bg-y', '40%') // Posição original
  el.style.transition = 'background 0.6s cubic-bezier(0.23, 1, 0.32, 1)' // Transição suave ao sair
}

// 💡 --- DADOS DAS EMPRESAS --- 💡
const companyLogos = ref([
  { id: 1, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Clínica+Vida', alt: 'Clínica Vida' },
  { id: 2, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Saúde+Mais', alt: 'Saúde Mais' },
  { id: 3, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Odonto+Prime', alt: 'Odonto Prime' },
  { id: 4, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Derma+Care', alt: 'Derma Care' },
  { id: 5, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Cardio+Center', alt: 'Cardio Center' },
  { id: 6, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Orto+Fisio', alt: 'Orto Fisio' },
  { id: 7, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Neuro+Lab', alt: 'Neuro Lab' },
  { id: 8, src: 'https://placehold.co/150x50/e5e7eb/1f2937?text=Pediatria+Kids', alt: 'Pediatria Kids' },
])
</script>

<template>
  <AppHeader class="header-slide-down" />
  <main ref="mainElement" @mousemove="handleMainMouseMove" @mouseleave="resetMainBackground">
    <section class="hero">
      <div class="container hero-container">
        <div class="hero-content">
          <h1 class="hero-title animate-slide-up">Sua clínica no piloto automático</h1>
          <p class="hero-subtitle animate-slide-up">
            Impulsione o sucesso da sua clínica com uma solução que elimina tarefas manuais e acelera
            o seu faturamento.
          </p>
          <div class="hero-actions animate-slide-up">
            <router-link to="/app" class="btn-primary"> Entrar <KeyRound :size="20" /> </router-link>
            <button class="btn-secondary">Agentes Digitais <ChevronRight :size="20" /></button>
          </div>
        </div>
        <div class="hero-visual animate-slide-up">
          <!-- Substitua o src pela URL do seu arquivo .lottie -->
            <DotLottieVue
            style="height: 500px; width: 500px"
            autoplay
            loop
            src="https://lottie.host/0704fffd-fed1-42f4-8c91-5de870a1a5c6/9RfCFsGq7R.lottie"
          />

        </div>
      </div>
    </section>

    <!-- 🌟 SEÇÃO DE EMPRESAS (CARROSSEL INFINITO) 🌟 -->
    <section class="trusted-section">
      <div class="container">
        <p class="trusted-title">Mais de 500 clínicas confiam no Agenda Doutor</p>
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <!-- Duplicado para efeito infinito -->
            <div v-for="i in 2" :key="i" class="marquee-group">
              <div v-for="logo in companyLogos" :key="logo.id" class="company-logo">
                <img :src="logo.src" :alt="logo.alt" />
              </div>
            </div>
          </div>
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
        <div
          class="platform-image-wrapper"
          ref="platformImageWrapper"
          @mousemove="handleMouseMove"
          @mouseleave="resetTilt"
        >
          <div class="platform-image">
            <img
              src="https://placehold.co/600x400/FFF/31343C?text=Dashboard"
              alt="Interface da plataforma do Agenda Doutor"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="plans-section">
      <div class="container-plans">
        <h2 class="section-title">Uma solução sob medida para sua clínica</h2>
        <p class="section-subtitle">
          Para clínicas que exigem o máximo de performance, personalização e um suporte dedicado.
        </p>

        <div class="plans-grid">
          <div
            v-for="plano in planos"
            :key="plano.name"
            class="plan-card"
            :class="{ featured: plano.featured }"
          >
            <h3 class="plan-name">
              <component :is="plano.icon" :size="20" />
              <span>{{ plano.name }}</span>
            </h3>
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

            <a
              href="https://wa.me/5511921923978"
              target="_blank"
              :class="plano.featured ? 'btn-primary-featured' : 'btn-outline'"
            >
              {{ plano.buttonText }}
            </a>

            <div class="plan-footer-support">
              <h4 class="footer-support-title">Um Atendimento que Realmente Funciona</h4>
              <div class="footer-features-grid">
                <div class="footer-feature-item">
                  <Zap :size="20" class="feature-icon" />
                  <div class="feature-text">
                    <h5>Suporte Rápido</h5>
                    <p>Respostas ágeis via chat e vídeo.</p>
                  </div>
                </div>
                <div class="footer-feature-item">
                  <Clock :size="20" class="feature-icon" />
                  <div class="feature-text">
                    <h5>24/7 Disponível</h5>
                    <p>Plataforma e suporte sempre prontos.</p>
                  </div>
                </div>
                <div class="footer-feature-item">
                  <LifeBuoy :size="20" class="feature-icon" />
                  <div class="feature-text">
                    <h5>Atendimento Humano</h5>
                    <p>Especialistas que entendem sua clínica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-copyright">
        © {{ new Date().getFullYear() }}. Todos os direitos reservados.
      </div>

      <nav class="footer-links">
        <RouterLink to="/termos">Termos de Uso</RouterLink>
        <RouterLink to="/privacidade">Privacidade</RouterLink>
      </nav>

      <div class="footer-produced-by">
        <span>Produzido por</span>
        <a href="https://grltda.vercel.app" target="_blank" rel="noopener noreferrer" class="gr-logo">
          <img src="@/assets/imgs/gr.svg" alt="Logo GR" class="gr-logo-svg" />
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ANIMAÇÕES DE ENTRADA */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

:global(.header-slide-down) {
  animation: slideDown 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
.hero-title {
  animation-delay: 0.2s;
}
.hero-subtitle {
  animation-delay: 0.4s;
}
.hero-actions {
  animation-delay: 0.6s;
}
.hero-visual {
  animation-delay: 0.8s;
}

/* ESTILOS GERAIS */
main {
  /* 💡 Variáveis para o fundo interativo (posição inicial) 💡 */
  --bg-x: 20%;
  --bg-y: 10%;

  position: relative;
  overflow: hidden;
  /* 💡 Fundo quadriculado com pontos de luz 💡 */
  background-color: #ffffff;
  background-image:
    /* Pontos de luz (Radial Gradients) */
    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(147, 51, 234, 0.08) 0%, transparent 25%),
    /* Grid (Linear Gradients) */
    linear-gradient(to right, rgba(229, 231, 235, 0.5) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(229, 231, 235, 0.5) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  min-height: calc(100vh - 100px);
}
.hero,
.plans-section,
.platform-section {
  position: relative;
  z-index: 2;
}
.hero {
  padding: 6rem 0;
  display: flex;
  align-items: center;
  min-height: 80vh; /* Garante altura mínima para centralizar verticalmente */
}
.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  max-width: 1280px; /* Aumentei um pouco para telas maiores */
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}
.hero-content {
  flex: 1;
  text-align: left;
  max-width: 640px;
}
.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Adiciona um brilho sutil atrás do Lottie */
.hero-visual::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  z-index: -1;
  border-radius: 50%;
  filter: blur(40px);
}

.hero-title {
  font-family: var(--fonte-titulo);
  font-size: clamp(2.5rem, 5vw, 4.5rem); /* Tipografia responsiva */
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  color: var(--preto);
}
.hero-subtitle {
  font-family: var(--fonte-principal);
  font-size: 1.25rem;
  color: var(--cinza-texto);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 90%;
}
.hero-actions {
  display: flex;
  gap: 1.5rem; /* Mais espaço entre os botões */
}
.hero-actions .btn-primary,
.hero-actions .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem; /* Botões mais largos */
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 9999px; /* Pill shape completo */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.btn-primary {
  background-color: var(--azul-principal);
  color: var(--branco);
  border: 2px solid transparent;
}
.btn-primary:hover {
  background-color: var(--azul-escuro);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}
.btn-secondary {
  background-color: var(--cinza-claro);
  color: var(--preto);
  border: 2px solid transparent;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

/* SEÇÃO DE EMPRESAS (CARROSSEL) */
.trusted-section {
  padding: 4rem 0;
  background-color: transparent;
  border-bottom: 1px solid #f3f4f6;
  overflow: hidden;
}
.trusted-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--cinza-texto);
  margin-bottom: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.marquee-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
.marquee-content {
  display: flex;
  width: max-content;
  animation: scroll 40s linear infinite;
}
.marquee-group {
  display: flex;
  align-items: center;
  gap: 4rem;
  padding-right: 4rem; /* Espaço para conectar com o próximo grupo */
}
.company-logo img {
  height: 40px;
  width: auto;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  filter: grayscale(100%);
}
.company-logo img:hover {
  opacity: 1;
  filter: grayscale(0%);
}

@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* SEÇÃO PLATAFORMA (NOVO DESIGN) */
.platform-section {
  padding: 8rem 0;
  position: relative;
  /* Fundo sutil para destacar a seção */
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.platform-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem;
  display: flex;
  align-items: center;
  gap: 5rem;
  /* Efeito de cartão glassmorphism */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
}

.platform-content {
  flex: 1;
  text-align: left;
}

.platform-icon {
  display: inline-flex;
  padding: 1rem;
  background-color: #eff6ff;
  color: var(--azul-principal);
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.platform-title {
  font-family: var(--fonte-titulo);
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: var(--preto);
}

.platform-description {
  font-family: var(--fonte-principal);
  font-size: 1.125rem;
  color: var(--cinza-texto);
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.btn-learn-more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--branco);
  background-color: var(--preto);
  padding: 1rem 2rem;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-learn-more:hover {
  background-color: #333;
  transform: translateY(-2px);
  gap: 0.75rem;
}

/* EFEITO 3D NA IMAGEM (ATUALIZADO) */
.platform-image-wrapper {
  flex: 1;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.platform-image {
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  border: 8px solid #ffffff; /* Borda branca grossa estilo moldura */
  background-color: #fff;
}

.platform-image img {
  width: 100%;
  display: block;
  border-radius: 0.5rem;
}

/* SEÇÃO DE PLANOS */
.plans-section {
  padding: 8rem 0;
  position: relative;
}

/* Fundo decorativo para a seção de planos */
.plans-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

.container-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
.section-title {
  font-family: var(--fonte-titulo);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--preto);
}
.section-subtitle {
  font-family: var(--fonte-principal);
  font-size: 1.125rem;
  color: var(--cinza-texto);
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}
.plans-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  text-align: left;
}

/* Card Moderno */
.plan-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1.5rem; /* Bordas mais arredondadas */
  padding: 3rem;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  width: 100%;
  max-width: 500px; /* Limite de largura para ficar elegante */
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

/* Estilo Featured (Dark Premium) */
.plan-card.featured {
  background-color: #0f172a; /* Azul muito escuro/Preto */
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Efeito de brilho no topo do card featured */
.plan-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
}

.plan-name {
  font-family: var(--fonte-titulo);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
}

.plan-price {
  font-family: var(--fonte-titulo);
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1;
  letter-spacing: -0.02em;
}

.plan-period {
  font-family: var(--fonte-principal);
  font-size: 1rem;
  font-weight: 500;
  color: var(--cinza-texto);
  margin-left: 0.5rem;
}
.featured .plan-period {
  color: #94a3b8;
}

.plan-description {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  color: var(--cinza-texto);
}
.featured .plan-description {
  color: #cbd5e1;
}

.plan-features {
  list-style: none;
  margin-bottom: 2.5rem;
  padding: 0;
  flex-grow: 1;
}
.plan-features li {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.benefit svg {
  color: var(--azul-principal);
  flex-shrink: 0;
}
.featured .benefit svg {
  color: #60a5fa; /* Azul mais claro no escuro */
}

.limitation svg {
  color: #ef4444;
  flex-shrink: 0;
}
.featured .limitation {
  color: #94a3b8;
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
  display: block;
  text-align: center;
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
  display: block;
  text-align: center;
  transition: all 0.3s ease;
}
.btn-primary-featured:hover {
  background-color: var(--azul-escuro);
}

.carousel-dots {
  display: none;
}

/* RODAPÉ DENTRO DO CARD */
.plan-footer-support {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}
.featured .plan-footer-support {
  border-top-color: #3f3f46;
}
.footer-support-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}
.featured .footer-support-title {
  color: var(--branco);
}
.footer-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.footer-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}
.footer-feature-item .feature-icon {
  color: var(--azul-principal);
  margin-top: 2px;
  flex-shrink: 0;
}
.featured .footer-feature-item .feature-icon {
  color: var(--azul-principal);
}
.footer-feature-item h5 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}
.featured .footer-feature-item h5 {
  color: var(--branco);
}
.footer-feature-item p {
  font-size: 0.875rem;
  color: var(--cinza-texto);
  line-height: 1.5;
  margin: 0;
}
.featured .footer-feature-item p {
  color: #a1a1aa;
}

/* --- AJUSTES DE RESPONSIVIDADE --- */

/* CELULARES (até 768px) */
@media (max-width: 768px) {
  .hero {
    padding: 8rem 0 5rem 0;
    text-align: center;
  }
  .hero-container {
    flex-direction: column;
    gap: 3rem;
  }
  .hero-content {
    text-align: center;
    max-width: 100%;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-subtitle {
    font-size: 1.125rem;
  }
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-actions .btn-primary,
  .hero-actions .btn-secondary {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  .hero-visual {
    width: 100%;
    overflow: hidden;
  }
  .hero-visual > * {
    max-width: 100%;
    height: auto !important;
  }

  .platform-section {
    padding: 4rem 0;
  }
  .platform-container {
    flex-direction: column;
    text-align: center;
  }
  .platform-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .plans-section {
    padding: 4rem 0;
  }
  .section-title {
    font-size: 2rem;
  }

  /* Ajuste de responsividade para o novo grid do footer */
  .footer-features-grid {
    grid-template-columns: 1fr; /* Stacks na vertical */
    gap: 1.5rem;
  }
  .footer-feature-item {
    gap: 1rem; /* Um pouco mais de espaço no mobile */
  }

  .plans-grid {
    display: flex;
    justify-content: center;
    padding-bottom: 0;
    margin: 0;
    max-width: none;
    grid-template-columns: none;
  }
  .plan-card {
    width: 100%;
    max-width: 400px;
  }
}

/* 🌟 ESTILOS DO FOOTER 🌟 */
.app-footer {
  width: 100%;
  padding: 2rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  position: relative;
  z-index: 10;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.footer-copyright {
  font-size: 0.875rem;
  color: var(--cinza-texto);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cinza-texto);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--azul-principal);
}

/* 💡 ESTILO ATUALIZADO (MAIS VISÍVEL) 💡 */
.footer-produced-by {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cinza-texto); /* 🎨 Cor mais visível */
  font-size: 0.875rem;
  /* 🎨 Opacidade removida */
}

.gr-logo {
  display: inline-flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

/* Estilo para o seu SVG/IMG */
.gr-logo .gr-logo-svg {
  height: 20px; /* Ajuste a altura conforme necessário */
  width: auto;
  margin-left: 0.25rem;
}

/* Responsividade do Novo Footer */
@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
  }

  .footer-copyright {
    order: 2; /* Copyright no meio */
  }

  .footer-links {
    order: 1; /* Links na esquerda */
  }

  .footer-produced-by {
    order: 3; /* Logo na direita */
  }
}
</style>
