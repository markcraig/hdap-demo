<template>
  <v-main>
    <v-alert v-if="store.message" title="Info" type="info" closable>{{ store.message }}</v-alert>
    <router-view />
  </v-main>
</template>

<script setup>
import { useAppStore } from '@/store/app'
const store = useAppStore()
</script>
