import { expect, test } from 'vitest'
import { useView } from '@/helpers/view'

const view = useView()

test('_id should format as a link', () => {
    const idSchema = null
    const idValue = "dc=com/dc=example/ou=People/uid=bjensen"
    const result = view.format(idSchema, '_id', idValue)
    expect(result.props.href).toEqual(`/view/${idValue}`)
})

test('manager should format as a div of links', () => {
    const managerSchema = JSON.parse('{"_id":"manager","type":"array","uniqueItems":true,"items":{"type":"string","format":"json-pointer"}}')
    const managerValue = JSON.parse('["dc=com/dc=example/ou=People/uid=trigden"]')
    const result = view.format(managerSchema, 'manager', managerValue)
    expect(result.children[0].props.href).toEqual(`/view/${managerValue[0]}`)
})

test('postal address should format as a comma-separated string', () => {
    const postalAddressSchema = JSON.parse('{"_id":"postalAddress","type":"array","uniqueItems":true,"items":{"type":"array","items":{"type":"string"}}}')
    const postalAddressValue = JSON.parse('[["Aaccf Amar","31206 Spring Street","Harrisonburg, IL  04284"]]')
    const result = view.format(postalAddressSchema, 'postalAddress', postalAddressValue)
    expect(result.children[0].children).toEqual('Aaccf Amar, 31206 Spring Street, Harrisonburg, IL  04284')
})

test('uniqueMember should format as a div of links with separators', () => {
    const uniqueMemberSchema = JSON.parse('{"_id":"uniqueMember","type":"array","uniqueItems":true,"items":{"type":"path"}}')
    const uniqueMemberValue = JSON.parse('["dc=com/dc=example/ou=People/uid=kvaughan","dc=com/dc=example/ou=People/uid=rdaugherty"]')
    const result = view.format(uniqueMemberSchema, 'uniqueMember', uniqueMemberValue)
    expect(result.children[2].props.href).toEqual('/view/dc=com/dc=example/ou=People/uid=rdaugherty')
})

test('_postalAddressTESTAttribute should entitle to Postal address TEST attribute', () => {
    const attr = '_postalAddressTESTAttribute'
    expect(view.entitle(attr)).toEqual('Postal address TEST attribute')
})