<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-card :text="`${JSON.stringify(entry)}`"></v-card>
        </v-responsive>
    </v-container>
</template>

<script setup>
import axios from 'axios'
import { useAppStore } from '@/store/app'
import { ref } from 'vue'

const store = useAppStore()
const entry = ref('')

function read() {
    const path = window.location.pathname.replace('/entry', '/hdap')
    const config = store.addAuthzHeader({ headers: { 'Content-Type': 'application/json' } })

    axios.get(path, config)
        .then((res) => { entry.value = res.data })
        .catch((error) => { console.log(error) }) // FixMe: handle token expiry
}

read()
</script>
