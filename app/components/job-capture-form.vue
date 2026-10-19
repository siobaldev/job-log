<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { configure, useForm } from "vee-validate";

import type { Tone } from "#shared/schemas/draft";
import type { JobRow } from "~/types/job.types";

import { extractFormSchema } from "#shared/schemas/extract";

const emit = defineEmits<{ jobAdded: [] }>();
const toast = useToast();
const { addJob } = useJobs();
const user = useSupabaseUser();

const turnstileToken = ref("");
const tone = ref<Tone>("Semi-Formal");
const wantEmail = ref(true);
const wantCoverLetter = ref(false);
const isLoading = ref(false);
const submitError = ref("");

configure({
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
});

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(extractFormSchema),
  initialValues: { jobText: "" },
});
const [jobText, jobTextAttrs] = defineField("jobText");

type DraftResult = { emailSubject: string | null; emailBody: string | null; coverLetter: string | null };

const stage = ref<"" | "extracting" | "drafting">("");

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  submitError.value = "";
  let draftError = "";
  try {
    stage.value = "extracting";
    const extracted = await $fetch<Omit<JobRow, "id" | "status" | "created_at">>("/api/extract", {
      method: "POST",
      body: { jobText: values.jobText },
    });

    // Draft fields to save together with the job
    const draftFields: Pick<JobRow, "email_subject" | "email_body" | "cover_letter"> = { email_subject: null, email_body: null, cover_letter: null };

    if (wantEmail.value || wantCoverLetter.value) {
      stage.value = "drafting";
      try {
        const draft = await $fetch<DraftResult>("/api/draft", {
          method: "POST",
          body: {
            title: extracted.title,
            company: extracted.company,
            description: extracted.description,
            techStack: extracted.tech_stack,
            applicationInstructions: extracted.application_instructions,
            tone: tone.value,
            wantEmail: wantEmail.value,
            wantCoverLetter: wantCoverLetter.value,
            instructions: "",
          },
        });
        if (draft.emailSubject !== null && draft.emailBody !== null) {
          draftFields.email_subject = draft.emailSubject;
          draftFields.email_body = draft.emailBody;
        }
        if (draft.coverLetter !== null)
          draftFields.cover_letter = draft.coverLetter;
      }
      catch (err: any) {
        // A failed draft must not lose the extracted job
        draftError = err?.data?.statusMessage ?? "Could not generate the draft.";
      }
    }

    await addJob({ ...extracted, ...draftFields, status: "Saved" }, turnstileToken.value);
    resetForm();

    if (draftError)
      toast.error("Job saved without a draft", `${draftError} You can generate it from the job page.`);
    else
      toast.success("Job Saved", extracted.title ?? "Untitled Job");
    emit("jobAdded");
  }
  catch (err: any) {
    submitError.value = err?.data?.statusMessage ?? err?.message ?? "Could not extract that posting, try again.";
  }
  finally {
    isLoading.value = false;
    stage.value = "";
  }
});
</script>

<template>
  <div>
    <h1 class="mb-1 text-title font-bold">
      Job Log
    </h1>
    <p class="mb-5">
      Paste a job posting to extract key details, track your application, and prepare tailored application drafts.
    </p>

    <form
      novalidate
      class="rounded-sm border border-border-default bg-bg-elevated p-5"
      @submit.prevent="onSubmit"
    >
      <DraftOptions
        v-model:tone="tone"
        v-model:want-email="wantEmail"
        v-model:want-cover-letter="wantCoverLetter"
        class="mb-5"
      />

      <!-- Posting -->
      <label for="job-text" class="field-label w-fit">Job Posting</label>
      <textarea
        id="job-text"
        v-model="jobText"
        v-bind="jobTextAttrs"
        rows="5"
        :aria-invalid="!!errors.jobText"
        :aria-describedby="errors.jobText ? 'job-text-error' : undefined"
        placeholder="Paste the full job posting here, including the link if available..."
        class="field-input field-sizing-content min-h-40 max-h-100 overflow-y-auto"
      />
      <p v-if="errors.jobText" id="job-text-error" class="field-error" role="alert">
        {{ errors.jobText }}
      </p>
      <p v-if="submitError" class="field-error" role="alert">
        {{ submitError }}
      </p>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Extract key details from the posting.
        </p>
        <button
          type="submit"
          :disabled="isLoading || (!user && !turnstileToken)"
          class="w-full rounded-sm flex gap-x-2 items-center justify-center text-sm uppercase bg-btn-bg px-4 py-2.5 font-medium text-text-inverse interactive-btn sm:w-fit"
        >
          <Icon
            v-if="isLoading"
            name="ph:circle-notch-bold"
            class="size-4 animate-spin"
            aria-hidden="true"
          />
          {{ stage === 'drafting' ? 'Drafting...' : isLoading ? 'Extracting...' : 'Extract & Generate' }}
          <span v-if="!isLoading" aria-hidden="true">↳</span>
        </button>
      </div>
      <NuxtTurnstile v-if="!user" v-model="turnstileToken" :options="{ appearance: 'interaction-only' }" />
    </form>
  </div>
</template>
