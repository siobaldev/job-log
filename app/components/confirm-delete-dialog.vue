<!-- app/components/ConfirmDeleteDialog.vue -->
<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";

defineProps<{
  title: string;
  description: string;
  loading?: boolean;
  error?: string;
}>();
const emit = defineEmits<{ confirm: [] }>();

const { $lenis } = useNuxtApp();

const open = defineModel<boolean>("open", { default: false });

watch(open, (isOpen) => {
  if (isOpen)
    $lenis?.stop();
  else
    $lenis?.start();
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-text-main/40 data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out motion-reduce:animate-none"
      />

      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-default bg-bg-elevated p-5 outline-none"
        data-lenis-prevent
        @escape-key-down="(e: Event) => loading && e.preventDefault()"
        @interact-outside="(e: Event) => loading && e.preventDefault()"
      >
        <DialogTitle class="mb-2 text-lg font-medium">
          {{ title }}
        </DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>

        <p v-if="error" class="field-error" role="alert">
          {{ error }}
        </p>

        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <button
              type="button"
              :disabled="loading"
              class="cursor-pointer rounded-sm border border-btn-bg px-4 py-2 text-sm font-medium uppercase disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            :disabled="loading"
            class="flex cursor-pointer items-center gap-x-2 rounded-sm bg-destruction px-4 py-2 text-sm font-medium uppercase text-text-inverse disabled:cursor-not-allowed disabled:opacity-70"
            @click="emit('confirm')"
          >
            <Icon v-if="loading" name="ph:circle-notch-bold" class="size-4 animate-spin" aria-hidden="true" />
            {{ loading ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
