<script setup lang="ts">
import type { JobSummary } from "~/types/job.types";

import { STATUSES } from "#shared/utils/statuses";

const route = useRoute();
const toast = useToast();
const { fetchJobBySlug, updateJobStatus, deleteJob } = useJobs();

const slug = String(route.params.slug);

// server: false because the visitor's session lives in the browser
const { data: job, error: loadError } = await useAsyncData(
  `job:${slug}`,
  () => fetchJobBySlug(slug),
  { server: true },
);

const notFound = computed(() => !job.value);
const readOnly = computed(() => !!job.value?.is_demo);

useHead({
  title: () => (job.value ? `${job.value.title || "Job"} at ${job.value.company || "Unknown company"}` : "Job"),
});

// Links come from AI-extracted text, so only allow http(s)
const safeLink = computed(() => {
  const link = job.value?.link?.trim();
  if (!link)
    return null;
  try {
    const url = new URL(link);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  }
  catch {
    return null;
  }
});

const actionError = ref("");

async function onStatusChange(status: string) {
  if (!job.value?.id)
    return;
  const previous = job.value.status;
  actionError.value = "";
  job.value = { ...job.value, status }; // optimistic
  try {
    await updateJobStatus(job.value.id, status);
    toast.success("Status updated", status);
  }
  catch {
    job.value = { ...job.value, status: previous };
    actionError.value = "Could not update the status. Try again.";
  }
}

const confirmOpen = ref(false);
const deleting = ref(false);
const deleteError = ref("");

watch(confirmOpen, (isOpen) => {
  if (isOpen)
    deleteError.value = "";
});

async function onDelete() {
  if (!job.value?.id)
    return;
  deleting.value = true;
  deleteError.value = "";
  try {
    await deleteJob(job.value.id);
    toast.success("Job deleted");
    confirmOpen.value = false;
    await navigateTo("/");
  }
  catch {
    deleteError.value = "Could not delete that job. Try again."; // stays inside the dialog
  }
  finally {
    deleting.value = false;
  }
}

function locationLine(job: JobSummary) {
  return job.location || "Location not specified"; ;
}

function salaryLine(job: JobSummary) {
  return job.salary || "Salary undisclosed";
}
</script>

<template>
  <main class="bg-bg-main">
    <div class="mx-auto max-w-4xl px-6 py-10" :class="notFound ? 'min-h-svh flex items-center justify-center' : ''">
      <div class="flex justify-between items-center mb-6">
        <NuxtLink
          v-if="!notFound"
          to="/"
          class="interactive-btn flex flex-nowrap w-fit items-center gap-x-2 rounded-sm text-sm font-medium uppercase text-brand-brown"
        >
          <span aria-hidden="true">←</span> BACK
        </NuxtLink>

        <ConfirmDeleteDialog
          v-if="job && !readOnly"
          v-model:open="confirmOpen"
          title="Delete this job?"
          :description="`${job.title || 'This job'} at ${job.company || 'Unknown company'} will be permanently deleted, including its saved drafts.`"
          :loading="deleting"
          :error="deleteError"
          @confirm="onDelete"
        >
          <button
            type="button"
            class="flex cursor-pointer items-center gap-x-2 rounded-sm border border-btn-bg px-4 py-2 text-sm font-medium uppercase text-btn-bg transition-colors duration-200 hover:border-destruction hover:text-destruction"
          >
            <Icon name="ph:trash" size="20" aria-hidden="true" />
            Delete
          </button>
        </ConfirmDeleteDialog>
      </div>

      <p v-if="loadError" class="field-error" role="alert">
        Could not load this job. Try again.
      </p>

      <div v-else-if="notFound" class="rounded-sm flex items-center text-center flex-col">
        <h1 class="mb-2 text-title font-bold">
          Job not found
        </h1>
        <p>
          It may have been deleted, or the link is wrong.
        </p>
        <NuxtLink
          to="/"
          class="interactive-btn mt-4 inline-block rounded-sm bg-btn-bg px-4 py-2.5 text-sm font-medium uppercase text-text-inverse"
        >
          <span aria-hidden="true">←</span> Back to jobs
        </NuxtLink>
      </div>

      <article v-else-if="job">
        <div class="mb-6">
          <h1 class="text-title font-medium">
            {{ job.title || "Untitled role" }}
          </h1>
          <p class="mb-3 text-lg">
            {{ job.company || "Unknown company" }}
            <span v-if="safeLink">
              ·
              <a :href="safeLink" target="_blank" rel="noopener noreferrer" class="underline whitespace-nowrap">
                View post<span aria-hidden="true" class="select-none"> ↗</span>
              </a>
            </span>
          </p>

          <p class="mb-1.5 flex items-center gap-2 opacity-90">
            <Icon name="ph:map-pin" size="20" aria-hidden="true" />
            {{ locationLine(job) }}
          </p>
          <p class="flex items-center gap-2 opacity-90" :class="job.work_mode ? 'mb-1.5' : 'mb-4'">
            <Icon name="ph:hand-coins" size="20" aria-hidden="true" />
            {{ salaryLine(job) }}
          </p>
          <p v-if="job.work_mode" class="mb-4 flex items-center gap-2 opacity-90">
            <Icon name="ph:clock" size="20" aria-hidden="true" />
            {{ job.work_mode }}
          </p>

          <p class="mb-4 flex items-center gap-2 opacity-90">
            <Icon name="ph:calendar-plus" size="20" aria-hidden="true" />
            Added on {{ formatDate(job.created_at) }}
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <label for="job-status" class="field-label">Update status</label>
            <StatusSelect
              id="job-status"
              :model-value="job.status"
              :options="STATUSES"
              @update:model-value="onStatusChange"
            />
          </div>

          <section v-if="job.summary">
            <h2 class="field-label">
              Summary
            </h2>
            <p>{{ job.summary }}</p>
          </section>

          <section v-if="job.tech_stack?.length">
            <h2 class="field-label">
              Tech stack
            </h2>
            <ul class="flex flex-wrap gap-2">
              <li
                v-for="tech in job.tech_stack"
                :key="tech"
                class="rounded-sm border bg-bg-elevated px-2 py-1 text-sm border-border-default text-badge-text"
              >
                {{ tech }}
              </li>
            </ul>
          </section>

          <section v-if="job.application_instructions?.length">
            <h2 class="field-label">
              How to apply
            </h2>
            <ul class="list-disc space-y-1 pl-5">
              <li v-for="(item, i) in job.application_instructions" :key="i">
                {{ item }}
              </li>
            </ul>
          </section>

          <section v-if="job.description">
            <JobDescription :source="job.description" />
          </section>

          <JobDraftPanel :job="job" />
        </div>

        <footer v-if="!readOnly" class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p v-if="actionError" class="field-error mt-0" role="alert">
            {{ actionError }}
          </p>
        </footer>
      </article>
    </div>
  </main>
</template>
