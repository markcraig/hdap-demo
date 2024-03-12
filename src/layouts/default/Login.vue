<template>
    <v-menu v-model="display" location="end" activator="parent" :close-on-content-click="false">
        <template v-if="store.authenticated">
            <v-card class="mx-auto pa-12 pb-8" rounded="lg" elevation="8" min-width="500px">
                <v-card-title>Hi {{ store.fullName || email }}!</v-card-title>
                <v-card-subtitle>Welcome to the HDAP demo</v-card-subtitle>
                <v-list>
                    <v-list-item prepend-icon="mdi-account-outline" link :href="`/view/${store.dn}`" @click="display = false" class="text-decoration-none">
                        My profile
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-cog-outline" link href="/settings" @click="display = false">
                        Settings
                    </v-list-item>
                </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="display = false"> Cancel </v-btn>
                    <v-btn class="mt-2" @click="display = false; logout()" block>Logout</v-btn>
                </v-card-actions>
            </v-card>
        </template>
        <template v-else>
            <v-card class="mx-auto pa-12 pb-8" title="Login" text="Enter your email and password to authenticate:"
                rounded="lg" elevation="8" min-width="500px">
                <v-form fast-fail @submit.prevent="login">
                    <v-text-field prepend-inner-icon="mdi-email" v-model="email" :rules="emailRules"
                        label="E-mail"></v-text-field>
                    <v-text-field v-model="password" prepend-inner-icon="mdi-lock"
                        :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'" :type="showPwd ? 'text' : 'password'"
                        :rules="passwordRules" counter label="Password"
                        @click:append="showPwd = !showPwd"></v-text-field>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn variant="text" @click="display = false"> Cancel </v-btn>
                        <v-btn class="mt-2" @click="display = false" text="Login" type="submit" block></v-btn>
                    </v-card-actions> </v-form>
            </v-card>
        </template>
    </v-menu>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref } from 'vue'

const store = useAppStore()
let display = ref(false)
const email = ref('bjensen@example.com')
const password = ref('hifalutin')
const emailRules = ref([value => { return (value) ? true : 'You must enter an email.' }])
const passwordRules = ref([value => { return (value) ? true : 'You must enter a password.' }])
const showPwd = ref(false)

async function login() {
    await store.login(email.value, password.value)
}

function logout() {
    store.logout()
}
</script>
