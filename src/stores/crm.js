// src/stores/crm.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  initiateWhatsAppConnection,
  checkWhatsAppStatus,
  logoutWhatsAppConnection,
} from '@/api/crm' // Importa as funções da API
import { useToast } from 'vue-toastification'

export const useCrmStore = defineStore('crm', () => {
  const toast = useToast()

  // --- STATE ---
  const status = ref('disconnected') // 'disconnected', 'initializing', 'qr_ready', 'connected'
  const qrCode = ref(null) // Armazena a Data URL do QR Code
  const isLoading = ref(false)
  const connections = ref([]) // Por enquanto, vamos manter uma lista simples
  let statusPollingInterval = null // ID do intervalo para polling

  // --- ACTIONS ---

  // Para de verificar o status
  function stopPolling() {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
      statusPollingInterval = null
      console.log('Polling parado.')
    }
  }

  // Verifica o status (usado no polling)
  async function checkStatus() {
    console.log('Verificando status...')
    try {
      const response = await checkWhatsAppStatus()
      const newStatus = response.data.status

      if (newStatus !== status.value) {
        console.log(`Status mudou para: ${newStatus}`)
        status.value = newStatus

        // Lógica de transição de status
        if (newStatus === 'connected') {
          qrCode.value = null // Limpa o QR Code se conectar
          stopPolling() // Para de verificar após conectar
          toast.success(response.data.message || 'WhatsApp conectado!')
          // Poderia buscar a lista de conexões aqui se a API retornasse
          connections.value = [{ id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }] // Mock de conexão ativa
        } else if (newStatus === 'disconnected') {
          qrCode.value = null
          stopPolling()
          toast.info(response.data.message || 'WhatsApp desconectado.')
          connections.value = [] // Limpa conexões
        } else if (status.value === 'initializing') {
            // Se ainda inicializando, continua o polling (talvez com intervalo menor?)
            stopPolling()
            statusPollingInterval = setInterval(checkStatus, 3000) // Tenta mais rápido
        } else if (status.value === 'qr_ready' && !statusPollingInterval) {
             // Se o status for qr_ready e não houver polling ativo, inicia
            startPolling()
        }
      } else if (newStatus === 'qr_ready' && !qrCode.value) {
          // Caso raro: status é qr_ready mas não temos o QR Code, tenta buscar de novo
          console.log("Status 'qr_ready' mas sem QR code, tentando buscar novamente.")
          stopPolling()
          await initiateConnection() // Chama a função que busca o QR code
      }


    } catch (error) {
      console.error('Erro ao verificar status:', error)
      toast.error('Erro ao verificar status da conexão.')
      // Considerar parar o polling em caso de erro grave?
      // stopPolling();
      // status.value = 'disconnected';
    }
  }

  // Inicia o polling para verificar o status
  function startPolling() {
    stopPolling() // Garante que só um polling esteja ativo
    console.log('Iniciando polling de status...')
    // Chama imediatamente e depois a cada 5 segundos
    checkStatus()
    statusPollingInterval = setInterval(checkStatus, 5000)
  }

  // Ação principal para iniciar conexão / obter QR Code
  async function initiateConnection() {
    isLoading.value = true
    qrCode.value = null
    status.value = 'initializing' // Assume inicializando primeiro
    stopPolling() // Para qualquer polling anterior
    console.log('Iniciando conexão...')

    try {
      const response = await initiateWhatsAppConnection()
      const apiStatus = response.data.status
      status.value = apiStatus // Atualiza o status com a resposta da API

      if (apiStatus === 'qr_ready') {
        qrCode.value = response.data.qrCode
        console.log('QR Code recebido.')
        startPolling() // Começa a verificar se foi escaneado
      } else if (apiStatus === 'connected') {
        console.log('Já estava conectado.')
        toast.info('A conexão WhatsApp já estava ativa.')
         connections.value = [{ id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }] // Mock
        // Não precisa de polling
      } else if (apiStatus === 'initializing') {
        console.log('Ainda inicializando, iniciando polling...')
        startPolling() // Continua verificando até o QR ficar pronto ou conectar
      } else {
         status.value = 'disconnected' // Se for um status inesperado
      }

    } catch (error) {
      console.error('Erro ao iniciar conexão:', error)
      toast.error(error.response?.data?.message || 'Falha ao iniciar conexão com WhatsApp.')
      status.value = 'disconnected'
    } finally {
      isLoading.value = false
    }
  }

  // Ação para deslogar
  async function logoutConnection() {
    isLoading.value = true
    stopPolling()
    console.log('Desconectando...')

    try {
      const response = await logoutWhatsAppConnection()
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = [] // Limpa lista
      toast.success(response.data.message || 'Sessão WhatsApp encerrada.')
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      toast.error(error.response?.data?.message || 'Falha ao desconectar do WhatsApp.')
      // Mesmo com erro, força o status para desconectado no frontend
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = []
    } finally {
      isLoading.value = false
    }
  }

   // Ação para buscar o status inicial ao carregar
   async function getInitialStatus() {
     isLoading.value = true;
     stopPolling(); // Limpa polls antigos
     console.log("Buscando status inicial...");
     try {
       const response = await checkWhatsAppStatus();
       status.value = response.data.status;
       console.log(`Status inicial: ${status.value}`);
       if (status.value === 'qr_ready') {
         // Se o status for QR, precisamos buscar o QR Code
         await initiateConnection(); // Chama a função que busca o QR
       } else if (status.value === 'initializing' || status.value === 'qr_ready') {
         startPolling(); // Inicia polling se estiver inicializando ou aguardando scan
       } else if (status.value === 'connected') {
          connections.value = [{ id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }]; // Mock
       } else {
         connections.value = [] // Garante lista vazia se desconectado
       }
     } catch (error) {
       console.error("Erro ao buscar status inicial:", error);
       toast.error("Não foi possível verificar o status da conexão inicial.");
       status.value = 'disconnected'; // Assume desconectado em caso de erro
       connections.value = []
     } finally {
       isLoading.value = false;
     }
   }

  // --- RETURN ---
  return {
    status,
    qrCode,
    isLoading,
    connections, // Expor a lista
    initiateConnection,
    logoutConnection,
    getInitialStatus, // Expor a função de busca inicial
    stopPolling, // Expor para usar no onUnmounted do componente
  }
})
