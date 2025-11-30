# Guia de Integração Stripe (Frontend)

## 1. Criar Sessão de Checkout

Para iniciar o processo de assinatura, o frontend deve fazer uma requisição para o novo endpoint:

*   **URL:** `POST /subscriptions/create-checkout-session`
*   **Auth:** Requer Token Bearer (usuário logado).
*   **Body:** `{}` (vazio)
*   **Resposta Sucesso:**
    ```json
    {
      "url": "https://checkout.stripe.com/c/pay/..."
    }
    ```

**Ação do Frontend:**
Ao receber a resposta, redirecione o navegador do usuário para a URL retornada (`window.location.href = response.data.url`).

## 2. Retorno do Checkout

O Stripe redirecionará o usuário de volta para o frontend nas seguintes URLs (configuradas no backend):

*   **Sucesso:** `/app?success=true`
*   **Cancelamento:** `/app?canceled=true`

**Ação do Frontend:**
*   Verifique os parâmetros da URL na rota `/app`.
*   Se `success=true`: Exiba uma mensagem de "Assinatura realizada com sucesso!".
*   Se `canceled=true`: Exiba uma mensagem de "Assinatura cancelada ou não finalizada.".

## 3. Status da Assinatura

O status da assinatura do usuário (ativo, pendente, etc.) é atualizado via Webhook (backend).

**Ação do Frontend:**
*   Ao carregar o usuário (ex: `/auth/me`), verifique o campo `subscriptionStatus`.
*   Se `subscriptionStatus === 'active'`, libere o acesso às funcionalidades premium.