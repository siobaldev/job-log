<script setup lang="ts">
import { renderMarkdown } from "~/utils/markdown";

const props = defineProps<{ source: string }>();

const html = computed(() => renderMarkdown(props.source));
</script>

<template>
  <div class="job-prose overflow-hidden" v-html="html" />
</template>
