<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-text-field placeholder="Search" clearable v-model.trim="terms" @keyup.enter="search()"></v-text-field>
            <p v-if="results && results?.length === 0">No result found</p>
            <template v-if="results?.length > 0">
            <v-card>
                <v-tabs v-model="tab" bg-color="outline">
                    <v-tab value="table">Table</v-tab>
                    <v-tab value="graph">Graph</v-tab>
                </v-tabs>
                <v-card-text>
                    <v-window v-model="tab">
                        <v-window-item value="table">
                            <v-data-table v-if="results" :items="entries">
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
                        </v-window-item>
                        <v-window-item value="graph">
                            <Tree v-if="results" :data=results @nodeSelected="nodeSelected" />
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
            </template>
        </v-responsive>
    </v-container>
</template>

<script setup>
import axios from 'axios'
import { useAppStore } from '@/store/app'
import { computed, ref } from 'vue'

const store = useAppStore()
const terms = ref('')
const results = ref('')
const tab = ref('graph')
const entries = computed(() => {
    if (!results.value) return []
    let formatted = []
    results.value.forEach(result => {
        formatted.push({
            link: result._id,
            name: result.cn,
            mail: result.mail,
            manager: result.manager,
            members: result.uniqueMember
        })
    })
    return formatted
})

function search() {
    if (!terms.value) results.value = []
    let config = store.addAuthzHeader({
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            _queryFilter: `cn co '${terms.value}' or uid eq '${terms.value}' or mail co '${terms.value}'`,
            _fields: 'cn,mail,manager,uid,uniqueMember',
            scope: 'sub'
        }
    })
    axios.get('/hdap', config)
        .then((res) => { results.value = (res.data.result) ? res.data.result : [] })
        .catch((error) => { store.handleAuthError(error) })
}

function nodeSelected(uid) {
    terms.value = uid;
    search();
}

</script>
