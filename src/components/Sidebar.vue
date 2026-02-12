<script setup>
import { ref } from 'vue'
import { 
  ShieldCheck, X, RefreshCw, Plus, ChevronRight, Trash2, Edit3, Check, Sun, Moon 
} from 'lucide-vue-next'
import { 
  identities, currentAccount, createAccount, deleteIdentity, 
  isSidebarOpen, saveIdentities, isDarkMode, toggleTheme, isLoading
} from '../composables/useBurner'

const isCustomizing = ref(false)
const customPrefix = ref('')
const editingLabelId = ref(null)
const tempLabel = ref('')

const handleCreate = (isCustom) => {
  createAccount(isCustom ? customPrefix.value : '')
  isCustomizing.value = false
  customPrefix.value = ''
}

const startEditingLabel = (idnt) => {
  editingLabelId.value = idnt.id
  tempLabel.value = idnt.label || ''
}

const saveLabel = (idnt) => {
  idnt.label = tempLabel.value
  saveIdentities()
  editingLabelId.value = null
}

const vFocus = { mounted: (el) => el.focus() }
</script>

<template>
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
        <button @click="handleCreate(false)" :disabled="isLoading" class="group w-full flex items-center justify-between gap-2 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent rounded-xl px-4 py-3 border border-burner-accent/20 transition-all active:scale-[0.98] disabled:opacity-50">
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
        <input v-model="customPrefix" placeholder="prefix..." class="w-full bg-burner-card border border-burner-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-burner-accent transition-all" @keyup.enter="handleCreate(true)" />
        <div class="flex gap-2">
          <button @click="handleCreate(true)" :disabled="!customPrefix || isLoading" class="flex-1 bg-burner-accent hover:bg-burner-accent/80 text-white text-xs font-bold py-3 rounded-xl transition-all disabled:opacity-50">CREATE</button>
          <button @click="isCustomizing = false" class="px-4 bg-burner-text-dim/10 hover:bg-burner-text-dim/20 text-burner-text-dim text-xs font-bold py-3 rounded-xl transition-all">CANCEL</button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
      <div v-for="idnt in identities" :key="idnt.id" @click="currentAccount = idnt; isSidebarOpen = false" :class="['group relative p-3 rounded-xl cursor-pointer transition-all border outline-none', currentAccount?.id === idnt.id ? 'bg-burner-accent/10 border-burner-accent/30' : 'bg-transparent border-transparent hover:bg-burner-text-dim/5']">
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-col min-w-0 flex-1">
            <div v-if="editingLabelId === idnt.id" class="flex items-center gap-1 mb-1">
              <input 
                v-model="tempLabel" 
                class="w-full bg-burner-dark border border-burner-accent/50 rounded px-2 py-0.5 text-[10px] text-burner-text focus:outline-none focus:ring-1 focus:ring-burner-accent/50"
                @click.stop
                @keyup.enter="saveLabel(idnt)"
                v-focus
              />
              <button @click.stop="saveLabel(idnt)" class="text-burner-accent"><Check class="w-3 h-3" /></button>
            </div>
            <div v-else class="flex items-center gap-1.5 group/label mb-0.5">
              <span :class="['text-[11px] font-black tracking-tight truncate', currentAccount?.id === idnt.id ? 'text-burner-accent' : 'text-burner-text']">
                {{ idnt.label || idnt.address.split('@')[0] }}
              </span>
              <button 
                v-if="currentAccount?.id === idnt.id"
                @click.stop="startEditingLabel(idnt)" 
                class="opacity-0 group-hover:opacity-100 lg:group-hover/label:opacity-100 transition-opacity text-burner-text-dim hover:text-burner-accent"
              >
                <Edit3 class="w-2.5 h-2.5" />
              </button>
            </div>
            <span class="text-[9px] text-burner-text-dim/60 truncate italic">{{ idnt.address }}</span>
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
</template>
