<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-text-field placeholder="Search" clearable v-model.trim="terms" @keyup.enter="search()"></v-text-field>
            <v-data-table v-if="results" :items="entries">
                <template #item.link="{ item }">
                    <router-link :to="{ path: `/entry/${item.link}` }">
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
                        <router-link :to="{ path: `/entry/${one}` }">
                            {{ decodeURIComponent(one.split('/').pop()) }}
                        </router-link><span v-if="index != (item.manager.length - 1)">,</span>
                    </p>
                </template>
                <template #item.members="{ item }">
                    <p v-for="(member, index) in item.members">
                        <router-link :to="{ path: `/entry/${member}` }">
                            {{ decodeURIComponent(member.split('/').pop()) }}
                        </router-link><span v-if="index != (item.members.length - 1)">,</span>
                    </p>
                </template>
            </v-data-table>
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
const entries = computed(() => {
    if (!results) return []
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
        .catch((error) => { console.log(error) }) // FixMe: handle token expiry
}
</script>
