import apiClient from '@/api/index'

export const createCheckoutSession = () => {
    return apiClient.post('/subscriptions/create-checkout-session', {})
}
