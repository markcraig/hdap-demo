<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-text-field placeholder="Search" clearable v-model.trim="terms"
                @keyup.enter="search()"></v-text-field>
        </v-responsive>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'

const terms = ref('')
function search() {
    alert(`Searching for ${terms.value}`)
}
</script>
