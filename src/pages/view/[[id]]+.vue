<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-data-table :headers="headers" :items="attributes" :items-per-page="-1">
                <template v-slot:item="{ item }">
                    <tr>
                        <td>{{ item.title }}</td>
                        <td>
                            <Viewer :schema="item.content.schema" :attribute="item.content.attribute"
                                :value="item.content.value" />
                        </td>
                    </tr>
                </template>
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
const headers = [{ title: 'Field', key: 'title' }, { title: 'Value', key: 'content' }]
const attributes = ref([])

async function read() {
    const path = window.location.pathname.replace('/view/', '')
    entry.schema = await hdap.getSchema(path, null, hdapStore.getCredentials())
    if (entry.schema.type != 'object') {
        messageStore.message = `This page cannot display the result; got ${entry.schema.type}`
        return
    }
    entry.value = await hdap.read(path, null, hdapStore.getCredentials())
    for (const [attribute, value] of Object.entries(entry.value)) {
        attributes.value.push({
            title: view.entitle(attribute),
            content: {
                schema: entry.schema.properties[attribute],
                attribute: attribute,
                value: value
            }
        })
    }
}

read()
</script>
