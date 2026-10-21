<!-- app/components/AutoTextarea.vue -->
<script setup lang="ts">
const model = defineModel<string>({ default: "" });
const el = ref<HTMLTextAreaElement>();

function resize() {
  const t = el.value;
  if (!t)
    return;
  t.style.height = "auto";
  // scrollHeight excludes borders, so add them back (border-box)
  t.style.height = `${t.scrollHeight + t.offsetHeight - t.clientHeight}px`;
}

watch(model, () => nextTick(resize));
onMounted(() => {
  resize();
  window.addEventListener("resize", resize); // wrapping changes with width
});
onBeforeUnmount(() => window.removeEventListener("resize", resize));
</script>

<template>
  <textarea
    ref="el"
    v-model="model"
    rows="1"
    class="field-input resize-none overflow-hidden"
  />
</template>
