import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const isSidebarCollapsed = ref(false)
    const isSubscriptionModalOpen = ref(false)

    function toggleSidebar() {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    function setSidebarCollapsed(value) {
        isSidebarCollapsed.value = value
    }

    function openSubscriptionModal() {
        isSubscriptionModalOpen.value = true
    }

    function closeSubscriptionModal() {
        isSubscriptionModalOpen.value = false
    }

    return {
        isSidebarCollapsed,
        isSubscriptionModalOpen,
        toggleSidebar,
        setSidebarCollapsed,
        openSubscriptionModal,
        closeSubscriptionModal,
    }
})
