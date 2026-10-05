<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui";

const tone = ref("Semi-Formal");
const wantEmail = ref(true);
const wantCoverLetter = ref(false);
</script>

<template>
  <div>
    <h1 class="mb-1 text-title font-bold">
      Job Log
    </h1>
    <p class="mb-5">
      Paste a job posting to extract key details, track your application, and prepare tailored application drafts.
    </p>

    <div class="rounded-sm border border-border-default bg-bg-elevated p-5">
      <!-- Tone -->
      <fieldset class="mb-5">
        <legend class="field-label">
          Tone
        </legend>

        <RadioGroupRoot v-model="tone" class="flex flex-wrap gap-5">
          <label
            v-for="option in ['Casual', 'Semi-Formal', 'Formal']"
            :key="option"
            class="flex cursor-pointer items-center gap-2"
          >
            <RadioGroupItem
              :value="option"
              class="size-5 rounded-full flex cursor-pointer items-center justify-center border-border-default data-[state=checked]:border-border-hover border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg duration-200 transition-colors ease-in-out hover:border-border-hover"
            >
              <RadioGroupIndicator class="size-3.5 rounded-full bg-btn-bg" />
            </RadioGroupItem>
            {{ option }}
          </label>
        </RadioGroupRoot>
      </fieldset>

      <!-- Generate -->
      <fieldset class="mb-5">
        <legend class="field-label">
          Generate
        </legend>

        <div class="flex flex-wrap gap-5">
          <label class="flex cursor-pointer items-center gap-2 w-fit">
            <CheckboxRoot
              v-model="wantEmail"
              class="flex size-5 items-center justify-center rounded-sm border-2 border-border-default data-[state=checked]:border-btn-bg data-[state=checked]:bg-btn-bg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg duration-200 transition-colors ease-in-out hover:border-border-hover"
            >
              <CheckboxIndicator class="flex items-center justify-center">
                <Icon name="ph:check-bold" class="size-4 text-text-inverse" aria-hidden="true" />
              </CheckboxIndicator>
            </CheckboxRoot>
            Email Draft
          </label>

          <label class="flex cursor-pointer items-center gap-2 w-fit">
            <CheckboxRoot
              v-model="wantCoverLetter"
              class="flex size-5 items-center cursor-pointer justify-center rounded-sm border-2 border-border-default data-[state=checked]:border-btn-bg data-[state=checked]:bg-btn-bg not-checked:border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg duration-200 transition-colors ease-in-out hover:border-border-hover"
            >
              <CheckboxIndicator class="flex items-center justify-center">
                <Icon name="ph:check-bold" class="size-4 text-text-inverse" aria-hidden="true" />
              </CheckboxIndicator>
            </CheckboxRoot>
            Cover Letter Draft
          </label>
        </div>
      </fieldset>

      <!-- Posting -->
      <label for="job-text" class="field-label w-fit">Job Posting</label>
      <textarea
        id="job-text"
        rows="5"
        placeholder="Paste the full job posting here, including the link if available..."
        class="field-input min-h-40 resize-y"
      />

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Extract key details from the posting.
        </p>
        <button
          type="button"
          class="w-full rounded-sm flex gap-x-2 text-sm uppercase bg-btn-bg px-4 py-2.5 font-medium text-text-inverse interactive-btn sm:w-fit"
        >
          Extract & Generate <span aria-hidden="true">↳</span>
        </button>
      </div>
    </div>
  </div>
</template>
