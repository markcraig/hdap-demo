<template>
    <v-menu v-model="display" location="end" activator="parent" :close-on-content-click="false">
        <template v-if="hdapStore.authenticatedUser">
            <v-card class="mx-auto pa-12 pb-8" rounded="lg" elevation="8" min-width="500px">
                <v-card-title>Hi {{ hdapStore.friendlyUserName }}!</v-card-title>
                <v-card-subtitle>Welcome to the HDAP demo</v-card-subtitle>
                <v-list>
                    <v-list-item prepend-icon="mdi-account-outline" link @click="display = false" href="/me"
                        class="text-decoration-none">
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
            <v-card class="mx-auto pa-12 pb-8" title="Login" rounded="lg" elevation="8" min-width="500px"
                text="Enter your credentials to authenticate:">
                <v-tabs v-model="tab">
                    <v-tab value="first">Email</v-tab>
                    <v-tab value="second">ID</v-tab>
                </v-tabs>
                <v-window v-model="tab">
                    <v-window-item value="first">
                        <v-form fast-fail @submit.prevent="loginWithEmail()">
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
                            </v-card-actions>
                        </v-form>
                    </v-window-item>
                    <v-window-item value="second">
                        <v-form fast-fail @submit.prevent="loginWithId()">
                            <v-text-field prepend-inner-icon="mdi-identifier" v-model="id"
                                label="Resource identifier"></v-text-field>
                            <v-text-field v-model="password" prepend-inner-icon="mdi-lock"
                                :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'" :type="showPwd ? 'text' : 'password'"
                                :rules="passwordRules" counter label="Password"
                                @click:append="showPwd = !showPwd"></v-text-field>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn variant="text" @click="display = false"> Cancel </v-btn>
                                <v-btn class="mt-2" @click="display = false" text="Login" type="submit" block></v-btn>
                            </v-card-actions>
                        </v-form>
                    </v-window-item>
                </v-window>
            </v-card>
        </template>
    </v-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useHdap } from '@/helpers/hdap'
import { useHdapStore } from '@/store/hdap'
import { useMessageStore } from '@/store/message'
import { useSearchStore } from '@/store/search'

const hdap = useHdap()
const hdapStore = useHdapStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()

// UI settings
let display = ref(false)
const tab = ref('first')
const showPwd = ref(false)
const emailRules = ref([value => { return (value) ? true : 'You must enter an email.' }])
const passwordRules = ref([value => { return (value) ? true : 'You must enter a password.' }])

// User settings
const email = ref('bjensen@example.com')
const id = ref('dc=com/dc=example/ou=People/uid=bjensen')
const password = ref('hifalutin')
// const id = ref('uid=admin')
// const password = ref('password')

async function findId(email, password) {
    if (!email || !password) return ''
    const filter = `mail eq '${email}' or uid eq '${email}'`
    const params = { _fields: '_id,cn', scope: 'sub' }
    const json = await hdap.query('', filter, params)
    return (json) ? json.result[0]._id : ''
}

async function loginWithEmail() {
    try {
        findId(email.value, password.value)
            .then(resourceId => {
                id.value = resourceId
                loginWithId()
            })
    } catch (error) {
        messageStore.message = error.message
    }
}

async function loginWithId() {
    try {
        hdapStore.login(id.value, password.value)
            .then(user => {
                if (!user) {
                    messageStore.message = 'Failed to log in'
                    return
                } else {
                    location.reload()
                }
            })
    } catch (error) {
        messageStore.message = error.message
    }
}

function logout() {
    searchStore.$reset()
    hdapStore.logout()
    location.reload()
}
</script>
