<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { debounce } from "lodash-es";
import AppLayout from "@/components/Layout/AppLayout.vue";
import { useModelStore } from "@/stores/model.store";
import { useParser } from "@/composables/useParser";
import { storage } from "@/services/storage";

const modelStore = useModelStore();
const { parse } = useParser();

const parseSource = debounce(async (text: string) => {
  modelStore.setIsParsing(true);
  await parse(text);
}, 350);

watch(
  () => modelStore.sourceText,
  (text) => {
    parseSource(text);
    storage.saveProject({
      id: "default",
      name: "default",
      sourceText: text,
      updatedAt: Date.now(),
    });
  },
  { immediate: true },
);

onMounted(() => {
  parseSource(modelStore.sourceText);
});
</script>

