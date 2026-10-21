<script setup lang="ts">
import { PaginationNext, PaginationPrev, PaginationRoot } from "reka-ui";

import type { JobSummary } from "~/types/job.types";

import { ALL_JOBS } from "#shared/utils/all-job-status";
import { STATUSES } from "#shared/utils/statuses";

const FILTER_OPTIONS = [ALL_JOBS, ...STATUSES];

const PAGE_SIZE = 10;

const route = useRoute();
const router = useRouter();
const { fetchJobPage } = useJobs();

defineExpose({ showNewest });

// The URL is the source of truth
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page ?? "1")) || 1));
const filter = computed(() => String(route.query.status ?? ALL_JOBS));
const appliedSearch = computed(() => String(route.query.q ?? ""));

function setQuery(patch: Record<string, string | number | undefined>, replace = false) {
  const query: Record<string, any> = { ...route.query, ...patch };
  if (!query.q)
    delete query.q;
  if (!query.status || query.status === ALL_JOBS)
    delete query.status;
  if (!query.page || Number(query.page) <= 1)
    delete query.page;
  return replace ? router.replace({ query }) : router.push({ query });
}

const { data, status: loadStatus, refresh } = await useAsyncData(
  "jobs",
  () => fetchJobPage({ page: page.value, pageSize: PAGE_SIZE, status: filter.value, search: appliedSearch.value }),
  {
    watch: [page, filter, appliedSearch],
    default: () => ({ jobs: [] as JobSummary[], total: 0, counts: {} as Record<string, number> }),
  },
);

const jobs = computed(() => data.value.jobs);
const total = computed(() => data.value.total);
const counts = computed(() => data.value.counts);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
const isFiltering = computed(() => !!appliedSearch.value || filter.value !== ALL_JOBS);

// `search` follows every keystroke; the URL updates 300ms after typing stops
const search = ref(appliedSearch.value);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (value !== appliedSearch.value)
      setQuery({ q: value, page: 1 }, true); // replace: typing shouldn't fill the history
  }, 300);
});
watch(appliedSearch, (value) => { // back/forward button
  if (value !== search.value)
    search.value = value;
});
onBeforeUnmount(() => clearTimeout(searchTimer));

// A stale link to a page that no longer exists
watch([totalPages, loadStatus], ([count, s]) => {
  if (s === "success" && page.value > count)
    setQuery({ page: count }, true);
});

// Another tab may have changed things
const visibility = useDocumentVisibility();
watch(visibility, (v) => {
  if (v === "visible")
    refresh();
});

const listTop = ref<HTMLElement>();
function goToPage(p: number) {
  setQuery({ page: p });
  listTop.value?.scrollIntoView({ block: "start" });
}

function clearSearch() {
  clearTimeout(searchTimer);
  search.value = "";
  setQuery({ q: undefined, page: 1 });
}

// Called by the capture form after saving: the new job is on page 1 of "All Jobs"
async function showNewest() {
  clearTimeout(searchTimer);
  search.value = "";
  if (page.value === 1 && !isFiltering.value)
    await refresh();
  else
    await setQuery({ q: undefined, status: undefined, page: 1 });
}
</script>

<template>
  <div>
    <div ref="listTop" class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-1 items-center gap-2 rounded-sm border border-border-default bg-bg-input focus-within:border-border-hover focus-within:outline-3 focus-within:outline-border-hover/10 px-4 py-2.5">
        <Icon name="ph:magnifying-glass" class="size-4 opacity-50" aria-hidden="true" />
        <input
          v-model="search"
          type="text"
          aria-label="Search jobs by company or title"
          placeholder="Search by company or job title..."
          class="w-full text-sm focus:outline-none"
        >
        <button
          v-if="search"
          type="button"
          class="cursor-pointer opacity-60 flex transition-opacity duration-200 hover:opacity-100"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <Icon name="ph:x-bold" class="size-3.5 self-center" aria-hidden="true" />
        </button>
      </div>

      <StatusSelect
        v-model="filter"
        :options="FILTER_OPTIONS"
        :counts="counts"
        aria-label="Filter jobs by application status"
        @update:model-value="setQuery({ status: $event, page: 1 })"
      />
    </div>

    <p class="sr-only" role="status">
      {{ total }} {{ total === 1 ? "job" : "jobs" }} found
    </p>

    <p v-if="loadStatus !== 'success' && !jobs.length" class="py-10 text-center">
      Loading jobs...
    </p>

    <div v-else-if="!jobs.length" class="rounded-sm border border-border-default bg-bg-elevated px-6 py-10 text-center">
      <p v-if="!isFiltering">
        No jobs saved yet. Paste a posting above to add one.
      </p>
      <template v-else>
        <p>No jobs match your search.</p>
      </template>
    </div>

    <div v-else :aria-busy="loadStatus === 'pending'" :class="{ 'opacity-60 transition-opacity': loadStatus === 'pending' }">
      <JobTable :jobs="jobs" class="hidden xs:block" />
      <div class="flex flex-col gap-4 xs:hidden">
        <JobCard v-for="job in jobs" :key="job.id" :job="job" />
      </div>

      <PaginationRoot
        :page="page"
        :total="total"
        :items-per-page="PAGE_SIZE"
        class="mt-5 flex items-center justify-center xs:justify-end gap-4"
        @update:page="goToPage"
      >
        <PaginationPrev
          class="rounded-sm w-fit border border-btn-bg px-4 py-2 text-sm font-medium uppercase interactive-btn flex gap-x-2 text-btn-bg"
        >
          ← <span class="hidden xs:block">Previous</span>
        </PaginationPrev>

        <span class="text-sm">Page {{ page }} of {{ totalPages }}</span>

        <PaginationNext
          class="w-fit rounded-sm text-sm sm:w-fit uppercase bg-btn-bg px-4 py-2.5 flex gap-x-2 font-medium text-text-inverse interactive-btn"
        >
          <span class="hidden xs:block">Next </span>→
        </PaginationNext>
      </PaginationRoot>
    </div>
  </div>
</template>
