<script setup lang="ts">
import { SelectContent, SelectIcon, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from "reka-ui";

defineProps<{
  modelValue: string;
  counts: Record<string, number>;
}>();
defineEmits<{ "update:modelValue": [value: string] }>();

const options = ["All Jobs", "Saved", "Applied", "Interview", "Offer", "Rejected"];

const statusBg: Record<string, string> = {
  "All Jobs": "bg-badge-bg-all border-badge-bg-all",
  "Saved": "bg-badge-bg-saved border-badge-bg-saved",
  "Applied": "bg-badge-bg-applied border-badge-bg-applied",
  "Interview": "bg-badge-bg-interview border-badge-bg-interview",
  "Offer": "bg-badge-bg-offer border-badge-bg-offer",
  "Rejected": "bg-badge-bg-rejected border-badge-bg-rejected",
};
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v as string)">
    <SelectTrigger
      aria-label="Filter jobs by application status"
      class="cursor-pointer rounded-sm w-full sm:w-40 px-4 py-2.5 text-sm text-center sm:text-start text-btn-bg font-medium uppercase border relative
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg"
      :class="[statusBg[modelValue]]"
    >
      <SelectValue>
        {{ modelValue }}
        <span>({{ counts[modelValue] ?? 0 }})</span>
      </SelectValue>
      <SelectIcon>
        <Icon name="ph:caret-down" class="size-3.5 absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent class="rounded-sm w-(--reka-select-trigger-width) max-h-[--reka-select-content-available-height] border border-border-default bg-bg-elevated shadow-xl" position="popper" :side-offset="5">
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option"
            :value="option"
            class="cursor-pointer relative text-center sm:text-start rounded-sm px-3 py-2 text-sm outline-none data-highlighted:bg-bg-input"
          >
            <SelectItemText>{{ option }} ({{ counts[option] ?? 0 }})</SelectItemText>
            <SelectItemIndicator class="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon name="ph:check-bold" class="size-3.5" aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
