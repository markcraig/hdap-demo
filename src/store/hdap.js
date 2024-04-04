import { defineStore } from 'pinia'
import { getCurrentInstance, onMounted, ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useHdap } from '@/helpers/hdap'

// FixMe: this store needs automated testing
export const useHdapStore = defineStore('hdapStore', () => {
    /*******************************
     * Internal fields and functions
     *******************************/

    let hdap = useHdap()
    let skipForTests = false

    if (getCurrentInstance()) {
        onMounted(() => {
            if (currentJwt.value && isJwtExpired()) {
                expireSession()
            }
            message.value = ''
        })
    }

    function expireSession(showMessage = false) {
        authenticatedUser.value = ''
        currentJwt.value = ''
        friendlyUserName.value = ''
        message.value = (showMessage) ? 'Session expired' : ''
    }

    function isJwtExpired() {
        return new Date(jwtDecode(currentJwt.value).exp * 1000) < new Date()
    }

    async function notifyError(message) {
        message.value = message
        throw new Error(message)
    }

    /*******************************
     * Exported fields and functions
     *******************************/

    /** Resource of the currently authenticated user. */
    const authenticatedUser = ref('')

    /** Bearer JWT token for authenticated user. */
    const currentJwt = ref('')

    /** The most human-readable name for the authenticated user. */
    const friendlyUserName = ref('')

    /** A human-readable message for the application user. */
    const message = ref('')

    /** The capablities of the HDAP server as indicated in the root DSE. */
    const serverCapabilities = ref('')

    /**
     * Returns the bearer token for the authenticated user, 
     * expiring the session if the token has expired.
     * @returns The bearer token for the authenticated user.
     */
    function getCredentials() {
        if (currentJwt.value) {
            if (isJwtExpired()) {
                expireSession()
                return {}
            }
            return { jwt: currentJwt.value }
        }
        return {}
    }

    /**
     * Performs authentication and returns the authenticated user resource.
     *
     * This store uses the access token for subsequent operations until it expires.
     * (HDAP default: 5 minutes)
     *  
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} password The password as a UTF-8 string
     * @returns The authenticated user resource.
     */
    async function login(id, password) {
        // Get and save a JWT until it expires.
        if (!id || !password) notifyError('You must set the resource identifier and the password')
        const token = await hdap.authenticate(id, password)
        if (!token) notifyError('Authentication failed')
        currentJwt.value = token.access_token
        setTimeout(() => { expireSession(true) }, token.expires_in * 1000)

        // Save the authenticated user and name to use in the UI.
        const user = await hdap.read(id, null, getCredentials())
        if (!user) notifyError('Could not read authenticated user resource')
        authenticatedUser.value = user
        friendlyUserName.value = (user.cn) ? user.cn[0] : (user.mail) ? user.mail[0] : id
        message.value = ''
        return user
    }

    /**
     * Resets the authentication state and returns to the home page; user is anonymous.
     */
    function logout() {
        expireSession()
        if (!skipForTests) this.router.push('/')
    }

    /**
     * Sets the message field.
     * @param {*} messageStr The new message string
     */
    function setMessage(messageStr) {
        message.value = messageStr
    }

    /**
     * Sets the server capabilities from the HDAP server.
     */
    async function setServerCapabilities() {
        serverCapabilities.value = await hdap.read('', { _fields: '*,%2B' }, null)
    }

    /**
     * Enables settings to run this store in test mode.
     */
    function setTestMode() {
        hdap = useHdap('http://localhost:3000/hdap')
        skipForTests = true
    }

    /**
     * Returns the resource of the authenticated user or an empty string if anonymous.
     * @returns The resource of the authenticated user or an empty string if anonymous.
     */
    function whoAmI() {
        return authenticatedUser.value
    }

    return {
        authenticatedUser,
        currentJwt,
        friendlyUserName,
        message,
        serverCapabilities,
        getCredentials,
        login,
        logout,
        setMessage,
        setServerCapabilities,
        setTestMode,
        whoAmI
    }
})
