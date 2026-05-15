<template>
  <div class="inspector panel-section">
    <div class="inspector__header">
      <span class="panel-title">Inspector</span>
    </div>

    <div v-if="selectedElement" class="inspector__content">
      <a-descriptions :column="1" size="small">
        <a-descriptions-item label="名称">{{ selectedElement.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ selectedElement.kind }}</a-descriptions-item>
        <a-descriptions-item label="路径">{{ selectedElement.path }}</a-descriptions-item>
        <a-descriptions-item label="定义行">{{ selectedElement.line }}</a-descriptions-item>
        <a-descriptions-item v-if="selectedElement.type" label="引用类型">
          {{ selectedElement.type }}
        </a-descriptions-item>
        <a-descriptions-item label="源码">{{ selectedElement.source }}</a-descriptions-item>
      </a-descriptions>
    </div>

    <div v-else-if="selectedRelation" class="inspector__content">
      <a-descriptions :column="1" size="small">
        <a-descriptions-item label="关系">{{ selectedRelation.kind }}</a-descriptions-item>
        <a-descriptions-item label="源">{{ selectedRelation.source }}</a-descriptions-item>
        <a-descriptions-item label="目标">{{ selectedRelation.target }}</a-descriptions-item>
        <a-descriptions-item v-if="selectedRelation.label" label="标签">
          {{ selectedRelation.label }}
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <div v-else class="inspector__empty">
      选中模型元素后，这里显示属性与关系详情。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSelectionStore } from "@/stores/selection.store";

const selectionStore = useSelectionStore();

const selectedElement = computed(() => selectionStore.selectedElement);
const selectedRelation = computed(() => selectionStore.selectedRelation);
</script>

<style scoped>
.inspector {
  height: 100%;
  min-height: 0;
}

.inspector__header {
  padding: 16px 18px 10px;
}

.inspector__content,
.inspector__empty {
  min-height: 0;
  overflow: auto;
  padding: 0 18px 18px;
  color: var(--text-primary);
}

.inspector__empty {
  color: var(--text-secondary);
  line-height: 1.7;
}
</style>
