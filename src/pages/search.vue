<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-text-field placeholder="Search" clearable v-model.trim="terms" @keyup.enter="search()"></v-text-field>
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
        </v-responsive>
    </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHdap } from '@/helpers/hdap'
import { useHdapStore } from '@/store/hdap'

const hdap = useHdap()
const hdapStore = useHdapStore()
const terms = ref('')
const results = ref('')
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
</script>
