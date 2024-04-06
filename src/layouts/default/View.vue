<template>
  <v-main>
    <v-alert v-if="messageStore.message" :text="messageStore.message" icon="mdi-information-outline" title="Info"
      type="info" closable @click:close="messageStore.message = ''"></v-alert>
    <router-view />
  </v-main>
</template>

<script setup>
import { useMessageStore } from '@/store/message'
const messageStore = useMessageStore()
</script>
