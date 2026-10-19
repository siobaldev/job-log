<script setup lang="ts">
import type { JobSummary } from "~/types/job.types";

import { formatDate } from "#imports";

defineProps<{ job: JobSummary }>();

function locationLine(job: JobSummary) {
  return job.location || "Location not specified"; ;
}

function salaryLine(job: JobSummary) {
  return job.salary || "Salary undisclosed";
}
</script>

<template>
  <div class="rounded-sm border border-border-default bg-bg-elevated p-5">
    <div class="mb-4 flex items-center justify-between">
      <JobStatus :status="job.status" />
      <span class="text-sm opacity-90">{{ formatDate(job.created_at) }}</span>
    </div>

    <h3 class="font-medium">
      {{ job.title }}
    </h3>
    <p class="mb-3 text-sm">
      {{ job.company }}
    </p>

    <p class="mb-1.5 flex items-center gap-2 text-sm opacity-90">
      <Icon name="ph:map-pin" size="16" aria-hidden="true" />
      {{ locationLine(job) }}
    </p>
    <p class="flex items-center gap-2 text-sm opacity-90" :class="job.work_mode ? 'mb-1.5' : 'mb-4'">
      <Icon name="ph:hand-coins" size="16" aria-hidden="true" />
      {{ salaryLine(job) }}
    </p>
    <p v-if="job.work_mode" class="mb-4 flex items-center text-sm gap-2 opacity-90">
      <Icon name="ph:clock" size="16" aria-hidden="true" />
      {{ job.work_mode }}
    </p>

    <NuxtLink :to="`/jobs/${job.slug}`" class="interactive-btn flex w-full justify-center items-center gap-2 rounded-sm bg-btn-bg text-text-inverse px-4 py-2.5 font-medium uppercase">
      View <span aria-hidden="true">↗</span>
    </NuxtLink>
  </div>
</template>
