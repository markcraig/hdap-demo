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
import { useMessageStore } from '@/store/message'
import { useView } from '@/helpers/view'

const hdap = useHdap()
const hdapStore = useHdapStore()
const messageStore = useMessageStore()
const view = useView()

const entry = ref('')
const attributes = ref([])

function format(attribute, value) {
    if (!entry.schema) return
    const schema = entry.schema.properties[attribute]
    return view.format(schema, attribute, value)
}

async function read() {
    const path = window.location.pathname.replace('/view/', '')
    entry.schema = await hdap.getSchema(path, null, hdapStore.getCredentials())
    if (entry.schema.type != 'object') {
        messageStore.message = `This page cannot display the result; got ${entry.schema.type}`
        return
    }
    entry.value = await hdap.read(path, null, hdapStore.getCredentials())
    for (const [attribute, value] of Object.entries(entry.value)) {
        attributes.value.push({ attribute: view.entitle(attribute), value: format(attribute, value) })
    }
}

read()
</script>
