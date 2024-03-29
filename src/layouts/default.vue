<template>
  <v-app>
    <DefaultBar />

    <DefaultView />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import DefaultBar from './default/AppBar.vue'
import DefaultView from './default/View.vue'
import { useHdapStore } from '@/store/hdap'
import { useTheme } from 'vuetify'

const hdapStore = useHdapStore()
const theme = useTheme()

onMounted(async () => {
  await hdapStore.setServerCapabilities()
})

// Let the theme depend on the system setting:
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  theme.global.name.value = event.matches ? 'dark' : 'light'
})
</script>
