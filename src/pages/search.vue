<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-text-field placeholder="Search" clearable v-model.trim="terms" @keyup.enter="search()"></v-text-field>
            <v-sheet>{{ results }}</v-sheet>
        </v-responsive>
    </v-container>
</template>

<script setup>
import axios from 'axios'
import { useAppStore } from '@/store/app'
import { ref } from 'vue'

const store = useAppStore()
const terms = ref('')
const results = ref('')

function search() {
    if (!terms.value) results.value = []
    let config = store.addAuthzHeader({
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            _queryFilter: `cn co '${terms.value}' or uid eq '${terms.value}' or mail co '${terms.value}'`,
            _fields: 'cn,description,givenName,mail,manager,sn,uid,uniqueMember',
            scope: 'sub'
        }
    })
    axios.get('/hdap', config)
        .then((res) => { results.value = (res.data.result) ? res.data.result : [] })
        .catch((error) => { console.log(error) })
}
</script>
