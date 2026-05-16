<template>
  <div class="snippets panel-section">
    <div class="snippets__header">
      <span class="panel-title">Snippet Library</span>
    </div>

    <div class="snippets__body">
      <section
        v-for="group in groups"
        :key="group.name"
        class="snippet-group"
      >
        <div class="snippet-group__title">{{ group.name }}</div>
        <a-card
          v-for="snippet in group.items"
          :key="snippet.id"
          size="small"
          class="snippet-card"
          @click="insertSnippet(snippet.body)"
        >
          <template #title>
            <span class="snippet-card__title">
              <span class="snippet-card__icon">&lt;/&gt;</span>
              <span>{{ snippet.title }}</span>
            </span>
          </template>
          <p>{{ snippet.description }}</p>
        </a-card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { fetchRemoteSnippets } from "@/api/sysml";
import { useUiStore } from "@/stores/ui.store";

const uiStore = useUiStore();

const groups = computed(() => {
  return Object.entries(uiStore.snippetCategories).map(([name, items]) => ({
    name,
    items: items.map((item) => ({
      id: item.key,
      title: item.label,
      description: item.code,
      body: item.code,
    })),
  }));
});

function insertSnippet(snippet: string) {
  uiStore.queueSnippetInsert(snippet);
}

onMounted(async () => {
  try {
    const result = await fetchRemoteSnippets();
    uiStore.setSnippetCategories(result.categories);
  } catch (error) {
    console.warn("加载代码片段失败:", error);
  }
});
</script>

<style scoped>
.snippets {
  height: 100%;
  min-height: 0;
}

.snippets__header {
  padding: 16px 18px 10px;
}

.snippets__body {
  min-height: 0;
  overflow: auto;
  padding: 0 14px 18px;
}

.snippet-group + .snippet-group {
  margin-top: 14px;
}

.snippet-group__title {
  margin-bottom: 8px;
  color: var(--brand);
  font-size: 12px;
  letter-spacing: 0.06em;
}

.snippet-card {
  cursor: pointer;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}

.snippet-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 120, 212, 0.28);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.08);
}

.snippet-card + .snippet-card {
  margin-top: 8px;
}

.snippet-card__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.snippet-card__icon {
  color: #0033b3;
  font-size: 11px;
  font-weight: 700;
}

.snippet-card p {
  margin: 0;
  color: var(--text-secondary);
}
</style>
