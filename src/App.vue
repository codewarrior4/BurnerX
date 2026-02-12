<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { 
  RefreshCw, 
  Copy, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Plus,
  Inbox,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Download,
  Code2,
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-vue-next'

const API_BASE = 'https://api.mail.tm'
const STORAGE_KEY = 'burnerx_identities'
const THEME_KEY = 'burnerx_theme'

const currentAccount = ref(null)
const messages = ref([])
const identities = ref([])
const isLoading = ref(false)
const isPolling = ref(false)
const selectedMessage = ref(null)
const messageContent = ref('')
const messageSource = ref('')
const isViewingSource = ref(false)
const copyStatus = ref('Copy')

// --- Mobile & UI State ---
const isSidebarOpen = ref(false)
const showDetailOnMobile = ref(false)
const isDarkMode = ref(true)
const isCustomizing = ref(false)
const customPrefix = ref('')

// --- Theme Logic ---
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  updateTheme()
}

const updateTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

// --- Persistence ---
const loadState = () => {
  const savedIdentities = localStorage.getItem(STORAGE_KEY)
  if (savedIdentities) {
    identities.value = JSON.parse(savedIdentities)
    if (identities.value.length > 0) {
      currentAccount.value = identities.value[0]
    }
  }
  
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
}

const saveIdentities = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identities.value))
}

// --- API Calls ---
const getRandomString = (length) => {
  return Math.random().toString(36).substring(2, 2 + length)
}

const getDomains = async () => {
  const res = await axios.get(`${API_BASE}/domains`)
  return res.data['hydra:member']
}

const createAccount = async (isCustom = false) => {
  isLoading.value = true
  try {
    const domains = await getDomains()
    const domain = domains[0].domain
    
    let address
    if (isCustom && customPrefix.value) {
      address = `${customPrefix.value.toLowerCase()}@${domain}`
    } else {
      address = `${getRandomString(10)}@${domain}`
    }
    
    const password = getRandomString(12)
    
    const accountRes = await axios.post(`${API_BASE}/accounts`, {
      address,
      password
    })
    
    const tokenRes = await axios.post(`${API_BASE}/token`, {
      address,
      password
    })
    
    const newIdentity = {
      id: accountRes.data.id,
      address,
      password,
      token: tokenRes.data.token,
      createdAt: new Date().toISOString()
    }
    
    identities.value = [newIdentity, ...identities.value].slice(0, 10)
    currentAccount.value = newIdentity
    saveIdentities()
    messages.value = []
    selectedMessage.value = null
    isCustomizing.value = false
    customPrefix.value = ''
    isSidebarOpen.value = false
  } catch (error) {
    const msg = error.response?.data?.['hydra:description'] || 'Failed to connect.'
    alert(msg)
  } finally {
    isLoading.value = false
  }
}

