import { useMessageStore } from '@/store/message'

export const useHdap = (apiBase = '/hdap', useTestMode = false) => {
    /*******************************
     * Internal fields and functions
     *******************************/

    const messageStore = (useTestMode) ? { message: '' } : useMessageStore()

    async function action(name, id, optionalParams, body = {}, credentials = null) {
        if (!name) throw new Error('You must set the action name')
        const localParams = optionalParams || {}
        localParams['_action'] = name
        return doRequest('POST', id, getCommonHeaders(credentials), body, localParams)
    }

    async function doRequest(method, id, headers, body, params) {
        const options = { method: method }
        if (body) {
            const bodyString = JSON.stringify(body)
            const localHeaders = headers
            localHeaders['Content-Length'] = (new TextEncoder().encode(bodyString)).length
            options.headers = localHeaders
            options.body = bodyString
        } else {
            options.headers = headers
        }
        const queryString = (params) ? `?${new URLSearchParams(params)}` : ''
        return fetch(`${apiBase}/${id}${queryString}`, options)
            .then(response => returnJson(response))
    }

    function getCommonHeaders(credentials = null) {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        if (credentials) {
            if (credentials.jwt) {
                headers['Authorization'] = `Bearer ${credentials.jwt}`
            } else if (credentials.id && credentials.password) {
                const basicCreds = btoa(`${credentials.id}:${credentials.password}`)
                headers['Authorization'] = `Basic ${basicCreds}`
            }
        }
        return headers
    }

    async function put(id, resource, additionalHeaders, optionalParams, credentials = null) {
        if (!id || !resource) throw new Error('You must set the resource identifier and the resource')
        const headers = getCommonHeaders(credentials)
        for (const [key, value] of Object.entries(additionalHeaders)) {
            headers[key] = value
        }
        return doRequest('PUT', id, headers, resource, optionalParams)
    }

    async function returnJson(response) {
        if (!response.ok) {
            handleHttpError(response)
            return {}
        }
        return response.json()
    }

    async function handleHttpError(response) {
        let formalStatus
        let additionalInformation =''
        switch (response.status) {
            case 304:
                formalStatus = 'HTTP 304 Not Modified'
                break
            case 400:
                formalStatus = 'HTTP 400 Bad Request'
                break
            case 401:
                formalStatus = 'HTTP 401 Unauthorized'
                break
            case 403:
                formalStatus = 'HTTP 403 Forbidden'
                break
            case 404:
                formalStatus = 'HTTP 404 Not Found'
                break
            case 405:
                formalStatus = 'HTTP 405 Method Not Allowed'
                break
            case 406:
                formalStatus = 'HTTP 406 Not Acceptable'
                break
            case 409:
                formalStatus = 'HTTP 409 Conflict'
                break
            case 410:
                formalStatus = 'HTTP 410 Gone'
                break
            case 412:
                formalStatus = 'HTTP 412 Precondition Failed'
                break
            case 413:
                formalStatus = 'HTTP 413 Content Too Large'
                additionalInformation = 'Refine the search criteria to limit the number of results.'
                break
            case 415:
                formalStatus = 'HTTP 415 Unsupported Media Type'
                break
            case 428:
                formalStatus = 'HTTP 428 Precondition Required'
                break
            case 500:
                formalStatus = 'HTTP 500 Internal Server Error'
                break
            case 501:
                formalStatus = 'HTTP 501 Not Implemented'
                break
            case 503:
                formalStatus = 'HTTP 503 Service Unavailable'
                break
            default:
                formalStatus = `HTTP ${response.status} error`
        }
        const json = await response.json()
        messageStore.message = `${formalStatus}: ${json.message}. ${additionalInformation}`
    }

    /*******************************
     * Exported fields and functions
     *******************************/

    /**
     * Performs authentication and returns an access token.
     *
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} passwd The password as a UTF-8 string
     * @returns The access token.
     */
    async function authenticate(id, passwd) {
        if (!id || !passwd) throw new Error('You must set the resource identifier and the password')
        return await action('authenticate', id, {}, { password: passwd })
    }

    /**
     * Creates the specified resource.
     * 
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=newuser
     * @param {*} resource Resource object
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           manageDsaIT: true, passwordQualityAdvice: true, _prettyPrint: true, relax: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns The resource.
     */
    async function create(id, resource, optionalParams, credentials = null) {
        if (!id || !resource) throw new Error('You must set the resource identifier and the resource')
        return await put(id, resource, { 'If-None-Match': '*' }, optionalParams, credentials)
    }

    /**
     * Returns details about a user's ability to authenticate.
     *
     * Authenticate as a user with access to request the LDAP Account usability control, OID 1.3.6.1.4.1.42.2.27.9.5.8.
     * For details, refer to the HDAP docs.
     * 
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>, 
     *                           _prettyPrint: true }
     * @param {*} credentials Credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns An account usability resource.
     */
    async function getAccountUsability(id, optionalParams, credentials) {
        if (!id) throw new Error('You must set the resource identifier')
        return await action('accountUsability', id, optionalParams, {}, credentials)
    }

    /**
     * Returns the JSON schema for either the specified resource 
     * or a new child resource with the specified object classes.
     * 
     * For details, refer to the HDAP docs.
     * 
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} objectClasses An Array of object class name strings.
     * @param {*} optionalParams Optional parameters: { _fields: <field,field,...>, _prettyPrint: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns The JSON schema.
     */
    async function getSchema(id, objectClasses, optionalParams, credentials = null) {
        if (!id) throw new Error('You must set the resource identifier')
        const params = optionalParams || {}
        if (objectClasses) params['objectClasses'] = objectClasses.join(',')
        return await action('schema', id, params, {}, credentials)
    }

    /**
     * Changes the password of the resource with this identifier.
     *
     * Authenticate against the same user resource.
     * For details, refer to the HDAP docs.
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} currentPassword Current password as a UTF-8 string
     * @param {*} newPassword New password as a UTF-8 string
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           passwordQualityAdvice: true, _prettyPrint: true }
     * @param {*} credentials Credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns An empty resource.
     */
    async function modifyPassword(id, currentPassword, newPassword, optionalParams, credentials) {
        if (!id) throw new Error('You must set the resource identifier')
        if (!currentPassword || !newPassword) throw new Error('Provide both the current and new passwords')
        return await action('modifyPassword', id, optionalParams,
            { oldPassword: currentPassword, newPassword: newPassword }, credentials)
    }

    /**
     * Patches the specified resource.
     *
     * The patches are an array of patch operation objects:
     * <pre>
     * [{
     *  operation: 'One of `add`, `remove`, `replace`, or `increment`',
     *  field: 'JSON pointer to the target field in the resource',
     *  value: 'Required when the `operation` is `add` or `replace`'
     * }]
     * </pre>
     *
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} patches Array of patch operations; refer to the HDAP docs for additional details
     * @param {*} rev Specify the _rev value to perform the operation only if the rev matches
     *                the _rev of the existing resource (MVCC); otherwise, set this to null, '', or false
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           manageDsaIT: true, passwordQualityAdvice: true, _prettyPrint: true, relax: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns A Promise to fetch the resource.
     */
    async function patch(id, patches, rev, optionalParams, credentials = null) {
        if (!id || !patches) throw new Error('You must set the resource identifier and patches')
        const headers = getCommonHeaders(credentials)
        if (rev) headers['If-Match'] = rev
        return doRequest('PATCH', id, headers, patches, optionalParams)
    }

    /**
     * Searches the directory.
     * 
     * For details, refer to the HDAP docs.
     * 
     * @param {*} id Optional base resource identifier (_id) string, such as dc=com/dc=example/ou=People
     * @param {*} filter Optional query filter (default: match all resources in scope)
     * @param {*} optionalParams Optional parameters: { _countOnly: true, _fields: <field,field,...>,
     *                           _pagedResultsCookie: string, _pageSize: number, _prettyPrint: true, 
     *                           scope: `base` || `one` (default) || `sub` || `subordinates`,
     *                           _sortKeys: <field,field,...>, subentries: true
     *                           _totalPagedResultsPolicy: `ESTIMATE` || `EXACT` || `NONE` (default) }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns A Promise to the query result resource.
     */
    async function query(id, filter, optionalParams, credentials = null) {
        const params = optionalParams || {}
        params['_queryFilter'] = filter || true
        const headers = getCommonHeaders(credentials)
        if (params['_countOnly']) headers['Accept-API-Version'] = 'protocol=2.2,resource=1.0'
        return doRequest('GET', id, headers, null, params)
    }

    /**
     * Returns the specified resource.
     * 
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} optionalParams Optional parameters: { _fields: <field,field,...>,
     *                           manageDsaIT: true, _prettyPrint: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns A Promise to fetch the resource.
     */
    async function read(id, optionalParams, credentials = null) {
        let params = optionalParams
        if (!id || id == '/') { // Reading the root DSE; show operational attributes
            if (!params) params = {}
            params['_fields'] = (params['_fields']) ? `${params['_fields']},%2B` : `*,%2B`
        }
        return doRequest('GET', id, getCommonHeaders(credentials), null, params)
    }

    /**
     * Deletes the specified resource.
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} rev Specify the _rev value to perform the operation only if the rev matches
     *                the _rev of the existing resource (MVCC); otherwise, set this to null, '', or false
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           manageDsaIT: true, _prettyPrint: true, subtreeDelete: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns A Promise to fetch the resource.
     */
    async function remove(id, rev, optionalParams, credentials = null) {
        if (!id) throw new Error('You must set the resource identifier')
        const headers = getCommonHeaders(credentials)
        if (rev) headers['If-Match'] = rev
        return doRequest('DELETE', id, headers, {}, optionalParams)
    }

    /**
     * Changes the resource identifier.
     * 
     * @param {*} id Current resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} newId New resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=newuid
     * @param {*} optionalParams Optional parameters: { deleteOldRdn: true, dryRun: true, _fields: <field,field,...>,
     *                           manageDsaIT: true, _prettyPrint: true, relax: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns The resource.
     */
    async function rename(id, newId, optionalParams, credentials = null) {
        if (!id || !newId) throw new Error('Provide the current and new resource identifiers')
        return await action('rename', id, optionalParams, { newId: newId }, credentials)
    }

    /**
     * Resets the password of the resource to a generated value.
     *
     * Authenticate as a user with the `password-reset` privilege.
     * For details, refer to the HDAP docs.
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           passwordQualityAdvice: true, _prettyPrint: true }
     * @param {*} credentials Credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns A resource specifying the generated password.
     */
    async function resetPassword(id, optionalParams, credentials = null) {
        if (!id) throw new Error('You must set the resource identifier')
        return await action('resetPassword', id, optionalParams, {}, credentials)
    }

    /**
     * Updates the specified resource.
     * @param {*} id Resource identifier (_id) string, such as dc=com/dc=example/ou=People/uid=bjensen
     * @param {*} resource Resource object
     * @param {*} rev Specify the _rev value to perform the operation only if the rev matches
     *                the _rev of the existing resource (MVCC); otherwise, set this to null, '', or false
     * @param {*} optionalParams Optional parameters: { dryRun: true, _fields: <field,field,...>,
     *                           manageDsaIT: true, passwordQualityAdvice: true, _prettyPrint: true, relax: true }
     * @param {*} credentials Optional credentials, either {jwt: jwt} or {id: id, password: password}
     * @returns The resource.
     */
    async function update(id, resource, rev, optionalParams, credentials = null) {
        if (!id || !resource) throw new Error('You must set the identifier and resource')
        const additionalHeaders = (rev) ? { 'If-Match': rev } : { 'If-Match': '*' }
        return await put(id, resource, additionalHeaders, optionalParams, credentials)
    }

    return {
        authenticate,
        create,
        getAccountUsability,
        getSchema,
        modifyPassword,
        patch,
        query,
        read,
        remove, // delete is a JavaScript operator
        rename,
        resetPassword,
        update,
    }
}
