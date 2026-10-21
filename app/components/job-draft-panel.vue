<script setup lang="ts">
import type { TONES } from "~~/shared/schemas/draft";

import { useDebounceFn } from "@vueuse/core";

import type { JobRow } from "~/types/job.types";

const props = defineProps<{ job: JobRow }>();
const toast = useToast();
const { saveDraft } = useJobs();

type DraftResult = { emailSubject: string | null; emailBody: string | null; coverLetter: string | null };

const tone = ref<(typeof TONES)[number]>("Semi-Formal");
const instructions = ref("");
const loading = ref(false);
const error = ref("");

const draft = reactive({
  emailSubject: props.job.email_subject ?? "",
  emailBody: props.job.email_body ?? "",
  coverLetter: props.job.cover_letter ?? "",
});

const hasEmail = computed(() => !!(draft.emailSubject || draft.emailBody));
const hasCover = computed(() => !!draft.coverLetter);

// Start with Email checked on a fresh job, or match whatever was already saved
const wantEmail = ref(hasEmail.value || !hasCover.value);
const wantCoverLetter = ref(hasCover.value);

const showEmail = computed(() => wantEmail.value && hasEmail.value);
const showCover = computed(() => wantCoverLetter.value && hasCover.value);
const canGenerate = computed(() => !loading.value && (wantEmail.value || wantCoverLetter.value));

const mailto = computed(
  () => `mailto:?subject=${encodeURIComponent(draft.emailSubject)}&body=${encodeURIComponent(draft.emailBody)}`,
);

async function persist(patch: { email_subject?: string; email_body?: string; cover_letter?: string }) {
  // Demo jobs are shared and read-only, so their drafts stay on screen only
  if (!props.job.id || props.job.is_demo)
    return;
  try {
    await saveDraft(props.job.id, patch);
  }
  catch {
    toast.error("Draft not saved", "It's shown here but will be lost if you leave.");
  }
}

async function generate() {
  if (!canGenerate.value)
    return;
  loading.value = true;
  error.value = "";
  try {
    const result = await $fetch<DraftResult>("/api/draft", {
      method: "POST",
      body: {
        title: props.job.title ?? "",
        company: props.job.company ?? "",
        description: props.job.description ?? "",
        techStack: props.job.tech_stack ?? [],
        applicationInstructions: props.job.application_instructions ?? [],
        tone: tone.value,
        wantEmail: wantEmail.value,
        wantCoverLetter: wantCoverLetter.value,
        instructions: instructions.value,
      },
    });

    const patch: { email_subject?: string; email_body?: string; cover_letter?: string } = {};
    if (result.emailSubject !== null && result.emailBody !== null) {
      draft.emailSubject = patch.email_subject = result.emailSubject;
      draft.emailBody = patch.email_body = result.emailBody;
    }
    if (result.coverLetter !== null)
      draft.coverLetter = patch.cover_letter = result.coverLetter;

    await persist(patch);
    toast.success("Draft ready");
  }
  catch (err: any) {
    error.value = err?.data?.statusMessage ?? err?.message ?? "Could not generate the draft. Try again.";
  }
  finally {
    loading.value = false;
  }
}

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }
  catch {
    toast.error("Could not copy", "Select the text and copy it manually.");
  }
}

// Saves manual edits 800ms after typing stops
const persistEdits = useDebounceFn(() => persist({
  email_subject: draft.emailSubject,
  email_body: draft.emailBody,
  cover_letter: draft.coverLetter,
}), 800);

watch(draft, persistEdits);
</script>

<template>
  <section class="mt-8 border-t border-border-default pt-6">
    <h3 class="mb-4 font-medium">
      Application draft
    </h3>

    <DraftOptions
      v-model:tone="tone"
      v-model:want-email="wantEmail"
      v-model:want-cover-letter="wantCoverLetter"
      class="mb-5"
    />

    <!-- Instructions -->
    <label for="draft-instructions" class="field-label w-fit">Instructions (Optional)</label>
    <AutoTextarea
      id="draft-instructions"
      v-model="instructions"
      rows="3"
      placeholder="e.g. Mention I can start in two weeks. Keep it short. Highlight my projects."
    />

    <p v-if="error" class="field-error" role="alert">
      {{ error }}
    </p>
    <p v-if="job.is_demo" class="mt-2 text-sm">
      This is a sample job. Drafts you generate here aren't saved.
    </p>

    <div class="mt-5 flex justify-end">
      <button
        type="button"
        :disabled="!canGenerate"
        class="interactive-btn flex items-center gap-x-2 rounded-sm bg-btn-bg px-4 py-2.5 text-sm font-medium uppercase text-text-inverse disabled:cursor-not-allowed disabled:opacity-70"
        @click="generate"
      >
        <Icon v-if="loading" name="ph:circle-notch-bold" class="size-4 animate-spin" aria-hidden="true" />
        {{ loading ? "Generating..." : hasEmail || hasCover ? "Regenerate draft" : "Generate draft" }}
        <span v-if="!loading" aria-hidden="true">↳</span>
      </button>
    </div>

    <!-- Email -->
    <div v-if="showEmail" class="mt-6">
      <div class="mb-1.5 flex items-center gap-2">
        <label for="draft-subject" class="field-label mb-0">Email Subject</label>
        <button
          type="button"
          class="cursor-pointer rounded-sm p-0.5 text-btn-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg"
          aria-label="Copy email subject"
          @click="copy(draft.emailSubject, 'Subject')"
        >
          <Icon name="ph:copy-bold" class="size-4" aria-hidden="true" />
        </button>
      </div>
      <AutoTextarea id="draft-subject" v-model="draft.emailSubject" placeholder="Your email subject will appear here" />

      <div class="mb-1.5 mt-5 flex items-center gap-2">
        <label for="draft-body" class="field-label mb-0">Email Body</label>
        <button
          type="button"
          class="cursor-pointer rounded-sm p-0.5 text-btn-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg"
          aria-label="Copy email body"
          @click="copy(draft.emailBody, 'Email body')"
        >
          <Icon name="ph:copy-bold" class="size-4" aria-hidden="true" />
        </button>
      </div>
      <AutoTextarea id="draft-body" v-model="draft.emailBody" placeholder="Your email body will appear here" />
    </div>

    <!-- Cover letter -->
    <div v-if="showCover" class="mt-6">
      <div class="mb-1.5 flex items-center gap-2">
        <label for="draft-cover" class="field-label mb-0">Cover Letter</label>
        <button
          type="button"
          class="cursor-pointer rounded-sm p-0.5 text-btn-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg"
          aria-label="Copy cover letter"
          @click="copy(draft.coverLetter, 'Cover letter')"
        >
          <Icon name="ph:copy-bold" class="size-4" aria-hidden="true" />
        </button>
      </div>
      <AutoTextarea id="draft-cover" v-model="draft.coverLetter" placeholder="Your cover letter will appear here" />
    </div>

    <div v-if="showEmail || showCover" class="mt-5 flex justify-end">
      <a
        :href="mailto"
        class="interactive-btn flex items-center gap-x-2 rounded-sm bg-btn-bg px-4 py-2.5 text-sm font-medium uppercase text-text-inverse"
      >
        Open in mail app <span aria-hidden="true">↳</span>
      </a>
    </div>
  </section>
</template>
