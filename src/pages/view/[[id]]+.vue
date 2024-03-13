<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-data-table :items="attributes" :items-per-page="-1">
                <template #bottom></template>
            </v-data-table>
        </v-responsive>
    </v-container>
</template>

<script setup>
import axios from 'axios'
import { useAppStore } from '@/store/app'
import { ref } from 'vue'

const store = useAppStore()
const entry = ref('')
const attributes = ref([])

function read() {
    const path = window.location.pathname.replace('/view', '/hdap')
    const config = store.addAuthzHeader({ headers: { 'Content-Type': 'application/json' } })
    // Get operational attributes if this is the Root DSE.
    if (/^\/hdap\/?$/.test(path)) {
        config.params = { _fields: '*,%2B' }
    }

    axios.get(path, config)
        .then((res) => {
            entry.value = res.data
            for (const [key, value] of Object.entries(entry.value)) {
                attributes.value.push({ 'attribute': key, 'value': formatValueAsString(value) })
            }
        })
        .catch((error) => { store.handleAuthError(error) })
}

function formatValueAsString(value) {
    let result = ''
    if (Object.prototype.toString.call(value) === '[object Array]') {
        // If at least one value is a JSON object, stringify the whole array.
        if (value.some(item => typeof item == 'object')) {
            result = JSON.stringify(value)
        } else {
            // Most attributes are multivalued, so format them as comma-separated lists.
            result = value.join(', ')
        }
    } else {
        result = value
    }
    return result
}

read()
</script>
