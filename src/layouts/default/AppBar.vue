<template>
  <v-app-bar>
    <template v-slot:prepend>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </template>
   
    <v-app-bar-title>
      HDAP demo
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn text="Search" icon="mdi-magnify"></v-btn>
      <v-btn text="My account" icon="mdi-account-outline"></v-btn>
      <v-btn text="More..." icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
//
</script>
