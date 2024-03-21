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
import { ref } from 'vue'
import { useHdap } from '@/helpers/hdap'
import { useHdapStore } from '@/store/hdap'

const hdap = useHdap()
const hdapStore = useHdapStore()
const entry = ref('')
const attributes = ref([])

function formatValueAsString(value) {
    let result = value
    if (Object.prototype.toString.call(value) === '[object Array]') {
        // If at least one value is a JSON object, stringify the whole array.
        if (value.some(item => typeof item == 'object')) {
            result = JSON.stringify(value)
        } else {
            // Most attributes are multivalued, so format them as comma-separated lists.
            result = value.join(', ')
        }
    }
    return result
}

async function read() {
    const path = window.location.pathname.replace('/view/', '')
    entry.value = await hdap.read(path, null, hdapStore.getCredentials())
    for (const [key, value] of Object.entries(entry.value)) {
        attributes.value.push({ 'attribute': key, 'value': formatValueAsString(value) })
    }
}

read()
</script>
