import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const isSidebarCollapsed = ref(false)

    function toggleSidebar() {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    function setSidebarCollapsed(value) {
        isSidebarCollapsed.value = value
    }

    return {
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
    }
})
