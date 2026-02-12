<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { X, Download } from 'lucide-vue-next'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const downloadQR = () => {
  const canvas = document.querySelector('#qr-code-modal canvas')
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `burner-qr-${props.value.split('@')[0]}.png`
  link.href = url
  link.click()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" @click="$emit('close')"></div>
    
    <!-- Modal -->
    <div id="qr-code-modal" class="relative w-full max-w-sm bg-burner-card border border-burner-border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
      <button @click="$emit('close')" class="absolute top-6 right-6 p-2 text-burner-text-dim hover:text-burner-text transition-colors">
        <X class="w-5 h-5" />
      </button>

      <div class="flex flex-col items-center text-center">
        <div class="mb-6 p-6 bg-white rounded-3xl shadow-inner">
          <qrcode-vue :value="value" :size="200" level="H" render-as="canvas" />
        </div>
        
        <h3 class="text-lg font-black text-burner-text mb-2 uppercase tracking-tight">Identity QR Code</h3>
        <p class="text-xs text-burner-text-dim mb-8">{{ value }}</p>

        <button @click="downloadQR" class="w-full flex items-center justify-center gap-3 bg-burner-accent hover:bg-burner-accent/80 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98]">
          <Download class="w-5 h-5" />
          DOWNLOAD QR IMAGE
        </button>
      </div>
    </div>
  </div>
</template>
