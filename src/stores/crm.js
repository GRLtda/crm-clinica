import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  initiateWhatsAppConnection,
  checkWhatsAppStatus,
  logoutWhatsAppConnection,

} from '@/api/crm'
import { useToast } from 'vue-toastification'

export const useCrmStore = defineStore('crm', () => {
  const toast = useToast()

  const status = ref('disconnected')
  const qrCode = ref(null) // Armazena a string base64 atual
  const isLoading = ref(false) // Loading geral da store/ações
  const isPolling = ref(false)
  const connections = ref([])
  let statusPollingInterval = null
  let currentPollingIntervalDuration = 0
  let isFetchingQrCodeApi = false // Renomeado para clareza: buscando da API
  let initializingDisconnectRetryCount = 0
  const isLoadingQrImage = ref(false) // Novo: controla o loading da imagem

  function stopPolling() {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
      statusPollingInterval = null
      isPolling.value = false
      currentPollingIntervalDuration = 0
    }
  }

  function startPolling(interval = 5000) {
    stopPolling()
    if (interval <= 0) return

    currentPollingIntervalDuration = interval
    isPolling.value = true
    setTimeout(checkStatus, 500) // Chama checkStatus imediatamente após iniciar o polling
    statusPollingInterval = setInterval(checkStatus, interval)
  }

  // Modificado para usar isLoadingQrImage
  async function fetchQrCode() {
    if (isFetchingQrCodeApi) {
      return
    }
    isFetchingQrCodeApi = true
    isLoadingQrImage.value = true // Indica que estamos buscando/carregando
    try {
      const response = await initiateWhatsAppConnection()
      if (response.data.status === 'qrcode' && response.data.qrCode) {
        // Pré-carrega a imagem antes de atualizar o ref principal
        const newQrBase64 = response.data.qrCode
        const img = new Image();
        img.onload = () => {
          qrCode.value = newQrBase64 // Atualiza o QR code principal
          if (status.value !== 'qrcode') {
             status.value = 'qrcode' // Define o status se não estiver
          }
          isLoadingQrImage.value = false // Carregamento da imagem concluído
        };
        img.onerror = () => {
           toast.error('Falha ao carregar a imagem do QR Code.');
           isLoadingQrImage.value = false;
           // Mantém o status como qrcode_pending para tentar de novo
           status.value = 'qrcode_pending'
           if (currentPollingIntervalDuration !== 4000) {
              startPolling(4000); // Garante que o polling continue
           }
        };
        img.src = newQrBase64; // Inicia o carregamento

      } else {
        // Se a API não retornou QR code, indica que não está mais carregando
        isLoadingQrImage.value = false
      }
    } catch (error) {
      toast.error('Falha ao obter QR Code da API.')
      isLoadingQrImage.value = false // Falha no carregamento
      if (status.value !== 'disconnected') {
         status.value = 'disconnected'
      }
      qrCode.value = null // Limpa QR em caso de erro na API
      stopPolling()
    } finally {
      isFetchingQrCodeApi = false
    }
  }

async function checkStatus() {

    try {
      const response = await checkWhatsAppStatus()
      const newApiStatus = response.data.status
      const previousInternalStatus = status.value

      // Lógica para lidar com desconexão durante inicialização
      if (
        previousInternalStatus === 'initializing' &&
        newApiStatus === 'disconnected' &&
        initializingDisconnectRetryCount < 3 // Tenta 3 vezes antes de desistir
      ) {
        initializingDisconnectRetryCount++
        return // Continua esperando, não atualiza o status ainda
      }
      // Reseta a contagem se o status mudou ou não é mais desconectado
      if (previousInternalStatus === 'initializing' && newApiStatus !== 'disconnected') {
        initializingDisconnectRetryCount = 0
      }


      // Se o status da API mudou em relação ao nosso estado interno
      if (newApiStatus !== previousInternalStatus) {
        status.value = newApiStatus // Atualiza o estado interno

        switch (newApiStatus) {
          case 'connected':
            qrCode.value = null // Limpa QR code
            isLoadingQrImage.value = false // Garante que não está carregando imagem
            toast.success(response.data.message || 'WhatsApp conectado!')
            // Idealmente, a API deveria retornar os detalhes da conexão
            connections.value = [ { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' }]
            stopPolling() // Para o polling quando conectado
            initializingDisconnectRetryCount = 0 // Reseta contagem
            break;
          case 'disconnected':
            qrCode.value = null // Limpa QR code
            isLoadingQrImage.value = false // Garante que não está carregando imagem
            // Só mostra toast e limpa conexões se não estava tentando inicializar OU se já tentou 3 vezes
            if (previousInternalStatus !== 'initializing' || initializingDisconnectRetryCount >= 3) {
                 toast.info(response.data.message || 'WhatsApp desconectado.')
                 connections.value = [] // Limpa a lista de conexões
                 stopPolling() // Para o polling quando desconectado
                 initializingDisconnectRetryCount = 0 // Reseta contagem
            }
            // Se estava inicializando e ainda não tentou 3 vezes, o status interno será 'disconnected'
            // mas o polling continuará (se foi iniciado por initiateOrResetConnection)
            break;
          case 'creating_qr':
          case 'initializing':
            qrCode.value = null // Limpa QR code
            isLoadingQrImage.value = false // Garante que não está carregando imagem
            initializingDisconnectRetryCount = 0 // Reseta contagem
            // Inicia ou ajusta o polling para ser mais rápido (2 segundos)
            if (currentPollingIntervalDuration !== 2000) {
              startPolling(2000)
            }
            break;
          case 'qrcode_pending': // Novo status intermediário da API?
          case 'qrcode':
            initializingDisconnectRetryCount = 0 // Reseta contagem
            status.value = 'qrcode_pending'; // Define como pendente primeiro
            isLoadingQrImage.value = !qrCode.value; // Mostra loading só se NÃO tiver um QR code ainda
            // Inicia ou ajusta o polling para 4 segundos
            if (currentPollingIntervalDuration !== 4000) {
              startPolling(4000)
            }
            // Busca o QR Code se não estiver buscando OU mesmo se já tiver um (para atualizar)
            if (!isFetchingQrCodeApi) {
              fetchQrCode()
            }
            break;
          default:
             isLoadingQrImage.value = false // Garante limpeza para status desconhecido
             initializingDisconnectRetryCount = 0 // Reseta contagem
             // Se o status for desconhecido, volta ao polling padrão (5 segundos)
             if (currentPollingIntervalDuration !== 5000) {
               startPolling(5000)
             }
        }
      } else {
        // Status da API é o mesmo do interno. Verifica se precisa agir.
        if ((newApiStatus === 'qrcode_pending' || newApiStatus === 'qrcode') && !isFetchingQrCodeApi) {
           // Se continua pendente ou qrcode, e não estamos buscando, busca de novo
           // Isso garante que o QR é atualizado ou tenta buscar se a tentativa anterior falhou
           isLoadingQrImage.value = !qrCode.value; // Mostra loading se ainda não tivermos um QR
           fetchQrCode()
        }
        // Garante que o polling correto está rodando caso tenha sido interrompido
        else if (['creating_qr', 'initializing'].includes(newApiStatus) && currentPollingIntervalDuration !== 2000) {
            startPolling(2000); // Garante polling rápido
        } else if (['qrcode_pending', 'qrcode'].includes(newApiStatus) && currentPollingIntervalDuration !== 4000) {
             // Garante polling para QR code, só reinicia se o intervalo estiver errado
             if (!isPolling.value) startPolling(4000);
        } else if (!isPolling.value && !['connected', 'disconnected'].includes(newApiStatus)) {
            // Se não está conectado/desconectado e o polling parou por algum motivo, reinicia
            startPolling(currentPollingIntervalDuration || 5000); // Usa o último intervalo ou padrão
        }
      }

    } catch (error) {
      initializingDisconnectRetryCount = 0 // Reseta contagem no erro
      isLoadingQrImage.value = false // Garante que não está carregando imagem
      // Ignora erro 404 (pode significar que a sessão ainda não existe no backend)
      if (error.response?.status !== 404) {
        toast.error('Erro ao verificar status da conexão.')
      }
      // Define como desconectado se já não estiver
      if (status.value !== 'disconnected') {
         status.value = 'disconnected'
         qrCode.value = null // Limpa QR code
         connections.value = [] // Limpa conexões
      }
      stopPolling() // Para o polling em caso de erro
    }
  }


  async function initiateOrResetConnection() {
    if (isLoading.value) return // Evita múltiplas chamadas
    isLoading.value = true // Indica início da ação principal
    qrCode.value = null // Limpa QR code antigo
    isLoadingQrImage.value = false // Garante que não está carregando imagem
    status.value = 'initializing' // Define status inicial
    stopPolling() // Para qualquer polling anterior
    initializingDisconnectRetryCount = 0 // Reseta a contagem de retentativas

    try {
      // 1. Verifica o status atual ANTES de tentar iniciar
      const statusResponse = await checkWhatsAppStatus()

      // Se já estiver conectado, apenas atualiza o estado e informa
      if (statusResponse.data.status === 'connected') {
        status.value = 'connected'
        toast.info('WhatsApp já está conectado.')
        connections.value = [
          { id: 1, name: 'WhatsApp Principal', number: 'Desconhecido', status: 'connected' },
        ]
        // Não inicia polling aqui
      }
      // Se já existe um QR pendente ou sendo criado, apenas ajusta o polling
      else if (statusResponse.data.status === 'qrcode_pending' || statusResponse.data.status === 'qrcode') {
          status.value = 'qrcode_pending' // Define como pendente
          isLoadingQrImage.value = true // Assume que vai carregar um novo QR
          startPolling(4000) // Inicia polling para QR code
          // O fetchQrCode será chamado pelo checkStatus dentro do startPolling
      } else if (statusResponse.data.status === 'creating_qr' || statusResponse.data.status === 'initializing') {
          status.value = statusResponse.data.status // Mantém o status da API
          startPolling(2000) // Inicia polling rápido
      }
      // Se estiver desconectado ou em outro estado, TENTA iniciar uma nova conexão
      else {
          const initiateResponse = await initiateWhatsAppConnection()
          const initialStatusFromInitiate = initiateResponse.data.status;
          status.value = initialStatusFromInitiate; // Atualiza o status com a resposta do initiate

          // Se a resposta for criando/inicializando, polling rápido
          if (initialStatusFromInitiate === 'creating_qr' || initialStatusFromInitiate === 'initializing') {
             startPolling(2000)
          } else {
             // Se for qrcode_pending (ou qrcode direto), polling para QR
             isLoadingQrImage.value = true // Assume que vai carregar
             startPolling(4000)
             // Se o status já veio como pendente, tenta buscar o QR imediatamente
             if (initialStatusFromInitiate === 'qrcode_pending' && !isFetchingQrCodeApi) {
                 fetchQrCode();
             }
             // Se veio 'qrcode' direto com a base64 (pouco provável no initiate), o checkStatus cuidará disso
          }
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao iniciar conexão com WhatsApp.')
      status.value = 'disconnected' // Volta para desconectado em caso de erro
      isLoadingQrImage.value = false // Garante que não está carregando imagem
      stopPolling() // Para o polling
    } finally {
      isLoading.value = false // Indica fim da ação principal
    }
  }

  async function logoutConnection() {
    if (isLoading.value) return
    isLoading.value = true
    stopPolling() // Para o polling antes de desconectar
    initializingDisconnectRetryCount = 0 // Reseta contagem
    try {
      const response = await logoutWhatsAppConnection()
      status.value = 'disconnected' // Define como desconectado
      qrCode.value = null // Limpa QR code
      isLoadingQrImage.value = false // Garante que não está carregando imagem
      connections.value = [] // Limpa lista de conexões
      toast.success(response.data.message || 'Sessão WhatsApp encerrada.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao desconectar do WhatsApp.')
      // Mesmo em erro, força o estado para desconectado
      status.value = 'disconnected'
      qrCode.value = null
      isLoadingQrImage.value = false
      connections.value = []
    } finally {
      isLoading.value = false
    }
  }

  // ✨ NOVA ACTION ✨
  async function getInitialStatus() {
    stopPolling() // Garante que não há polling rodando
    initializingDisconnectRetryCount = 0 // Reseta contagem
    isLoading.value = true // Define loading geral
    isLoadingQrImage.value = false // Reset inicial
    try {
      await checkStatus() // Chama a função que busca o status da API
      // O checkStatus já vai atualizar o 'status', 'qrCode', 'connections'
      // e iniciar o polling se necessário.
    } catch (e) {
      // Se checkStatus falhar (exceto 404 que é tratado dentro dele)
      if(status.value !== 'disconnected') {
        status.value = 'disconnected' // Garante que o status seja 'disconnected'
        qrCode.value = null
        isLoadingQrImage.value = false
        connections.value = []
      }
    } finally {
      isLoading.value = false // Finaliza o loading geral
    }
  }


  return {
    status,
    qrCode,
    isLoading,
    isPolling,
    connections,
    isLoadingQrImage, // Expor novo estado
    initiateOrResetConnection,
    logoutConnection,
    getInitialStatus, // ✨ Expor a nova action ✨
    stopPolling, // Expor stopPolling se necessário em outros lugares
  }
})
