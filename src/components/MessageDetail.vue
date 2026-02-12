<script setup>
import { ArrowLeft, Code2, Download, Mail } from 'lucide-vue-next'
import { 
  selectedMessage, messageContent, messageSource, isViewingSource, 
  fetchMessageSource, downloadAttachment, showDetailOnMobile 
} from '../composables/useBurner'
</script>

<template>
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
          <div v-if="isViewingSource" class="bg-burner-card/80 border border-burner-border p-6 rounded-3xl animate-in fade-in zoom-in duration-300">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-black tracking-widest uppercase flex items-center gap-2">
                <Code2 class="w-4 h-4 text-burner-accent" /> Source Code
              </h2>
              <button @click="isViewingSource = false" class="text-[10px] font-bold text-burner-accent bg-burner-accent/10 px-3 py-1 rounded-full uppercase">Close</button>
            </div>
            <pre class="text-[11px] text-burner-text-dim font-mono overflow-auto whitespace-pre-wrap leading-relaxed bg-burner-dark/50 p-4 rounded-xl border border-burner-border">{{ messageSource }}</pre>
          </div>

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
</template>
