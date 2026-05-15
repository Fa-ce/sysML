<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useModelStore } from "@/stores/model.store";
import { storage } from "@/services/storage";
import { exampleSysmlSource } from "@/data/example.sysml";

const modelStore = useModelStore();

onMounted(async () => {
  const cached = await storage.loadProject("default");
  modelStore.setSourceText(cached?.sourceText ?? exampleSysmlSource);
});
</script>

