<script setup>
import { Inbox, Mail, Search, X } from 'lucide-vue-next'
import { 
  messages, searchQuery, filteredMessages, fetchMessageContent, 
  selectedMessage, showDetailOnMobile 
} from '../composables/useBurner'
</script>

<template>
  <div :class="['w-full lg:w-96 border-r border-burner-border flex flex-col bg-burner-card/30 lg:flex', showDetailOnMobile ? 'hidden' : 'flex']">
    <div class="p-4 flex flex-col border-b border-burner-border gap-4 bg-burner-card/20">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-black uppercase tracking-widest text-burner-text flex items-center gap-2">
          <Inbox class="w-4 h-4 text-burner-accent" />
          Inbox
        </h3>
        <span class="text-[10px] px-2 py-0.5 bg-burner-accent/10 text-burner-accent rounded-full font-bold">{{ messages.length }}</span>
      </div>
      
      <!-- Search Bar -->
      <div class="relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-burner-text-dim group-focus-within:text-burner-accent transition-colors" />
        <input 
          v-model="searchQuery"
          placeholder="Search inbox..."
          class="w-full bg-burner-dark/50 border border-burner-border rounded-xl pl-9 pr-4 py-2 text-xs text-burner-text placeholder:text-burner-text-dim/50 focus:outline-none focus:border-burner-accent transition-all shadow-inner"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-burner-text-dim hover:text-burner-text transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto divide-y divide-burner-border">
      <div v-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center p-8">
        <div class="h-16 w-16 bg-burner-text-dim/5 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
          <Search v-if="searchQuery" class="w-8 h-8 text-burner-text-dim/40" />
          <Mail v-else class="w-8 h-8 text-burner-text-dim/40" />
        </div>
        <p class="text-xs font-bold text-burner-text-dim uppercase tracking-wider">
          {{ searchQuery ? 'No matches found' : 'No Messages Yet' }}
        </p>
      </div>

      <div v-for="msg in filteredMessages" :key="msg.id" @click="fetchMessageContent(msg)" :class="['p-5 cursor-pointer transition-all hover:bg-burner-text-dim/5 relative animate-in fade-in slide-in-from-left-2 duration-300', selectedMessage?.id === msg.id ? 'bg-burner-accent/5 border-l-4 border-burner-accent' : 'border-l-4 border-transparent']">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-black text-burner-text truncate">{{ msg.from.name || msg.from.address.split('@')[0] }}</span>
          <span class="text-[10px] text-burner-text-dim font-mono">{{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
        <h4 class="text-xs font-bold text-burner-text/80 truncate mb-1">{{ msg.subject }}</h4>
        <p class="text-[10px] text-burner-text-dim line-clamp-2 leading-relaxed">{{ msg.intro }}</p>
      </div>
    </div>
  </div>
</template>
