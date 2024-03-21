<template>
  <v-main>
    <v-alert v-if="hdapStore.message" title="Info" type="info" closable>{{ hdapStore.message }}</v-alert>
    <router-view />
  </v-main>
</template>

<script setup>
import { useHdapStore } from '@/store/hdap'
const hdapStore = useHdapStore()
</script>
