<script setup>
import { ref, onMounted } from 'vue'
import { initBurner, isSidebarOpen } from './composables/useBurner'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import MessageList from './components/MessageList.vue'
import MessageDetail from './components/MessageDetail.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import SharedEmailView from './components/SharedEmailView.vue'

const isShareMode = ref(false)

onMounted(() => {
  // Detect ?share or #encoded-data share links
  const hash = window.location.hash
  if (hash && hash.length > 1) {
    isShareMode.value = true
  }
})

// Only init the full app if not in share mode
if (!window.location.hash || window.location.hash.length <= 1) {
  initBurner()
}
</script>

<template>
  <!-- Shared Email View (standalone, no app chrome) -->
  <SharedEmailView v-if="isShareMode" />

  <!-- Normal App -->
  <div v-else class="flex h-screen overflow-hidden bg-burner-dark text-burner-text font-sans selection:bg-burner-accent/30">
    
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"></div>

    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative overflow-hidden">
      <Header />

      <!-- Content Area -->
      <div class="flex-1 flex overflow-hidden">
        <MessageList />
        <MessageDetail />
      </div>
    </main>

    <LoadingOverlay />
  </div>
</template>

<style>
/* Global Styles for Email Content */
.email-content { 
  overflow-wrap: break-word; 
}
.email-content img { 
  max-width: 100%; 
  height: auto; 
  border-radius: 1.5rem; 
  margin: 2rem 0; 
}
.email-content a { 
  font-weight: 900; 
  text-decoration: underline; 
}

/* Animations matching your aesthetic */
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes slide-in {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out forwards;
}
</style>
