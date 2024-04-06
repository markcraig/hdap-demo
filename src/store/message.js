import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessageStore = defineStore('messageStore', () => {
    /** A human-readable message for the application user. */
    const message = ref('')

    return { message }
})
