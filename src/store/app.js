import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

async function findEntry(email, password) {
  let entry = {
    cn: '',
    dn: '',
    email: email,
    password: password
  }
  if (!email || !password) return entry
  const res = await axios.get('/hdap', {
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      _queryFilter: `mail eq '${email}' or uid eq '${email}'`,
      _fields: '_id,cn',
      scope: 'sub'
    }
  })
  entry.cn = res.data.result[0].cn[0] || email
  entry.dn = res.data.result[0]._id
  return entry
}

async function authenticate(entry) {
  if (!entry) return
  const res = await axios.post(`/hdap/${entry.dn}?_action=authenticate`, {
    password: `${entry.password}`
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data.access_token
}

export const useAppStore = defineStore('app', () => {
  const authenticated = ref(false)
  const dn = ref('')
  const fullName = ref('')
  const jwt = ref('')

  function addAuthzHeader(request) {
    return (authenticated.value)
      ? request.headers.set('Authorization', `Bearer ${jwt.value}`)
      : request
  }

  async function login(email, password) {
    try {
      const entry = await findEntry(email, password)
      const token = await authenticate(entry)
      authenticated.value = true
      dn.value = entry.dn
      fullName.value = entry.cn
      jwt.value = token
    } catch (error) {
      console.error(error)
    }
  }

  function logout() {
    authenticated.value = false
    dn.value = ''
    fullName.value = ''
    jwt.value = ''
  }

  return {
    authenticated,
    dn,
    fullName,
    jwt,
    addAuthzHeader,
    login,
    logout
  }
})
