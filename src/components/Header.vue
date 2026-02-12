<script setup>
import { ref } from 'vue'
import { Menu, CheckCircle2, Copy, RefreshCw, QrCode } from 'lucide-vue-next'
import { 
  currentAccount, copyToClipboard, copyStatus, isPolling, 
  fetchMessages, isSidebarOpen 
} from '../composables/useBurner'
import QRCodeModal from './QRCodeModal.vue'

const showQRCode = ref(false)
</script>

<template>
  <header class="h-20 border-b border-burner-border flex items-center justify-between px-4 lg:px-8 bg-burner-dark/80 backdrop-blur-md z-30">
    <div class="flex items-center gap-4 min-w-0">
      <button @click="isSidebarOpen = true" class="lg:hidden p-2 text-burner-text-dim hover:text-burner-text transition-colors">
        <Menu class="w-6 h-6"></Menu>
      </button>
      <div v-if="currentAccount" class="flex flex-col min-w-0">
        <h2 class="text-[9px] text-burner-text-dim uppercase tracking-widest font-black">Current Address</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm lg:text-lg font-bold text-burner-text truncate">{{ currentAccount.address }}</span>
          <div class="flex items-center gap-2">
            <button @click="copyToClipboard(currentAccount.address)" class="shrink-0 p-1.5 bg-burner-accent/10 hover:bg-burner-accent/20 text-burner-accent rounded-full border border-burner-accent/20 transition-all" title="Copy Address">
              <component :is="copyStatus === 'Copied!' ? CheckCircle2 : Copy" class="w-3.5 h-3.5"></component>
            </button>
            <button @click="showQRCode = true" class="shrink-0 p-1.5 bg-burner-text-dim/5 hover:bg-burner-text-dim/10 text-burner-text-dim rounded-full border border-burner-border transition-all" title="Show QR Code">
              <QrCode class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <QRCodeModal 
      v-if="currentAccount"
      :show="showQRCode" 
      :value="currentAccount.address" 
      @close="showQRCode = false" 
    />

    <div class="flex items-center gap-4 shrink-0">
      <button @click="fetchMessages" class="p-2 text-burner-text-dim hover:text-burner-accent transition-colors">
        <RefreshCw :class="['w-5 h-5', isPolling ? 'animate-spin' : '']"></RefreshCw>
      </button>
    </div>
  </header>
</template>
