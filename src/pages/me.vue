<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <div v-if="message">{{ message }}</div>
        </v-responsive>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useHdapStore } from '@/store/hdap'
import { useRouter } from 'vue-router'

const message = ref('')
const hdapStore = useHdapStore()
const router = useRouter()

async function updatePage() {
    const user = await hdapStore.whoAmI()
    if (user && user._id) {
        router.push({ path: `/view/${user._id}` })
    } else {
        message.value = 'Log in to access your account.'
    }
}

updatePage()
</script>
