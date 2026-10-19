<script setup lang="ts">
const list = ref<{ showNewest: () => Promise<void> }>();
</script>

<template>
  <main class="bg-bg-main">
    <div class="max-w-4xl mx-auto px-6 flex gap-y-15 flex-col py-10">
      <JobCaptureForm @job-added="list?.showNewest()" />

      <JobList ref="list" />
    </div>
  </main>
</template>
