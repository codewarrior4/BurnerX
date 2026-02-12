<script setup>
import { isLoading } from '../composables/useBurner'
</script>

<template>
  <div v-if="isLoading" class="absolute inset-0 bg-burner-dark/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
    <div class="h-16 w-16 border-4 border-burner-accent border-t-transparent rounded-full animate-spin mb-6"></div>
    <p class="text-burner-accent font-black tracking-[0.3em] text-[10px] animate-pulse uppercase">Syncing Flux Identity</p>
  </div>
</template>
