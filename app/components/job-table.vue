<script setup lang="ts">
import type { JobSummary } from "~/types/job.types";

import { formatDate } from "#imports";

defineProps<{ jobs: JobSummary[] }>();

function metaLine(job: JobSummary) {
  return [
    job.location || "Not specified",
    job.work_mode,
    job.salary ? `${job.salary} per month` : "Salary not specified",
  ].filter(Boolean).join(" · ");
}
</script>

<template>
  <ul class="rounded-sm border w-full border-border-default bg-bg-elevated">
    <li
      v-for="job in jobs"
      :key="job.id"
      class="flex items-center justify-between gap-6 border-b border-border-default px-6 py-5 last:border-0"
    >
      <div>
        <p>
          <span class="font-medium">{{ job.title }}</span> — {{ job.company }}
        </p>
        <p class="mt-1 text-sm opacity-90">
          {{ metaLine(job) }}
        </p>
        <p class="mt-3 text-sm">
          <JobStatus :status="job.status" />
          <span class="opacity-90"> · {{ formatDate(job.created_at) }}</span>
        </p>
      </div>

      <NuxtLink :to="`/job/${job.slug}`" class="interactive-btn flex flex-nowrap items-center gap-x-2 rounded-sm border border-btn-bg px-4 py-2.5 text-sm font-medium uppercase text-brand-brown">
        View <span aria-hidden="true">↗</span>
      </NuxtLink>
    </li>
  </ul>
</template>
