<script setup>
import { ref, onMounted } from 'vue'
import { ShieldCheck, Mail, AlertTriangle } from 'lucide-vue-next'

const emailData = ref(null)
const error = ref(null)
const loading = ref(true)

onMounted(() => {
  try {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      error.value = 'No email data found in this link.'
      loading.value = false
      return
    }
    const decoded = decodeURIComponent(atob(hash))
    const parsed = JSON.parse(decoded)
    
    // Support both minified and full keys
    emailData.value = {
      subject: parsed.s || parsed.subject || '',
      from: parsed.f ? { address: parsed.f } : parsed.from,
      date: parsed.d || parsed.date,
      body: parsed.b || parsed.body
    }

    if (!emailData.value.subject && !emailData.value.body) {
      error.value = 'Invalid email share link.'
      loading.value = false
      return
    }
  } catch (e) {
    error.value = 'This share link is corrupted or invalid.'
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <div class="min-h-screen bg-burner-dark flex items-center justify-center p-4 lg:p-8">
    <!-- Loading -->
    <div v-if="loading" class="text-center">
      <div class="h-10 w-10 border-2 border-burner-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sm text-burner-text-dim font-bold">Loading shared email...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center max-w-md">
      <div class="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle class="w-8 h-8 text-red-400" />
      </div>
      <h1 class="text-xl font-black text-burner-text mb-2">Invalid Link</h1>
      <p class="text-sm text-burner-text-dim mb-8">{{ error }}</p>
      <a href="./" class="inline-flex items-center gap-2 bg-burner-accent text-white font-black text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-all">
        <ShieldCheck class="w-4 h-4" /> Open BurnerX
      </a>
    </div>

    <!-- Email Content -->
    <div v-else-if="emailData" class="w-full max-w-3xl">
      <!-- Header Banner -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <ShieldCheck class="w-5 h-5 text-burner-accent" />
        <span class="text-xs font-black text-burner-accent uppercase tracking-widest">Shared via BurnerX</span>
      </div>

      <!-- Email Card -->
      <div class="bg-burner-card border border-burner-border rounded-[2rem] overflow-hidden shadow-2xl">
        <!-- Email Header -->
        <div class="p-6 lg:p-8 border-b border-burner-border bg-burner-card/60">
          <h1 class="text-xl lg:text-2xl font-black text-burner-text leading-tight mb-4">
            {{ emailData.subject || '(No Subject)' }}
          </h1>
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div v-if="emailData.from" class="flex items-center gap-3">
              <div class="h-10 w-10 bg-burner-accent rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">
                {{ (emailData.from.name || emailData.from.address || '?')[0].toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-bold text-burner-text">{{ emailData.from.name || 'Unknown' }}</p>
                <p class="text-xs text-burner-text-dim">{{ emailData.from.address || '' }}</p>
              </div>
            </div>
            <div v-if="emailData.date" class="text-[10px] font-black text-burner-text-dim uppercase tracking-widest sm:ml-auto px-4 py-2 bg-burner-dark/50 rounded-full border border-burner-border">
              {{ new Date(emailData.date).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Email Body -->
        <div class="p-6 lg:p-10">
          <div class="prose prose-invert max-w-none email-content" v-html="emailData.body"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <a href="./" class="inline-flex items-center gap-2 text-xs font-bold text-burner-text-dim hover:text-burner-accent transition-colors">
          <Mail class="w-3.5 h-3.5" />
          Get your own burner email →
        </a>
      </div>
    </div>
  </div>
</template>
