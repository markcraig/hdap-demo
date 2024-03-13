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
  if (typeof res.data.result !== 'undefined' && res.data.result.length > 0) {
    entry.cn = res.data.result[0].cn[0] || email
    entry.dn = res.data.result[0]._id
  }
  return entry
}

async function authenticate(entry) {
  if (!entry || !entry.dn) return
  const res = await axios.post(`/hdap/${entry.dn}?_action=authenticate`, {
    password: `${entry.password}`
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data.access_token
}

async function authenticateWithId(id, password) {
  if (!id || !password) return
  const res = await axios.post(`/hdap/${id}?_action=authenticate`, {
    password: `${password}`
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data.access_token
}

async function getCn(id, token) {
  if (!id) return 
  const res = await axios.get(`/hdap/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: {
      _fields: 'cn'
    }
  })
  return (res.data.cn) ? res.data.cn[0] : ''
}

export const useAppStore = defineStore('app', () => {
  const authenticated = ref(false)
  const dn = ref('')
  const fullName = ref('')
  const jwt = ref('')

  function addAuthzHeader(request) {
    if (!authenticated.value) return request
    request.headers['Authorization'] = `Bearer ${jwt.value}`
    return request
  }

  async function login(email, password) {
    try {
      const entry = await findEntry(email, password)
      const token = await authenticate(entry)
      if (token) {
        authenticated.value = true
        dn.value = entry.dn
        fullName.value = entry.cn
        jwt.value = token
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function loginWithId(id, password) {
    try {
      const token = await authenticateWithId(id, password)
      if (token) {
        let cn = await getCn(id, token)
        authenticated.value = true
        dn.value = id
        fullName.value = cn || id
        jwt.value = token
      }
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
    loginWithId,
    logout
  }
})
