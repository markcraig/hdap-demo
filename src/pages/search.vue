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
                        <v-text-field placeholder="Search" clearable v-model.trim="searchStore.basicSearchTerms"
                            @keyup.enter="basicSearch()"></v-text-field>
                    </v-container>
                </v-window-item>
                <v-window-item value="advanced">
                    <v-container class="bg-surface">
                        <v-row no-gutters>
                            <v-col cols="10">
                                <v-sheet class="pa-2 ma-2">
                                    <v-text-field label="Query filter" v-model="searchStore.advancedSearchQueryFilter"
                                        clearable @keyup.enter="advancedSearch()"></v-text-field>
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
                                    <v-text-field label="Base" v-model="searchStore.advancedSearchBase"
                                        clearable></v-text-field>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-select label="Scope" :items="['base', 'one', 'sub', 'subordinates']"
                                        v-model="searchStore.advancedSearchScope"></v-select>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-checkbox label="Count only"
                                        v-model="searchStore.advancedSearchCountOnly"></v-checkbox>
                                </v-sheet>
                            </v-col>
                            <v-col>
                                <v-sheet class="pa-2 ma-2">
                                    <v-checkbox label="Get operational fields"
                                        v-model="searchStore.advancedSearchOperationalFields"></v-checkbox>
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
            <v-data-table v-if="entries" :headers="headers" :items="entries" show-select v-model="selected"
                item-value="item._id">
                <!-- FixMe: How can these be generic? -->
                <template #item.action="{ item }" sortable="false">
                    <v-icon size="small" @click="editItem(item)">mdi-pencil</v-icon>
                    <v-icon size="small" @click="deleteItem(item)">mdi-delete</v-icon>
                </template>
                <template #item._id="{ item }">
                    <a :href="item._id.href">{{ item._id.text }}</a>
                </template>
                <template #item.cn="{ item }">
                    {{ item.cn }}
                </template>
                <template #item.mail="{ item }">
                    {{ item.mail }}
                </template>
                <template #item.manager="{ item }">
                    <span v-for="(link, index) in item.manager">
                        <a :href="link.href">{{ link.text }}</a><span
                            v-if="index != (item.manager.length - 1)"><br></span>
                    </span>
                </template>
                <template #item.uniqueMember="{ item }">
                    <span v-for="(link, index) in item.uniqueMember">
                        <a :href="link.href">{{ link.text }}</a><span
                            v-if="index != (item.uniqueMember.length - 1)"><br></span>
                    </span>
                </template>
            </v-data-table>
        </v-responsive>
    </v-container>
</template>

<script setup>
import { computed, defineModel, ref, watch } from 'vue'
import { useHdap } from '@/helpers/hdap'
import { useHdapStore } from '@/store/hdap'
import { useMessageStore } from '@/store/message'
import { useSearchStore } from '@/store/search'
import { useView } from '@/helpers/view'

const hdap = useHdap()
const hdapStore = useHdapStore()
const messageStore = useMessageStore()
const searchStore = useSearchStore()
const view = useView()

const tab = ref('basic')
const results = ref('')

onMounted(async () => {
    tab.value = searchStore.tab
    results.value = (tab.value == 'basic') ? searchStore.basicSearchResults : searchStore.advancedSearchResults
    await hdapStore.setServerCapabilities()
    const namingContexts = hdapStore.serverCapabilities.namingContexts
    if (namingContexts && !searchStore.advancedSearchBase) {
        searchStore.advancedSearchBase = namingContexts.sort()[0]
    }
})

const optionalColumns = ref(['cn', 'mail', 'manager', 'uniqueMember'])
const schemas = ref({
    'cn': JSON.parse('{"_id":"cn","supertype":"name","type":"array","uniqueItems":true,"items":{"type":"string"}}'),
    'mail': JSON.parse('{"_id":"mail","description":"The email address, including internationalized addresses (changed from the standard which only allowed ascii)","type":"array","uniqueItems":true,"items":{"type":"string"}}'),
    'manager': JSON.parse('{"_id":"manager","type":"array","uniqueItems":true,"items":{"type":"string","format":"json-pointer"}}'),
    'uniqueMember': JSON.parse('{"_id":"uniqueMember","type":"array","uniqueItems":true,"items":{"type":"path"}}')
})
const headers = computed(() => {
    let list = [{ title: 'Action', key: 'action' }, { title: 'ID', key: '_id' }]
    optionalColumns.value.forEach(column => {
        list.push({ title: view.entitle(column), key: column })
    })
    return list
})
const entries = computed(() => {
    if (!results.value) return []
    let formatted = []
    results.value.forEach(result => {
        let item = { action: '', _id: view.format('', '_id', result._id) }
        optionalColumns.value.forEach(column => {
            item[column] = (result[column]) ? view.format(schemas.value[column], column, result[column]) : null
        })
        formatted.push(item)
    })
    console.log(JSON.stringify(formatted))
    return formatted
})
const selected = defineModel()

async function basicSearch() {
    if (!searchStore.basicSearchTerms) {
        results.value = ''
        searchStore.basicSearchResults = ''
        return
    }
    const terms = searchStore.basicSearchTerms
    const filter = `cn co '${terms}' or uid eq '${terms}' or mail co '${terms}'`
    const params = { _fields: 'cn,mail,manager,uid,uniqueMember', scope: 'sub' }
    const json = await hdap.query('', filter, params, hdapStore.getCredentials())
    results.value = (json.result) ? json.result : ''
    searchStore.basicSearchResults = results.value
}

async function advancedSearch() {
    if (!searchStore.advancedSearchQueryFilter) {
        results.value = ''
        searchStore.advancedSearchResults = ''
        return
    }
    const base = searchStore.advancedSearchBase
    const filter = searchStore.advancedSearchQueryFilter
    const params = {
        _countOnly: searchStore.advancedSearchCountOnly,
        _fields: (searchStore.advancedSearchOperationalFields) ? '*,%2B' : '*',
        scope: searchStore.advancedSearchScope
    }
    const json = await hdap.query(base, filter, params, hdapStore.getCredentials())
    results.value = (json.result) ? json.result : ''
    searchStore.advancedSearchResults = results.value
}

async function deleteItem(item) {
    await hdap
        .remove(item.link, null, null, hdapStore.getCredentials())
        .catch(error => { messageStore.message = error.message })
    if (tab.value == 'basic') basicSearch()
    else advancedSearch()
}

async function bulkDelete() {
    await selected.value.forEach(async (id) => {
        await hdap
            .remove(id, null, null, hdapStore.getCredentials())
            .catch(error => { messageStore.message = error.message })
        selected.value.remove(id)
    })
    if (tab.value == 'basic') basicSearch()
    else advancedSearch()
}

function editItem(item) {
    alert('Not implemented yet')
}

function bulkEdit() {
    alert('Not implemented yet')
}

watch(tab, async (newTab) => {
    searchStore.tab = newTab
    results.value = (newTab == 'basic') ? searchStore.basicSearchResults : searchStore.advancedSearchResults
})

watch(optionalColumns, async () => {
    for (const column of optionalColumns.value) {
        schemas.value[column] = await hdap.getAttributeSchema(column)
    }
})
</script>
