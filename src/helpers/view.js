import { h } from 'vue'

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

    function getLastRdnDecoded(dn) {
        return decodeURIComponent(dn.split('/').pop())
    }

    function formatBestEffort(value, attribute = null) {
        if (attribute == '_id') return h('a', { href: `/view/${value}` }, getLastRdnDecoded(value))
        return (Object.prototype.toString.call(value) === '[object Array]')
            ? h('span', value.join(', '))
            : h('span', value)
    }

    function formatValue(type, format, value) {
        switch (type) {
            case 'array':
                return h('span', value.join(', '))
            case 'object':
                return h('code', JSON.stringify(value))
            case 'null':
                return ''
            case 'path':
                return h('a', { href: `/view/${value}` }, getLastRdnDecoded(value))
            case 'string':
                return (format == 'json-pointer')
                    ? h('a', { href: `/view/${value}` }, getLastRdnDecoded(value))
                    : h('span', value)
            case 'boolean':
            case 'number':
            case 'integer':
                return h('span', value)
            default:
                return formatBestEffort(value)
        }
    }

    /**
     * Returns a virtual node, possibly with children.
     * @param {*} schema    The JSON schema for the attribute
     * @param {*} attr      The attribute name, such as 'cn'
     * @param {*} value     The attribute value, such as [ 'Barbara Jensen', 'Babs Jensen' ]
     * @returns A virtual node, possibly with children.
     */
    function format(schema, attr, value) {
        if (!schema) return formatBestEffort(value, attr)
        switch (schema.type) {
            case 'array':
                const separator = (schema.items.type == 'array'
                    || schema.items.type == 'path'
                    || schema.items.format == 'json-pointer') ? 'newline' : 'comma'
                const items = value.map(val => formatValue(schema.items.type, schema.items.format, val))
                const children = []
                const separators = Array.from({ length: items.length }).map(() => {
                    return (separator == 'newline') ? h('br') : h('span', ', ')
                })
                for (let i = 0; i < items.length; ++i) {
                    children.push(items[i])
                    children.push(separators[i])
                }
                children.pop()  // Last separator
                return h('div', children)
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
