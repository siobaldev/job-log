<script setup lang="ts">
import appToast from "./components/app-toast.vue";
</script>

<template>
  <NuxtLoadingIndicator color="var(--color-brand-brown)" :height="4" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <appToast />
</template>
