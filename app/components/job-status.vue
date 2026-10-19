<script setup lang="ts">
defineProps<{ status: string }>();

const colorMap: Record<string, string> = {
  Saved: "decoration-badge-bg-saved",
  Applied: "decoration-badge-bg-applied",
  Interview: "decoration-badge-bg-interview",
  Offer: "decoration-badge-bg-offer",
  Rejected: "decoration-badge-bg-rejected",
};
</script>

<template>
  <span :class="colorMap[status] ?? 'decoration-badge-bg-saved'" class="text-sm uppercase underline decoration-4 underline-offset-4">
    {{ status }}
  </span>
</template>
