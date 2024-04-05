<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-tabs v-model="tab">
                <v-tab value="basic">Basic search</v-tab>
                <v-tab value="advanced">Advanced search</v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item value="basic">
                    <v-container class="bg-surface">
                        <v-text-field placeholder="Search" clearable v-model.trim="terms"
                            @keyup.enter="search()"></v-text-field>
                    </v-container>
                </v-window-item>
                <v-window-item value="advanced">
                    <v-container class="bg-surface">
                        <v-row no-gutters>
                            <v-col cols="10">
                                <v-sheet class="pa-2 ma-2">
                                    <v-text-field label="Query filter" v-model="queryFilter" clearable
                                        @keyup.enter="advancedSearch()"></v-text-field>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-container>
                                        <a href="https://backstage.forgerock.com/docs/ds/7.5/rest-guide/query-rest.html"
                                            class="text-decoration-none" target="_blank">
                                            More info
                                            <v-icon align-right>mdi-open-in-new</v-icon>
                                        </a>
                                    </v-container>
                                </v-sheet>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-text-field label="Base" v-model="base" clearable></v-text-field>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-select label="Scope" :items="scopes" v-model="scope"></v-select>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-checkbox label="Count only" v-model="countOnly"></v-checkbox>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-checkbox label="Get operational fields" v-model="operationalFields"></v-checkbox>
                                </v-sheet>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-window-item>
            </v-window>
            <v-btn v-if="selected && selected.length" prepend-icon="mdi-pencil" @click="bulkEdit()">
                Bulk edit
            </v-btn>
            <v-btn v-if="selected && selected.length" prepend-icon="mdi-delete" @click="bulkDelete()">
                Bulk delete
            </v-btn>
            <v-data-table v-if="results" :items="entries" item-value="link" show-select v-model="selected"
                select-strategy="page">
                <template #item.action="{ item }" sortable="false">
                    <v-icon size="small" @click="editItem(item)">mdi-pencil</v-icon>
                    <v-icon size="small" @click="deleteItem(item)">mdi-delete</v-icon>
                </template>
                <template #item.link="{ item }">
                    <router-link :to="{ path: `/view/${item.link}` }">
                        {{ decodeURIComponent(item.link.split('/').pop()) }}
                    </router-link>
                </template>
                <template #item.name="{ item }">
                    <p v-for="(one, index) in item.name">
                        {{ one }}<span v-if="index != (item.name.length - 1)">,</span>
                    </p>
                </template>
                <template #item.mail="{ item }">
                    <p v-for="(one, index) in item.mail">
                        <a target="_blank" :href="`mailto:${one}`">
                            {{ one }}
                        </a><span v-if="index != (item.mail.length - 1)">,</span>
                    </p>
                </template>
                <template #item.manager="{ item }">
                    <p v-for="(one, index) in item.manager">
                        <router-link :to="{ path: `/view/${one}` }">
                            {{ decodeURIComponent(one.split('/').pop()) }}
                        </router-link><span v-if="index != (item.manager.length - 1)">,</span>
                    </p>
                </template>
                <template #item.members="{ item }">
                    <p v-for="(member, index) in item.members">
                        <router-link :to="{ path: `/view/${member}` }">
                            {{ decodeURIComponent(member.split('/').pop()) }}
                        </router-link><span v-if="index != (item.members.length - 1)">,</span>
                    </p>
                </template>
            </v-data-table>
        </v-responsive>
    </v-container>
</template>

<script setup>
import { computed, defineModel, ref } from 'vue'
import { useHdap } from '@/helpers/hdap'
import { useHdapStore } from '@/store/hdap'

const hdap = useHdap()
const hdapStore = useHdapStore()
const tab = ref('basic')
const terms = ref('')
const results = ref('')
const entries = computed(() => {
    if (!results.value) return []
    let formatted = []
    results.value.forEach(result => {
        formatted.push({
            action: '',
            link: result._id,
            name: result.cn,
            mail: result.mail,
            manager: result.manager,
            members: result.uniqueMember
        })
    })
    return formatted
})
const selected = defineModel()

const namingContexts = computed(() => { return hdapStore.serverCapabilities.namingContexts.sort() })
const base = ref(namingContexts.value[0])
const queryFilter = ref('true')
const scopes = ref(['base', 'one', 'sub', 'subordinates'])
const scope = ref('one')
const countOnly = ref(false)
const operationalFields = ref(false)

async function search() {
    if (!terms.value) {
        results.value = ''
        return
    }
    const filter = `cn co '${terms.value}' or uid eq '${terms.value}' or mail co '${terms.value}'`
    const params = { _fields: 'cn,mail,manager,uid,uniqueMember', scope: 'sub' }
    const json = await hdap.query('', filter, params, hdapStore.getCredentials())
    results.value = (json.result) ? json.result : []
}

async function advancedSearch() {
    if (!queryFilter.value) {
        results.value = ''
        return
    }
    const params = {
        _countOnly: countOnly.value,
        _fields: (operationalFields.value) ? '*,%2B' : '*',
        scope: scope.value
    }
    const json = await hdap.query(base.value, queryFilter.value, params, hdapStore.getCredentials())
    results.value = (json.result) ? json.result : []
}

async function deleteItem(item) {
    await hdap
        .remove(item.link, null, null, hdapStore.getCredentials())
        .catch(error => { hdapStore.setMessage(error.message) })
    search()
}

async function bulkDelete() {
    await selected.value.forEach(async (id) => {
        await hdap
            .remove(id, null, null, hdapStore.getCredentials())
            .catch(error => { hdapStore.setMessage(error.message) })
        selected.value.remove(id)
    })
    search()
}

function editItem(item) {
    alert('Not implemented yet')
}

function bulkEdit() {
    alert('Not implemented yet')
}
</script>
