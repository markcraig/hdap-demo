import { createApp } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useHdapStore } from '@/store/hdap'
import { beforeEach, describe, expect, it } from 'vitest'

let hdapStore
const validCreds = { id: 'uid=admin', password: 'password' }

describe('HDAP store', () => {
    beforeEach(() => {
        const pinia = createPinia()
        createApp({}).use(pinia)
        setActivePinia(pinia)
        hdapStore = useHdapStore()
        hdapStore.setTestMode()
    })

    it('get credentials before login should be empty', () => {
        expect(hdapStore.getCredentials()).toEqual({})
    })

    it('login with valid credentials should return a user', async () => {
        const user = await hdapStore.login(validCreds.id, validCreds.password)
        expect(user._id).toEqual(validCreds.id)
        expect(hdapStore.whoAmI()).toBeTruthy()
    })

    it('logout should succeed', async () => {
        expect(await hdapStore.login(validCreds.id, validCreds.password)).toBeTruthy()
        expect(hdapStore.logout()).toBeFalsy()
        expect(hdapStore.whoAmI()).toBeFalsy()
    })

    it('namingContexts should include dc=com/dc=example', async () => {
        await hdapStore.setServerCapabilities()
        expect(hdapStore.serverCapabilities.namingContexts).toContain('dc=com/dc=example')
    })
})
