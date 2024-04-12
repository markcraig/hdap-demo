export const useView = () => {
    /**
     * Returns a sentence-case, title-friendly name for an attribute name. 
     * @param {*} name      The attribute name, such as 'postalAddress'
     * @returns A sentence-case, title-friendly name for an attribute name. 
     */
    function entitle(name) {
        switch (name) {
            case '_id':
                return 'ID'
            case '_rev':
                return 'Revision'
            default:
                let ti = name
                    .replace(/^_/, '')                      // Strip leading _
                    .replace(/(?<![A-Z])([A-Z])/g, ' $1')   // Space before lone UC
                    .replace(/([A-Z][^A-Z])/g, ' $1',)      // Space after acronym
                    .replace(/[ ]+/g, ' ')                  // Single spaced words
                    .trim()
                ti = ti.split(' ').map(word => (word === word.toUpperCase()) ? word : word.toLowerCase()).join(' ')
                return ti.charAt(0).toUpperCase() + ti.slice(1) // UC first letter
        }
    }

    function formatBestEffort(value, attribute = null) {
        if (attribute == '_id') return { href: `/view/${value}`, text: decodeURIComponent(value) }
        return (Object.prototype.toString.call(value) === '[object Array]') ? value.join(', ') : value
    }

    function formatValue(type, format, value) {
        switch (type) {
            case 'array':
                return value.join(', ')
            case 'object':
                return JSON.stringify(value)
            case 'null':
                return ''
            case 'path':
                return { href: `/view/${value}`, text: decodeURIComponent(value) }
            case 'string':
                return (format == 'json-pointer')
                    ? { href: `/view/${value}`, text: decodeURIComponent(value) }
                    : value
            case 'boolean':
            case 'number':
            case 'integer':
                return value
            default:
                return formatBestEffort(value)
        }
    }

    /**
     * Returns either an array of objects or single object like { href: optional-href, text: text-value }.
     * @param {*} schema    The JSON schema for the attribute
     * @param {*} attr      The attribute name, such as 'cn'
     * @param {*} value     The attribute value, such as [ 'Barbara Jensen', 'Babs Jensen' ]
     * @returns Either an array of objects or single object like { href: optional-href, text: text-value }.
     */
    function format(schema, attr, value) {
        if (!schema) return formatBestEffort(value, attr)
        switch (schema.type) {
            case 'array':
                if (schema.items.type == 'path' || schema.items.format == 'json-pointer') {
                    return value.map(val => formatValue(schema.items.type, schema.items.format, val))
                }
                const separator = (schema.items.type == 'array') ? '\n' : ', '
                return value.map(val => formatValue(schema.items.type, schema.items.format, val)).join(separator)
            case 'boolean':
            case 'integer':
            case 'null':
            case 'number':
            case 'object':
            case 'string':
                return formatValue(schema.type, schema.format, value)
            default:
                return formatBestEffort(value)
        }
    }

    return {
        entitle,
        format
    }
}