const fetchMessages = async () => {
  if (!currentAccount.value) return
  try {
    const res = await axios.get(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${currentAccount.value.token}` }
    })
    messages.value = res.data['hydra:member']
  } catch (error) {}
}

const fetchMessageContent = async (msg) => {
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

const fetchMessageSource = async () => {
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

const downloadAttachment = async (attachment) => {
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

const deleteIdentity = async (id) => {
  const identityToDelete = identities.value.find(i => i.id === id)
  if (!identityToDelete) return
  
  if (confirm(`Permanently delete ${identityToDelete.address}?`)) {
    try {
      await axios.delete(`${API_BASE}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${identityToDelete.token}` }
      }).catch(() => {})
      identities.value = identities.value.filter(i => i.id !== id)
      saveIdentities()
      if (currentAccount.value?.id === id) {
        currentAccount.value = identities.value[0] || null
        messages.value = []
        selectedMessage.value = null
      }
    } catch (error) {}
  }
}

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text)
  copyStatus.value = 'Copied!'
  setTimeout(() => copyStatus.value = 'Copy', 2000)
}

// --- Lifecycle ---
onMounted(() => {
  loadState()
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
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-burner-dark text-burner-text font-sans">
    
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"></div>

    <!-- Sidebar -->
    <aside :class="['fixed inset-y-0 left-0 w-80 bg-burner-card border-r border-burner-border z-50 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      
      <div class="p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-gradient-to-tr from-burner-accent to-burner-glow rounded-xl flex items-center justify-center shadow-lg shadow-burner-accent/20">
            <ShieldCheck class="text-white w-6 h-6"></ShieldCheck>
          </div>
          <div>
            <h1 class="font-bold text-xl tracking-tight">BurnerX</h1>
            <p class="text-[10px] uppercase tracking-widest text-burner-text-dim font-bold">Secure Identities</p>
          </div>
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden p-2 text-burner-text-dim">
          <X class="w-5 h-5"></X>
        </button>
      </div>

      <div class="px-4 mb-6 space-y-3">
        <h3 class="text-[10px] uppercase tracking-[0.2em] text-burner-text-dim font-bold px-1 mb-1">New Identity</h3>
        
        <div v-if="!isCustomizing" class="grid grid-cols-1 gap-2">
          <button @click="createAccount(false)" :disabled="isLoading" class="group w-full flex items-center justify-between gap-2 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent rounded-xl px-4 py-3 border border-burner-accent/20 transition-all active:scale-[0.98] disabled:opacity-50">
            <div class="flex items-center gap-3">
              <RefreshCw class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"></RefreshCw>
              <span class="font-bold text-xs uppercase tracking-wider">Create Dummy Email</span>
            </div>
            <ChevronRight class="w-3 h-3 opacity-50"></ChevronRight>
          </button>

          <button @click="isCustomizing = true" class="group w-full flex items-center justify-between gap-2 bg-burner-text-dim/5 hover:bg-burner-text-dim/10 rounded-xl px-4 py-3 border border-burner-border transition-all active:scale-[0.98]">
            <div class="flex items-center gap-3">
              <Plus class="w-4 h-4 text-burner-text-dim"></Plus>
              <span class="font-bold text-xs uppercase tracking-wider">Use My Own Name</span>
            </div>
            <ChevronRight class="w-3 h-3 opacity-50"></ChevronRight>
          </button>
        </div>

        <div v-if="isCustomizing" class="bg-burner-dark p-4 rounded-2xl border border-burner-border space-y-4 animate-in fade-in zoom-in duration-300 shadow-xl">
          <input v-model="customPrefix" placeholder="prefix..." class="w-full bg-burner-card border border-burner-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burner-accent transition-all" @keyup.enter="createAccount(true)" />
          <div class="flex gap-2">
            <button @click="createAccount(true)" :disabled="!customPrefix || isLoading" class="flex-1 bg-burner-accent hover:bg-burner-accent/80 text-white text-xs font-bold py-3 rounded-xl transition-all disabled:opacity-50">CREATE</button>
            <button @click="isCustomizing = false" class="px-4 bg-burner-text-dim/10 hover:bg-burner-text-dim/20 text-burner-text-dim text-xs font-bold py-3 rounded-xl transition-all">CANCEL</button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
        <div v-for="idnt in identities" :key="idnt.id" @click="currentAccount = idnt; isSidebarOpen = false" :class="['group relative p-3 rounded-xl cursor-pointer transition-all border outline-none', currentAccount?.id === idnt.id ? 'bg-burner-accent/10 border-burner-accent/30' : 'bg-transparent border-transparent hover:bg-burner-text-dim/5']">
          <div class="flex items-center justify-between">
            <div class="flex flex-col min-w-0">
              <span :class="['text-xs font-medium truncate', currentAccount?.id === idnt.id ? 'text-burner-accent' : 'text-burner-text-dim']">{{ idnt.address.split('@')[0] }}</span>
              <span class="text-[10px] text-burner-text-dim/60 truncate">{{ idnt.address.split('@')[1] }}</span>
            </div>
            <button @click.stop="deleteIdentity(idnt.id)" class="opacity-0 group-hover:opacity-100 p-1.5 text-burner-text-dim hover:text-red-500 transition-all"><Trash2 class="w-3.5 h-3.5"></Trash2></button>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-burner-border flex items-center justify-between">
        <div class="flex items-center gap-2 text-[10px] text-burner-text-dim font-bold tracking-tight">
          <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          CONNECTED
        </div>
        <button @click="toggleTheme" class="p-2 rounded-lg bg-burner-text-dim/5 text-burner-text-dim hover:text-burner-accent transition-all">
          <Sun v-if="isDarkMode" class="w-4 h-4"></Sun>
          <Moon v-else class="w-4 h-4"></Moon>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative overflow-hidden">
      
      <!-- Top Bar -->
      <header class="h-20 border-b border-burner-border flex items-center justify-between px-4 lg:px-8 bg-burner-dark/80 backdrop-blur-md z-30">
        <div class="flex items-center gap-4 min-w-0">
          <button @click="isSidebarOpen = true" class="lg:hidden p-2 text-burner-text-dim hover:text-burner-text transition-colors">
            <Menu class="w-6 h-6"></Menu>
          </button>
          <div v-if="currentAccount" class="flex flex-col min-w-0">
            <h2 class="text-[9px] text-burner-text-dim uppercase tracking-widest font-black">Current Address</h2>
            <div class="flex items-center gap-3">
              <span class="text-sm lg:text-lg font-bold text-burner-text truncate">{{ currentAccount.address }}</span>
              <button @click="copyToClipboard(currentAccount.address)" class="shrink-0 p-1.5 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent rounded-full border border-burner-accent/20 transition-all">
                <component :is="copyStatus === 'Copied!' ? CheckCircle2 : Copy" class="w-3.5 h-3.5"></component>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <button @click="fetchMessages" class="p-2 text-burner-text-dim hover:text-burner-accent transition-colors">
            <RefreshCw :class="['w-5 h-5', isPolling ? 'animate-spin' : '']"></RefreshCw>
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Messages List -->
        <div :class="['w-full lg:w-96 border-r border-burner-border flex flex-col bg-burner-card/30 lg:flex', showDetailOnMobile ? 'hidden' : 'flex']">
          <div class="p-4 flex items-center justify-between border-b border-burner-border">
            <h3 class="text-xs font-black uppercase tracking-widest text-burner-text flex items-center gap-2">
              <Inbox class="w-4 h-4 text-burner-accent" />
              Inbox
            </h3>
            <span class="text-[10px] px-2 py-0.5 bg-burner-accent/10 text-burner-accent rounded-full font-bold">{{ messages.length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto divide-y divide-burner-border">
            <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center p-8">
              <div class="h-16 w-16 bg-burner-text-dim/5 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                <Mail class="w-8 h-8 text-burner-text-dim/40"></Mail>
              </div>
              <p class="text-xs font-bold text-burner-text-dim uppercase tracking-wider">No Messages Yet</p>
            </div>

            <div v-for="msg in messages" :key="msg.id" @click="fetchMessageContent(msg)" :class="['p-5 cursor-pointer transition-all hover:bg-burner-text-dim/5 relative', selectedMessage?.id === msg.id ? 'bg-burner-accent/5 border-l-4 border-burner-accent' : 'border-l-4 border-transparent']">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black text-burner-text truncate">{{ msg.from.name || msg.from.address.split('@')[0] }}</span>
                <span class="text-[10px] text-burner-text-dim font-mono">{{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <h4 class="text-xs font-bold text-burner-text/80 truncate mb-1">{{ msg.subject }}</h4>
              <p class="text-[10px] text-burner-text-dim line-clamp-2 leading-relaxed">{{ msg.intro }}</p>
            </div>
          </div>
        </div>

        <!-- Message Detail -->
        <div :class="['flex-1 bg-burner-dark relative flex flex-col overflow-hidden lg:flex', showDetailOnMobile ? 'flex' : 'hidden']">
          <div v-if="selectedMessage" class="flex-1 flex flex-col overflow-hidden">
            
            <div class="p-4 lg:p-8 border-b border-burner-border bg-burner-card/40 backdrop-blur-sm">
              <button @click="showDetailOnMobile = false" class="lg:hidden flex items-center gap-2 text-xs font-bold text-burner-accent mb-6">
                <ArrowLeft class="w-4 h-4"></ArrowLeft> BACK TO INBOX
              </button>
              
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <h1 class="text-xl lg:text-3xl font-black text-burner-text leading-tight">{{ selectedMessage.subject }}</h1>
                <div class="flex items-center gap-2">
                  <button @click="fetchMessageSource" class="p-2.5 bg-burner-card border border-burner-border rounded-xl text-burner-text-dim hover:text-burner-accent transition-all">
                    <Code2 class="w-5 h-5"></Code2>
                  </button>
                  <div class="text-[10px] font-black tracking-widest text-burner-text-dim px-4 py-2 bg-burner-card border border-burner-border rounded-full uppercase">
                    {{ new Date(selectedMessage.createdAt).toLocaleString() }}
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <!-- From Header -->
                <div class="flex items-center gap-3 p-3 bg-burner-text-dim/5 rounded-2xl border border-burner-border">
                  <div class="h-10 w-10 bg-burner-accent rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-burner-accent/20">
                    {{ (selectedMessage.from.name || selectedMessage.from.address)[0].toUpperCase() }}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[10px] font-black text-burner-text-dim uppercase tracking-tighter">Sender</span>
                    <span class="text-xs font-bold text-burner-text truncate">{{ selectedMessage.from.name || 'Anonymous' }}</span>
                    <span class="text-[10px] text-burner-text-dim truncate">{{ selectedMessage.from.address }}</span>
                  </div>
                </div>

                <!-- Expanded Recipients Headers -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div v-if="selectedMessage.to?.length" class="flex flex-col gap-1 p-3 bg-burner-text-dim/5 rounded-2xl border border-burner-border">
                     <span class="text-[10px] font-black text-burner-text-dim uppercase tracking-tighter">To</span>
                     <div class="flex flex-wrap gap-1">
                       <span v-for="r in selectedMessage.to" :key="r.address" class="text-xs font-bold text-burner-text truncate">{{ r.address }}</span>
                     </div>
                   </div>
                   <div v-if="selectedMessage.cc?.length" class="flex flex-col gap-1 p-3 bg-burner-text-dim/5 rounded-2xl border border-burner-border">
                     <span class="text-[10px] font-black text-burner-text-dim uppercase tracking-tighter">Cc</span>
                     <div class="flex flex-wrap gap-1">
                       <span v-for="r in selectedMessage.cc" :key="r.address" class="text-xs font-bold text-burner-text truncate">{{ r.address }}</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 lg:p-10 relative">
              <div class="max-w-4xl mx-auto space-y-8">
                
                <!-- Source View -->
                <div v-if="isViewingSource" class="bg-burner-card/80 border border-burner-border p-6 rounded-3xl animate-in fade-in zoom-in duration-300">
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                      <Code2 class="w-4 h-4 text-burner-accent" /> Source Code
                    </h2>
                    <button @click="isViewingSource = false" class="text-[10px] font-bold text-burner-accent bg-burner-accent/10 px-3 py-1 rounded-full uppercase">Close</button>
                  </div>
                  <pre class="text-[11px] text-burner-text-dim font-mono overflow-auto whitespace-pre-wrap leading-relaxed bg-burner-dark/50 p-4 rounded-xl border border-burner-border">{{ messageSource }}</pre>
                </div>

                <!-- Attachments -->
                <div v-if="selectedMessage.attachments?.length > 0" class="p-6 bg-burner-accent/5 rounded-3xl border border-burner-accent/20">
                  <h5 class="text-[11px] font-black uppercase tracking-[0.2em] text-burner-accent mb-4">Files Attached ({{ selectedMessage.attachments.length }})</h5>
                  <div class="flex flex-wrap gap-3">
                    <button v-for="att in selectedMessage.attachments" :key="att.id" @click="downloadAttachment(att)" class="flex items-center gap-4 p-4 bg-burner-card border border-burner-border rounded-2xl hover:border-burner-accent hover:shadow-xl hover:shadow-burner-accent/5 transition-all group lg:min-w-[200px]">
                      <div class="p-3 bg-burner-accent/10 rounded-xl group-hover:bg-burner-accent group-hover:text-white transition-colors"><Download class="w-4 h-4"></Download></div>
                      <div class="flex flex-col items-start text-left min-w-0">
                        <span class="text-xs font-bold text-burner-text truncate w-full">{{ att.filename }}</span>
                        <span class="text-[10px] text-burner-text-dim font-black uppercase">{{ (att.size / 1024).toFixed(1) }} KB</span>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Email Body -->
                <div class="bg-burner-card/50 rounded-[2.5rem] border border-burner-border p-6 lg:p-12 shadow-2xl backdrop-blur-sm">
                  <div class="email-content prose-burner prose prose-invert max-w-none" v-html="messageContent"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div class="relative mb-8 h-20 w-20 flex items-center justify-center">
              <div class="absolute inset-0 bg-burner-accent opacity-20 blur-3xl rounded-full animate-pulse"></div>
              <Mail class="w-12 h-12 text-burner-accent relative z-10"></Mail>
            </div>
            <h2 class="text-xl font-black text-burner-text mb-3 uppercase tracking-wider">Empty Inbox</h2>
            <p class="text-sm text-burner-text-dim max-w-xs font-medium">Select a dummy message to inspect the payload and attachments.</p>
          </div>
        </div>
      </div>

    </main>

    <!-- Global Loading -->
    <div v-if="isLoading" class="absolute inset-0 bg-burner-dark/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
      <div class="h-16 w-16 border-4 border-burner-accent border-t-transparent rounded-full animate-spin mb-6"></div>
      <p class="text-burner-accent font-black tracking-[0.3em] text-[10px] animate-pulse uppercase">Syncing Flux Identity</p>
    </div>
  </div>
</template>

<style>
.email-content { overflow-wrap: break-word; }
.email-content img { max-width: 100%; height: auto; border-radius: 1.5rem; margin: 2rem 0; }
.email-content a { font-weight: 900; text-decoration: underline; }
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }
</style>
