<template>
  <v-app>
    <DefaultBar />

    <DefaultView />
  </v-app>
</template>

<script setup>
import DefaultBar from './default/AppBar.vue'
import DefaultView from './default/View.vue'
import { useTheme } from 'vuetify'
const theme = useTheme()

// Let the theme depend on the system setting:
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  theme.global.name.value = event.matches ? 'dark' : 'light'
})
</script>
