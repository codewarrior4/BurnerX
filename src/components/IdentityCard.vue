<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { Copy, CheckCircle2, ChevronDown, Globe, Download, X } from 'lucide-vue-next'
import { 
  currentAccount, copyToClipboard, copyStatus, 
  domains, createAccount 
} from '../composables/useBurner'

const showDomains = ref(false)
const showQR = ref(false)

const handleDomainChange = (domain) => {
  if (confirm(`Switching to @${domain} will create a NEW identity. Continue?`)) {
    createAccount(currentAccount.value?.label || '', domain)
    showDomains.value = false
  }
}

const downloadQR = () => {
  const canvas = document.querySelector('#qr-enlarged canvas')
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `burner-qr-${currentAccount.value.address.split('@')[0]}.png`
  link.href = url
  link.click()
}
</script>

<template>
  <div v-if="currentAccount" class="max-w-md w-full mx-auto space-y-6">
    <!-- Identity Card -->
    <div class="bg-burner-card border border-burner-border rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
      <!-- Glow Effect -->
      <div class="absolute -top-24 -right-24 h-48 w-48 bg-burner-accent/10 blur-3xl rounded-full group-hover:bg-burner-accent/20 transition-all duration-700"></div>
      
      <div class="flex flex-col items-center text-center relative z-10">
        <!-- QR Code (compact) -->
        <button @click="showQR = true" class="mb-6 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer" title="Click to enlarge">
          <qrcode-vue :value="currentAccount.address" :size="120" level="H" render-as="svg" margin="2" />
        </button>

        <div class="space-y-1 mb-6">
          <h2 class="text-xl font-black text-burner-text uppercase tracking-tight">
            {{ currentAccount.label || 'Active Identity' }}
          </h2>
          <p class="text-xs font-medium text-burner-text-dim break-all px-2">{{ currentAccount.address }}</p>
        </div>

        <!-- Action Grid -->
        <div class="grid grid-cols-2 gap-3 w-full">
          <button 
            @click="copyToClipboard(currentAccount.address)"
            class="flex items-center justify-center gap-2 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent font-black py-3.5 rounded-2xl transition-all active:scale-95 text-xs"
          >
            <component :is="copyStatus === 'Copied!' ? CheckCircle2 : Copy" class="w-4 h-4" />
            {{ copyStatus === 'Copied!' ? 'DONE' : 'COPY' }}
          </button>

          <div class="relative">
            <button 
              @click="showDomains = !showDomains"
              class="w-full flex items-center justify-center gap-2 bg-burner-text-dim/5 hover:bg-burner-text-dim/10 text-burner-text-dim font-black py-3.5 rounded-2xl transition-all active:scale-95 border border-burner-border text-xs"
            >
              <Globe class="w-4 h-4" />
              DOMAIN
              <ChevronDown :class="['w-3 h-3 transition-transform', showDomains ? 'rotate-180' : '']" />
            </button>

            <!-- Domain Dropdown -->
            <div v-if="showDomains" class="absolute bottom-full left-0 right-0 mb-2 bg-burner-card border border-burner-border rounded-2xl shadow-2xl p-2 z-50">
               <div class="max-h-48 overflow-y-auto">
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

    <!-- Stats Row -->
    <div class="flex items-center justify-around p-5 bg-burner-card/30 border border-burner-border rounded-2xl backdrop-blur-sm">
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

    <!-- QR Enlarged Modal -->
    <div v-if="showQR" class="fixed inset-0 z-[200] flex items-center justify-center p-6" @click.self="showQR = false">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-md" @click="showQR = false"></div>
      <div id="qr-enlarged" class="relative bg-burner-card border border-burner-border rounded-[2rem] p-8 shadow-2xl max-w-sm w-full z-10">
        <button @click="showQR = false" class="absolute top-5 right-5 p-2 text-burner-text-dim hover:text-burner-text transition-colors">
          <X class="w-5 h-5" />
        </button>
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 p-6 bg-white rounded-3xl shadow-inner">
            <qrcode-vue :value="currentAccount.address" :size="200" level="H" render-as="svg" margin="2" />
          </div>
          <h3 class="text-lg font-black text-burner-text mb-1 uppercase tracking-tight">Scan to Copy</h3>
          <p class="text-xs text-burner-text-dim mb-6">{{ currentAccount.address }}</p>
          <button @click="downloadQR" class="w-full flex items-center justify-center gap-3 bg-burner-accent hover:bg-burner-accent/80 text-white font-black py-3.5 rounded-2xl transition-all active:scale-[0.98] text-sm">
            <Download class="w-4 h-4" />
            DOWNLOAD QR IMAGE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
