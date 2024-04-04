<template>
  <v-app-bar>
    <template v-slot:prepend>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>
      <v-breadcrumbs icon="mdi-sitemap-outline" :items="breadcrumbs"></v-breadcrumbs>
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn text="Search" icon link href="/search">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn text="My account" icon>
        <v-icon>mdi-account-outline</v-icon>
        <DefaultLogin />
      </v-btn>
      <v-btn text="More..." icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import DefaultLogin from './Login.vue'
import { computed, onMounted, ref } from 'vue'
import { useHdapStore } from '@/store/hdap'
import router from '@/router';

const hdapStore = useHdapStore()
const namingContexts = computed(() => { return hdapStore.serverCapabilities.namingContexts })
const home = [{ title: 'Home', disabled: false, href: '/' }]
const breadcrumbs = ref(home)

onMounted(() => {
  resetBreadcrumbs(namingContexts.value)
})

router.afterEach(() => {
  resetBreadcrumbs(namingContexts.value)
})

function resetBreadcrumbs(namingContextDns) {
  breadcrumbs.value = home
  if (!namingContextDns) return

  const currentPath = window.location.pathname
  // The first path component is for the router, not for HDAP.
  const base = currentPath.split('/')[1]
  if (base) {
    const href = (base == 'view') ? `/view/` : `/${base}`
    breadcrumbs.value.push({ title: capitalizeFirstLetter(base), disabled: false, href: href })
  }

  // The rest is an HDAP ID:
  const hdapId = currentPath.split('/').slice(2).join('/')
  if (!hdapId) return
  // A naming context DN should be a single breadcrumb.
  let finished = false
  namingContextDns.forEach(dn => {
    if (hdapId.startsWith(dn)) {
      let href = `/${base}/${dn}`
      breadcrumbs.value.push({ title: dn, disabled: false, href: href })
      hdapId.replace(dn, '').split('/').forEach(element => {
        if (element) {
          href += `/${element}`
          breadcrumbs.value.push({ title: element, disabled: false, href: href })
        }
      })
      finished = true
    }
  })
  // The HDAP ID is for a non-public naming context.
  if (!finished) {
    let href = `/${base}`
    hdapId.split('/').forEach(element => {
      href += `/${element}`
      breadcrumbs.value.push({ title: element, disabled: false, href: href })
    })
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>
