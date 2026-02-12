<script setup>
import { QrCode, Copy, CheckCircle2, ChevronDown, Globe } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import { 
  currentAccount, copyToClipboard, copyStatus, 
  domains, createAccount 
} from '../composables/useBurner'
import { ref } from 'vue'

const showDomains = ref(false)

const handleDomainChange = (domain) => {
  if (confirm(`Switching to @${domain} will create a NEW identity. Continue?`)) {
    createAccount(currentAccount.value?.label || '', domain)
    showDomains.value = false
  }
}
</script>

<template>
  <div v-if="currentAccount" class="max-w-md w-full mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
    <!-- Identity Card -->
    <div class="bg-burner-card border border-burner-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
      <!-- Glow Effect -->
      <div class="absolute -top-24 -right-24 h-48 w-48 bg-burner-accent/10 blur-3xl rounded-full group-hover:bg-burner-accent/20 transition-all duration-700"></div>
      
      <div class="flex flex-col items-center text-center relative z-10">
        <!-- QR Section -->
        <div class="mb-8 p-6 bg-white rounded-[2rem] shadow-2xl shadow-burner-accent/5 transform group-hover:scale-105 transition-transform duration-500">
          <qrcode-vue :value="currentAccount.address" :size="180" level="H" />
        </div>

        <div class="space-y-1 mb-8">
          <h2 class="text-2xl font-black text-burner-text uppercase tracking-tight">
            {{ currentAccount.label || 'Active Identity' }}
          </h2>
          <p class="text-sm font-medium text-burner-text-dim break-all px-4">{{ currentAccount.address }}</p>
        </div>

        <!-- Action Grid -->
        <div class="grid grid-cols-2 gap-3 w-full">
          <button 
            @click="copyToClipboard(currentAccount.address)"
            class="flex items-center justify-center gap-2 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent font-black py-4 rounded-2xl transition-all active:scale-95"
          >
            <component :is="copyStatus === 'Copied!' ? CheckCircle2 : Copy" class="w-4 h-4" />
            {{ copyStatus === 'Copied!' ? 'DONE' : 'COPY' }}
          </button>

          <div class="relative">
            <button 
              @click="showDomains = !showDomains"
              class="w-full flex items-center justify-center gap-2 bg-burner-text-dim/5 hover:bg-burner-text-dim/10 text-burner-text-dim font-black py-4 rounded-2xl transition-all active:scale-95 border border-burner-border"
            >
              <Globe class="w-4 h-4" />
              DOMAIN
              <ChevronDown :class="['w-3 h-3 transition-transform', showDomains ? 'rotate-180' : '']" />
            </button>

            <!-- Domain Dropdown -->
            <div v-if="showDomains" class="absolute bottom-full left-0 right-0 mb-2 bg-burner-card border border-burner-border rounded-2xl shadow-2xl p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
               <div class="max-h-48 overflow-y-auto custom-scrollbar">
                 <button 
                   v-for="d in domains" 
                   :key="d.domain"
                   @click="handleDomainChange(d.domain)"
                   :class="['w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-all mb-1', currentAccount.address.endsWith(d.domain) ? 'bg-burner-accent text-white' : 'hover:bg-burner-accent/10 text-burner-text-dim hover:text-burner-accent']"
                 >
                   @{{ d.domain }}
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats / Info -->
    <div class="flex items-center justify-around p-6 bg-burner-card/30 border border-burner-border rounded-3xl backdrop-blur-sm">
      <div class="text-center">
        <p class="text-[10px] font-black text-burner-text-dim uppercase tracking-widest mb-1">Status</p>
        <p class="text-xs font-bold text-emerald-500 flex items-center gap-1.5 justify-center">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          LISTENING
        </p>
      </div>
      <div class="h-8 w-px bg-burner-border"></div>
      <div class="text-center">
        <p class="text-[10px] font-black text-burner-text-dim uppercase tracking-widest mb-1">Created</p>
        <p class="text-xs font-bold text-burner-text">
          {{ new Date(currentAccount.createdAt).toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>
