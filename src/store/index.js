// Utilities
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { markRaw } from 'vue'
import router from '@/router'

export default createPinia()
    .use(createPersistedState({ auto: true }))
    .use(({ store }) => { store.router = markRaw(router) })
