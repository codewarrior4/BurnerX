import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = 'https://api.mail.tm'
const STORAGE_KEY = 'burnerx_identities'
const THEME_KEY = 'burnerx_theme'

// Shared State
export const currentAccount = ref(null)
export const messages = ref([])
export const identities = ref([])
export const isLoading = ref(false)
export const isPolling = ref(false)
export const selectedMessage = ref(null)
export const messageContent = ref('')
export const messageSource = ref('')
export const isViewingSource = ref(false)
export const copyStatus = ref('Copy')
export const isDarkMode = ref(true)
export const searchQuery = ref('')

// Mobile State
export const isSidebarOpen = ref(false)
export const showDetailOnMobile = ref(false)

// Utils
export const getRandomString = (length) => Math.random().toString(36).substring(2, 2 + length)

export const saveIdentities = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identities.value))
}

export const updateTheme = () => {
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem(THEME_KEY, 'dark')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem(THEME_KEY, 'light')
    }
}

export const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    updateTheme()
}

export const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text)
    copyStatus.value = 'Copied!'
    setTimeout(() => copyStatus.value = 'Copy', 2000)
}

// API Methods
export const getDomains = async () => {
    const res = await axios.get(`${API_BASE}/domains`)
    return res.data['hydra:member']
}

export const createAccount = async (prefix = '') => {
    isLoading.value = true
    try {
        const domains = await getDomains()
        const domain = domains[0].domain
        const address = prefix ? `${prefix.toLowerCase()}@${domain}` : `${getRandomString(10)}@${domain}`
        const password = getRandomString(12)

        const accountRes = await axios.post(`${API_BASE}/accounts`, { address, password })
        const tokenRes = await axios.post(`${API_BASE}/token`, { address, password })

        const newIdentity = {
            id: accountRes.data.id,
            address,
            password,
            token: tokenRes.data.token,
            label: prefix || '',
            createdAt: new Date().toISOString()
        }

        identities.value = [newIdentity, ...identities.value].slice(0, 10)
        currentAccount.value = newIdentity
        saveIdentities()
        messages.value = []
        selectedMessage.value = null
        isSidebarOpen.value = false
    } catch (error) {
        const msg = error.response?.data?.['hydra:description'] || 'Failed to connect.'
        alert(msg)
    } finally {
        isLoading.value = false
    }
}

export const fetchMessages = async () => {
    if (!currentAccount.value) return
    try {
        const res = await axios.get(`${API_BASE}/messages`, {
            headers: { Authorization: `Bearer ${currentAccount.value.token}` }
        })
        messages.value = res.data['hydra:member']
    } catch (error) { }
}

export const fetchMessageContent = async (msg) => {
    selectedMessage.value = msg
    messageContent.value = 'Loading content...'
    messageSource.value = ''
    isViewingSource.value = false
    showDetailOnMobile.value = true
    try {
        const res = await axios.get(`${API_BASE}/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${currentAccount.value.token}` }
        })
        selectedMessage.value = { ...selectedMessage.value, ...res.data }
        messageContent.value = res.data.html || res.data.text
    } catch (error) {
        messageContent.value = 'Failed to load message content.'
    }
}

export const fetchMessageSource = async () => {
    if (!selectedMessage.value) return
    if (messageSource.value) {
        isViewingSource.value = !isViewingSource.value
        return
    }
    try {
        const res = await axios.get(`${API_BASE}/messages/${selectedMessage.value.id}/source`, {
            headers: { Authorization: `Bearer ${currentAccount.value.token}` }
        })
        messageSource.value = res.data.data || res.data
        isViewingSource.value = true
    } catch (error) {
        alert('Failed to fetch message source.')
    }
}

export const deleteIdentity = async (id) => {
    const identityToDelete = identities.value.find(i => i.id === id)
    if (!identityToDelete) return
    if (confirm(`Permanently delete ${identityToDelete.address}?`)) {
        try {
            await axios.delete(`${API_BASE}/accounts/${id}`, {
                headers: { Authorization: `Bearer ${identityToDelete.token}` }
            }).catch(() => { })
            identities.value = identities.value.filter(i => i.id !== id)
            saveIdentities()
            if (currentAccount.value?.id === id) {
                currentAccount.value = identities.value[0] || null
                messages.value = []
                selectedMessage.value = null
            }
        } catch (error) { }
    }
}

export const downloadAttachment = async (attachment) => {
    try {
        const res = await axios.get(`${API_BASE}${attachment.downloadUrl}`, {
            headers: { Authorization: `Bearer ${currentAccount.value.token}` },
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', attachment.filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        alert('Failed to download attachment.')
    }
}

// Initializer
export const initBurner = () => {
    onMounted(() => {
        // Load Identities
        const savedIdentities = localStorage.getItem(STORAGE_KEY)
        if (savedIdentities) {
            identities.value = JSON.parse(savedIdentities)
            if (identities.value.length > 0) currentAccount.value = identities.value[0]
        }

        // Load Theme
        const savedTheme = localStorage.getItem(THEME_KEY)
        if (savedTheme) isDarkMode.value = savedTheme === 'dark'
        else isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        updateTheme()

        if (!currentAccount.value) createAccount()
        else fetchMessages()

        setInterval(fetchMessages, 5000)
    })

    watch(currentAccount, (newVal) => {
        if (newVal) {
            fetchMessages()
            selectedMessage.value = null
            showDetailOnMobile.value = false
        }
    })
}
