import { ref, watch, onMounted, computed } from 'vue'
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
export const domains = ref([])

// Mobile State
export const isSidebarOpen = ref(false)
export const showDetailOnMobile = ref(false)

export const filteredMessages = computed(() => {
    if (!searchQuery.value) return messages.value
    const query = searchQuery.value.toLowerCase()
    return messages.value.filter(msg =>
        msg.subject?.toLowerCase().includes(query) ||
        msg.from.name?.toLowerCase().includes(query) ||
        msg.from.address?.toLowerCase().includes(query) ||
        msg.intro?.toLowerCase().includes(query)
    )
})

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

export const createAccount = async (prefix = '', customDomain = '') => {
    isLoading.value = true
    try {
        if (domains.value.length === 0) {
            domains.value = await getDomains()
        }
        const domain = customDomain || domains.value[0].domain
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

// --- Browser Notifications (Feature 4) ---
export const notificationsEnabled = ref(false)

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
        notificationsEnabled.value = true
        return
    }
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        notificationsEnabled.value = permission === 'granted'
    }
}

const sendNotification = (title, body) => {
    if (!notificationsEnabled.value) return
    try {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'burnerx-new-mail'
        })
    } catch (e) { }
}

let previousMessageCount = 0

// --- Export (Feature 6) ---
export const exportEmailAsJSON = (message) => {
    if (!message) return
    const data = {
        id: message.id,
        subject: message.subject,
        from: message.from,
        to: message.to,
        cc: message.cc,
        date: message.createdAt,
        intro: message.intro,
        hasAttachments: message.hasAttachments,
        attachments: message.attachments
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `email-${message.subject?.replace(/[^a-z0-9]/gi, '_').slice(0, 30) || message.id}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
}

export const exportEmailAsHTML = (message, htmlContent) => {
    if (!message) return
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${message.subject || 'Email'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #7c3aed; margin: 0 0 10px 0; }
    .meta { color: #666; font-size: 14px; line-height: 1.8; }
    .meta strong { color: #333; }
    .content { line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${message.subject || '(No Subject)'}</h1>
    <div class="meta">
      <strong>From:</strong> ${message.from.name || ''} &lt;${message.from.address}&gt;<br>
      <strong>To:</strong> ${message.to?.map(r => r.address).join(', ') || 'N/A'}<br>
      <strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}
    </div>
  </div>
  <div class="content">${htmlContent || '<p>No content available.</p>'}</div>
  <div class="footer">Exported from BurnerX</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `email-${message.subject?.replace(/[^a-z0-9]/gi, '_').slice(0, 30) || message.id}.html`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
}

export const generateShareLink = (message, htmlContent) => {
    if (!message) return null

    // QR codes have physical limits. To keep it scanable ("well-formed"),
    // we use minified keys and aggressive truncation (250 chars) for the QR share.
    let body = htmlContent || 'No content'
    if (body.length > 250) {
        body = body.substring(0, 250) + '...'
    }

    const payload = {
        s: message.subject || '',
        f: message.from?.address || '',
        d: message.createdAt,
        b: body
    }
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
    const base = window.location.origin + window.location.pathname
    return `${base}#${encoded}`
}


export const exportIdentityBackup = () => {
    const backup = {
        exportedAt: new Date().toISOString(),
        identities: identities.value.map(i => ({
            address: i.address,
            password: i.password,
            label: i.label || '',
            createdAt: i.createdAt
        }))
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `burnerx-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
}

export const isImporting = ref(false)

export const importIdentityBackup = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        isImporting.value = true
        try {
            const text = await file.text()
            const backup = JSON.parse(text)

            if (!backup.identities || !Array.isArray(backup.identities)) {
                alert('Invalid backup file format.')
                return
            }

            let imported = 0
            let skipped = 0
            let failed = 0

            for (const entry of backup.identities) {
                // Skip if already exists
                if (identities.value.some(i => i.address === entry.address)) {
                    skipped++
                    continue
                }

                // If we have a password, try to re-authenticate
                if (entry.password) {
                    try {
                        const tokenRes = await axios.post(`${API_BASE}/token`, {
                            address: entry.address,
                            password: entry.password
                        })

                        // Get the account ID
                        const meRes = await axios.get(`${API_BASE}/me`, {
                            headers: { Authorization: `Bearer ${tokenRes.data.token}` }
                        })

                        const restoredIdentity = {
                            id: meRes.data.id,
                            address: entry.address,
                            password: entry.password,
                            token: tokenRes.data.token,
                            label: entry.label || '',
                            createdAt: entry.createdAt || new Date().toISOString()
                        }

                        identities.value.push(restoredIdentity)
                        imported++
                    } catch (err) {
                        // Account may have expired or been deleted
                        failed++
                    }
                } else {
                    failed++
                }
            }

            if (imported > 0) {
                saveIdentities()
                if (!currentAccount.value) {
                    currentAccount.value = identities.value[0]
                }
            }

            alert(`Import complete!\n✅ Restored: ${imported}\n⏭️ Skipped (already exists): ${skipped}\n❌ Failed (expired/deleted): ${failed}`)
        } catch (err) {
            alert('Failed to read backup file. Make sure it\'s a valid BurnerX backup JSON.')
        } finally {
            isImporting.value = false
        }
    }
    input.click()
}


// Initializer
export const initBurner = () => {
    onMounted(async () => {
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

        // Request Notification Permission
        await requestNotificationPermission()

        // Fetch domains early
        try {
            domains.value = await getDomains()
        } catch (e) { }

        if (!currentAccount.value) createAccount()
        else fetchMessages()

        // Polling with notification detection
        previousMessageCount = messages.value.length
        setInterval(async () => {
            await fetchMessages()
            if (messages.value.length > previousMessageCount && previousMessageCount > 0) {
                const newMsg = messages.value[0]
                sendNotification(
                    `📬 New email from ${newMsg.from.name || newMsg.from.address.split('@')[0]}`,
                    newMsg.subject || '(No Subject)'
                )
            }
            previousMessageCount = messages.value.length
        }, 5000)
    })

    watch(currentAccount, (newVal) => {
        if (newVal) {
            fetchMessages()
            selectedMessage.value = null
            showDetailOnMobile.value = false
        }
    })
}
