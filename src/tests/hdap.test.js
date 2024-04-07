import { expect, test } from 'vitest'
import { useHdap } from '@/helpers/hdap'

const hdap = useHdap('http://localhost:3000/hdap', true) // Run HDAP and `npm run dev` locally
const adminCreds = { id: 'uid=admin', password: 'password' }

test('authentication should succeed with valid credentials', async () => {
    expect(await hdap.authenticate(adminCreds.id, adminCreds.password)).toHaveProperty('access_token')
})

test('authentication should fail with invalid credentials', async () => {
    try {
        await hdap.authenticate(adminCreds.id, adminCreds.password.split('').reverse().join(''))
    } catch (error) {
        expect(error.message).toContain('401')
    }
})

const basicCreds = { id: 'dc=com/dc=example/ou=People/uid=kvaughan', password: 'bribery' }
const newUserId = 'dc=com/dc=example/ou=People/uid=newuser'
const randomPassword = crypto.randomUUID()
const newUser = {
    _id: newUserId,
    objectClass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
    cn: ['New User'],
    givenName: ['New'],
    mail: ['newuser@example.com'],
    manager: ['dc=com/dc=example/ou=People/uid=bjensen'],
    sn: ['User'],
    telephoneNumber: ['+1 408 555 1212'],
    uid: ['newuser']
}

let crudUser

test('creating a new user should succeed', async () => {
    crudUser = await hdap.create(newUserId, newUser, null, basicCreds)
    expect(crudUser).toHaveProperty('sn')
})

test('creating the same new user again should fail', async () => {
    try {
        await hdap.create(newUserId, newUser, null, basicCreds)
    } catch (error) {
        expect(error.message).toContain('412')
    }
})

test('reading the new user should succeed', async () => {
    expect((await hdap.read(newUserId, null, basicCreds)).sn).toContain('User')
})

test('updating the new user with the right _rev should succeeed', async () => {
    crudUser = await hdap.update(newUserId, { givenName: 'Fred' }, crudUser._rev, null, basicCreds)
    expect(crudUser.givenName).toContain('Fred')
})

const fakeId = newUserId.replace('newuser', 'fake')

test('renaming the new user entry should succeed', async () => {
    const renamed = await hdap.rename(newUserId, fakeId, null, adminCreds)
    expect(renamed.uid.includes('fake')).toBeTruthy()
})

test('resetting the renamed entry\'s password should succeed', async () => {
    expect(await hdap.resetPassword(fakeId, null, adminCreds)).toHaveProperty('generatedPassword')
})

test('deleting the renamed entry should succeed', async () => {
    expect(await hdap.remove(fakeId, null, null, basicCreds)).toHaveProperty('givenName')
})

const user0Id = 'dc=com/dc=example/ou=People/uid=user.0'
const user0Creds = { id: user0Id, password: 'password' }
const dryRun = { dryRun: true }

test('account usability for an active user should be valid', async () => {
    expect(await hdap.getAccountUsability(user0Id, dryRun, adminCreds)).toEqual({ status: 'valid' })
})

test('a dry run changing one\'s own password to something random should succeed', async () => {
    expect(await hdap.modifyPassword(
        user0Id, user0Creds.password, randomPassword, dryRun, user0Creds)).toEqual({})
})

test('getting schema anonymously for a new inetOrgPerson should succeed', async () => {
    const objectClasses = ['inetOrgPerson', 'organizationalPerson', 'person', 'top']
    expect(await hdap.getSchema('dc=com/dc=example/ou=People', objectClasses)).toHaveProperty('properties')
})

test('changing a password anonymously should fail', async () => {
    try {
        expect(await hdap.modifyPassword(user0Id, 'password', randomPassword, null))
    } catch (error) {
        expect(error.message).toContain('403')
    }
})

test('resetting a password as a regular user should fail', async () => {
    try {
        expect(await hdap.resetPassword(user0Id, null, basicCreds))
    } catch (error) {
        expect(error.message).toContain('403')
    }
})

const groupId = 'dc=com/dc=example/ou=Groups/cn=Directory%20Administrators'
const patches = [{ operation: 'add', field: 'uniqueMember', value: user0Id }]

test('patching a group to add a member should succeed', async () => {
    expect(await hdap.patch(groupId, patches, null, null, basicCreds)).toHaveProperty('uniqueMember')
})

test('patching the group to remove the member should succeed', async () => {
    patches.operation = 'remove'
    expect(await hdap.patch(groupId, patches, null, null, basicCreds)).toHaveProperty('uniqueMember')
})

test('searching for Babs by mail address should succeed', async () => {
    const json = await hdap.query('dc=com/dc=example/ou=People', "mail eq 'bjensen@example.com'", { _fields: 'cn' })
    expect(json.result[0].cn.includes('Babs Jensen')).toBeTruthy()
})

test('listing cn=config as a regular user should fail', async () => {
    try {
        expect(await hdap.query('cn=config', true, null, basicCreds)).toBeTruthy()
    } catch (error) {
        expect(error.message).toContain('403')
    }
})
