// src/stores/crm.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  initiateWhatsAppConnection, // GET /api/crm/qrcode
  checkWhatsAppStatus, // GET /api/crm/status
  logoutWhatsAppConnection, // POST /api/crm/logout
} from '@/api/crm'
import { useToast } from 'vue-toastification'

export const useCrmStore = defineStore('crm', () => {
  const toast = useToast()

  const status = ref('disconnected') // 'disconnected', 'initializing', 'creating_qr', 'qrcode_pending', 'qrcode', 'connected'
  const qrCode = ref(null)
  const isLoading = ref(false) // Loading para ações do usuário (iniciar, logout)
  const isPolling = ref(false) // Controla se o polling de /status está ativo
  const connections = ref([]) // Lista simplificada por enquanto
  let statusPollingInterval = null
  let isFetchingQrCode = false // Flag para evitar chamadas múltiplas a fetchQrCode
  let initializingDisconnectRetryCount = 0 // Contador para retentativas após disconnected durante initializing

  function stopPolling() {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
      statusPollingInterval = null
      isPolling.value = false
      console.log('Polling /status parado.')
    }
  }

  // Busca o QR Code (chamado APENAS quando /status retorna qrcode_pending ou o status interno já é qrcode mas qrCode.value está nulo)
  async function fetchQrCode() {
    if (isFetchingQrCode) {
      console.log('fetchQrCode: Já está buscando o QR Code.')
      return
    }
    isFetchingQrCode = true
    console.log('fetchQrCode: Buscando QR Code via GET /qrcode...')
    try {
      // GET /qrcode é chamado aqui
      const response = await initiateWhatsAppConnection() // Esta é a chamada para /api/crm/qrcode
      // ✅ Verifica se a resposta contém o status 'qrcode' e o qrCode
      if (response.data.status === 'qrcode' && response.data.qrCode) {
        qrCode.value = response.data.qrCode
        status.value = 'qrcode' // Atualiza o status interno para 'qrcode' para exibir na tela
        console.log('fetchQrCode: QR Code recebido e armazenado. Status interno atualizado para "qrcode".')
        // Mantém o polling de /status ativo para detectar conexão/desconexão
        if (!isPolling.value) {
          console.log('fetchQrCode: Polling estava parado, reiniciando.')
          startPolling() // Reinicia se parou inesperadamente
        }
      } else {
        // Se /qrcode não retornar 'qrcode', pode ter conectado/desconectado rapidamente.
        console.log(
          'fetchQrCode: Resposta inesperada ao buscar QR Code via /qrcode:',
          response.data.status,
        )
        // O polling de /status (que deve estar rodando) vai corrigir o estado.
        // Apenas limpa o QR code local se ele existir, para evitar exibir um QR antigo.
        if (qrCode.value) {
           qrCode.value = null;
        }
        // Garante que o polling continue caso tenha parado
         if (!isPolling.value) startPolling(500)
      }
    } catch (error) {
      console.error('fetchQrCode: Erro ao buscar QR Code via /qrcode:', error)
      toast.error('Falha ao obter QR Code.')
      status.value = 'disconnected' // Erro grave
      qrCode.value = null // Limpa QR code em caso de erro
      stopPolling()
    } finally {
      isFetchingQrCode = false
    }
  }

async function checkStatus() {
  if (isLoading.value) return // Não executa se isLoading=true (ação do usuário em progresso)

  console.log('checkStatus: Verificando via GET /status...')
  try {
    const response = await checkWhatsAppStatus() // GET /status
    const newApiStatus = response.data.status
    const previousStatus = status.value // Status interno ANTES da chamada

    console.log(
      `checkStatus: Status API = ${newApiStatus} | Status Interno Anterior = ${previousStatus}`,
    )

    // Lógica para desconexão durante inicialização (mantida)
    if (
      previousStatus === 'initializing' &&
      newApiStatus === 'disconnected' &&
      initializingDisconnectRetryCount < 3
    ) {
      initializingDisconnectRetryCount++
      console.warn(
        `checkStatus: API retornou 'disconnected' durante 'initializing'. Tentativa ${initializingDisconnectRetryCount}/3. Mantendo polling.`,
      )
      stopPolling()
      startPolling(1500) // Tenta novamente um pouco mais rápido
      return
    }
    if (previousStatus === 'initializing' && newApiStatus !== 'disconnected') {
      initializingDisconnectRetryCount = 0
    }


    // Atualiza o status interno APENAS SE NECESSÁRIO e gerencia o polling/fetchQrCode
    switch (newApiStatus) {
      case 'connected':
        if (previousStatus !== 'connected') {
           status.value = 'connected'
           toast.success(response.data.message || 'WhatsApp conectado!')
           connections.value = [ { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }] // Mock
        }
        qrCode.value = null
        stopPolling()
        initializingDisconnectRetryCount = 0
        break

      case 'disconnected':
         if (previousStatus !== 'disconnected' && (previousStatus !== 'initializing' || initializingDisconnectRetryCount >= 3)) {
           status.value = 'disconnected'
           toast.info(response.data.message || 'WhatsApp desconectado.')
           connections.value = []
         }
        qrCode.value = null
        // Só para o polling se não estivermos na fase de retry pós-initializing
        if (previousStatus !== 'initializing' || initializingDisconnectRetryCount >= 3) {
          stopPolling()
          initializingDisconnectRetryCount = 0 // Reseta após parar
        } else {
          console.log('checkStatus: Mantendo polling apesar do status disconnected (retry).')
        }
        break

      case 'creating_qr':
        if (previousStatus !== 'creating_qr') {
          status.value = 'creating_qr'
          qrCode.value = null // Limpa QR code antigo se houver
           console.log("checkStatus: Status 'creating_qr'. Reiniciando polling a cada 2 segundos.")
           stopPolling() // Para o polling atual
           startPolling(2000) // Reinicia com intervalo de 2 segundos
        }
        initializingDisconnectRetryCount = 0
        break

      // ✅ LÓGICA CORRIGIDA PARA 'qrcode_pending'
      case 'qrcode_pending':
        // Atualiza o status interno se ele mudou
        if (previousStatus !== 'qrcode_pending') {
          status.value = 'qrcode_pending';
          qrCode.value = null; // Limpa QR antigo
        }

        // **SEMPRE** tenta buscar o QR code se o status da API for pending,
        // não tivermos o QR localmente e não houver busca em andamento.
        if (!qrCode.value && !isFetchingQrCode) {
          console.log("checkStatus: Status 'qrcode_pending'. Iniciando busca pelo QR Code.");
          fetchQrCode(); // Chama para buscar o QR Code
        } else if (qrCode.value) {
           console.log("checkStatus: Status 'qrcode_pending', mas já temos um QR code local. Aguardando conexão ou expiração.")
        }

        // Garante que o polling continue no intervalo padrão (ou reinicia se necessário)
        if (!isPolling.value || statusPollingInterval === null || statusPollingInterval?._repeat !== 5000) {
            stopPolling();
            startPolling(5000); // Garante polling padrão
        }
        initializingDisconnectRetryCount = 0;
        break


      // Caso a API retorne 'qrcode' diretamente (raro), tratamos como 'qrcode_pending' para buscar a string
      case 'qrcode':
         console.warn("checkStatus: API retornou 'qrcode' diretamente. Tratando como 'qrcode_pending' para buscar a string.")
         status.value = 'qrcode_pending' // Trata como pending para forçar a busca
         qrCode.value = null
         if (!isFetchingQrCode) {
             fetchQrCode()
         }
         // Garante que o polling continue no intervalo padrão
          if (!isPolling.value || statusPollingInterval === null || statusPollingInterval?._repeat !== 5000) {
              stopPolling()
              startPolling(5000)
          }
         initializingDisconnectRetryCount = 0
         break


      case 'initializing':
        if (previousStatus !== 'initializing') {
          status.value = 'initializing'
          qrCode.value = null
          console.log("checkStatus: Status 'initializing'. Reiniciando polling a cada 2 segundos.")
          stopPolling()
          startPolling(2000) // Intervalo mais rápido durante inicialização
        }
        // Reseta o contador se acabou de vir de disconnected
        if (previousStatus === 'disconnected') initializingDisconnectRetryCount = 0
        break

      default:
        initializingDisconnectRetryCount = 0
        console.warn('checkStatus: Status inesperado recebido da API /status:', newApiStatus)
        if (previousStatus !== newApiStatus) {
          status.value = newApiStatus // Atualiza mesmo se for desconhecido
        }
         if (!isPolling.value) startPolling(5000) // Mantém polling padrão por segurança
    }

  } catch (error) {
    console.error('checkStatus: Erro no polling de status via /status:', error)
    initializingDisconnectRetryCount = 0 // Reseta no erro
    if (error.response?.status !== 404) {
      toast.error('Erro ao verificar status da conexão.')
    } else {
      console.log('checkStatus /status: Sessão não encontrada (404), tratando como desconectado.')
    }
    // Trata erro de rede ou 404 como desconectado
    if (status.value !== 'disconnected') {
       status.value = 'disconnected'
       qrCode.value = null
       connections.value = []
    }
    stopPolling()
  }
}


  // --- O RESTANTE DAS FUNÇÕES (startPolling, initiateOrResetConnection, logoutConnection, getInitialStatus) ---
  // --- permanecem iguais ao código que você forneceu anteriormente ---

  // Inicia o polling para verificar o status
  function startPolling(interval = 5000) {
    stopPolling() // Limpa anterior
    isPolling.value = true
    console.log(`startPolling: Iniciando polling a cada ${interval}ms...`)
    // Roda a primeira verificação um pouco depois para dar tempo à API
    setTimeout(checkStatus, 500)
    statusPollingInterval = setInterval(checkStatus, interval)
  }

  // Ação principal para iniciar conexão / resetar
  async function initiateOrResetConnection() {
    if (isLoading.value) return // Previne clique duplo
    isLoading.value = true
    qrCode.value = null
    status.value = 'initializing' // Define OTIMISTICAMENTE
    stopPolling()
    initializingDisconnectRetryCount = 0 // Reseta o contador ao iniciar
    console.log('initiateOrResetConnection: Chamando GET /status primeiro...')

    try {
      // 1. Chama GET /status PRIMEIRO
      const statusResponse = await checkWhatsAppStatus()
      console.log('initiateOrResetConnection: Resposta inicial de /status:', statusResponse.data)

      // Se já conectado ou já tem QR pendente/pronto, não chama /qrcode
      if (statusResponse.data.status === 'connected') {
        status.value = 'connected'
        toast.info('WhatsApp já está conectado.')
        connections.value = [
          { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' },
        ] // Mock
        isLoading.value = false
        return // Sai da função
      }
      // Se for qrcode_pending, inicia o polling e deixa ele chamar fetchQrCode
      if (statusResponse.data.status === 'qrcode_pending') {
          status.value = 'qrcode_pending'
          console.log(
            'initiateOrResetConnection: Status inicial qrcode_pending, iniciando polling...',
          )
          startPolling(5000) // Inicia polling para monitorar e buscar QR
          isLoading.value = false // Loading termina aqui, polling assume
          return // Sai da função
      }
      // Se for qrcode (API já tem o QR), também trata como pending para buscar
       if (statusResponse.data.status === 'qrcode') {
           status.value = 'qrcode_pending' // Força pending para buscar
           console.log(
             'initiateOrResetConnection: Status inicial qrcode (raro), tratando como pending para buscar QR...',
           )
           startPolling(5000) // Inicia polling para monitorar e buscar QR
           isLoading.value = false // Loading termina aqui, polling assume
           return // Sai da função
       }
      // Se for creating_qr ou initializing, inicia polling rápido
       if (statusResponse.data.status === 'creating_qr' || statusResponse.data.status === 'initializing') {
            status.value = statusResponse.data.status
            console.log(
              `initiateOrResetConnection: Status inicial ${status.value}, iniciando polling rápido...`,
            )
            startPolling(2000) // Inicia polling para monitorar
            isLoading.value = false // Loading termina aqui, polling assume
            return // Sai da função
       }

      // Se for disconnected, prossegue para chamar /qrcode para gerar um novo
      console.log('initiateOrResetConnection: Status inicial disconnected. Chamando GET /qrcode para iniciar/resetar...')
      // 2. Chama GET /qrcode para iniciar o processo no backend
      // A resposta aqui pode ser 'creating_qr' ou 'qrcode_pending'
      const initiateResponse = await initiateWhatsAppConnection()
      const initialStatusFromInitiate = initiateResponse.data.status;
      console.log('initiateOrResetConnection: Resposta de GET /qrcode:', initiateResponse.data)

      // Define o status inicial baseado na resposta do /qrcode
      status.value = initialStatusFromInitiate;

      // Inicia o polling imediatamente para descobrir o estado real
      if (initialStatusFromInitiate === 'creating_qr' || initialStatusFromInitiate === 'initializing') {
         startPolling(2000) // Intervalo curto no início se estiver criando/inicializando
      } else {
         startPolling(5000) // Intervalo padrão caso contrário (ex: qrcode_pending)
         // Se a resposta JÁ foi qrcode_pending, pode tentar buscar o QR imediatamente
         if (initialStatusFromInitiate === 'qrcode_pending' && !isFetchingQrCode) {
             fetchQrCode();
         }
      }

    } catch (error) {
      console.error('initiateOrResetConnection: Erro:', error)
      toast.error(error.response?.data?.message || 'Falha ao iniciar conexão com WhatsApp.')
      status.value = 'disconnected' // Reverte para desconectado
      stopPolling()
    } finally {
      //isLoading é setado para false dentro do startPolling/stopPolling ou no erro
      if (!isPolling.value) isLoading.value = false // Garante que tira o loading se o polling não iniciar
    }
  }

  // Ação para deslogar
  async function logoutConnection() {
    if (isLoading.value) return
    isLoading.value = true
    stopPolling()
    initializingDisconnectRetryCount = 0
    console.log('logoutConnection: Desconectando via POST /logout...')
    try {
      const response = await logoutWhatsAppConnection()
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = []
      toast.success(response.data.message || 'Sessão WhatsApp encerrada.')
    } catch (error) {
      console.error('logoutConnection: Erro ao desconectar:', error)
      toast.error(error.response?.data?.message || 'Falha ao desconectar do WhatsApp.')
      // Mesmo em erro, assumimos desconectado no frontend
      status.value = 'disconnected'
      qrCode.value = null
      connections.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Ação para buscar o status inicial ao carregar
  async function getInitialStatus() {
    stopPolling() // Garante que não haja polling anterior rodando
    initializingDisconnectRetryCount = 0
    console.log('getInitialStatus: Buscando status inicial via GET /status...')
    isLoading.value = true // Ativa o loading inicial
    try {
      // Chama checkStatus que contém toda a lógica de tratamento de status e início/parada do polling
      await checkStatus()
    } catch (e) {
      // Erros específicos de rede ou API já são tratados dentro de checkStatus
      console.error("getInitialStatus: Erro durante a busca inicial de status.", e)
      // Garante que o estado seja 'disconnected' em caso de falha na primeira busca
      if(status.value !== 'disconnected') {
        status.value = 'disconnected'
        qrCode.value = null
        connections.value = []
      }
    } finally {
      isLoading.value = false // Desativa o loading inicial APÓS a primeira verificação
      console.log("getInitialStatus: Busca inicial completa. Status atual:", status.value, "Polling ativo:", isPolling.value);

    }
  }


  return {
    status,
    qrCode,
    isLoading,
    isPolling,
    connections,
    initiateOrResetConnection,
    logoutConnection,
    getInitialStatus,
    stopPolling, // Expor stopPolling pode ser útil para debug ou casos específicos
  }
})
