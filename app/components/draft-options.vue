<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui";

import type { Tone } from "#shared/schemas/draft";

import { TONES } from "#shared/schemas/draft";

const tone = defineModel<Tone>("tone", { required: true });
const wantEmail = defineModel<boolean>("wantEmail", { required: true });
const wantCoverLetter = defineModel<boolean>("wantCoverLetter", { required: true });

const checkboxClass
  = "flex size-5 items-center justify-center rounded-sm border-2 border-border-default data-[state=checked]:border-btn-bg data-[state=checked]:bg-btn-bg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg duration-200 transition-colors ease-in-out hover:border-border-hover";
</script>

<template>
  <div class="flex flex-col gap-5">
    <fieldset>
      <legend class="field-label">
        Tone
      </legend>
      <RadioGroupRoot v-model="tone" class="flex flex-wrap gap-5">
        <label v-for="option in TONES" :key="option" class="flex cursor-pointer items-center gap-2">
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

    <fieldset>
      <legend class="field-label">
        Generate
      </legend>
      <div class="flex flex-wrap gap-5">
        <label class="flex w-fit cursor-pointer items-center gap-2">
          <CheckboxRoot
            :model-value="wantEmail"
            :class="checkboxClass"
            @update:model-value="wantEmail = $event === true"
          >
            <CheckboxIndicator class="flex items-center justify-center">
              <Icon name="ph:check-bold" class="size-4 text-text-inverse" aria-hidden="true" />
            </CheckboxIndicator>
          </CheckboxRoot>
          Email Draft
        </label>

        <label class="flex w-fit cursor-pointer items-center gap-2">
          <CheckboxRoot
            :model-value="wantCoverLetter"
            :class="checkboxClass"
            @update:model-value="wantCoverLetter = $event === true"
          >
            <CheckboxIndicator class="flex items-center justify-center">
              <Icon name="ph:check-bold" class="size-4 text-text-inverse" aria-hidden="true" />
            </CheckboxIndicator>
          </CheckboxRoot>
          Cover Letter
        </label>
      </div>
    </fieldset>
  </div>
</template>
