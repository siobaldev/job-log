<script setup lang="ts">
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from "reka-ui";

const { toasts, remove } = useToast();
const isDesktop = useMediaQuery("(min-width: 31.25rem)");
</script>

<template>
  <ToastProvider :duration="4000" :swipe-direction="isDesktop ? 'right' : 'down'">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-start gap-3 rounded-sm border border-l-4 bg-bg-elevated p-2.5 shadow-lg data-[state=open]:animate-toast-in-bottom xs:data-[state=open]:animate-toast-in-right data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x) data-[swipe=move]:translate-y-(--reka-toast-swipe-move-y) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform"
      :class="toast.type === 'success' ? 'border-success text-success' : 'border-destruction text-destruction'"
      @update:open="(open: boolean) => { if (!open) remove(toast.id) }"
    >
      <Icon
        :name="toast.type === 'success' ? 'ph:check-circle' : 'ph:trash'"
        class="size-7! self-center"
        :class="toast.type === 'success' ? 'text-success' : 'text-destruction'"
        aria-hidden="true"
      />

      <div class="flex-1">
        <ToastTitle class="font-medium">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription v-if="toast.description" class="mt-0.5 text-sm">
          {{ toast.description }}
        </ToastDescription>
      </div>

      <ToastClose
        aria-label="Dismiss"
        class="cursor-pointer rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-btn-bg"
      >
        <Icon name="ph:x-bold" class="size-4" aria-hidden="true" />
      </ToastClose>
    </ToastRoot>

    <ToastViewport class="fixed left-0 xs:left-auto xs:right-4 bottom-2 z-50 m-0 flex w-full xs:max-w-sm list-none flex-col gap-2 p-4 outline-none" />
  </ToastProvider>
</template>
