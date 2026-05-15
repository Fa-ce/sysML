<template>
  <div class="browser panel-section">
    <div class="browser__header">
      <span class="panel-title">Model Browser</span>
      <a-button type="link" size="small" @click="expandAll = !expandAll">
        {{ expandAll ? "收起" : "展开" }}
      </a-button>
    </div>

    <div class="browser__body">
      <a-tree
        block-node
        :tree-data="treeData"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        @expand="onExpand"
        @select="onSelect"
      >
        <template #title="{ title, kind, icon, kindLabel }">
          <div class="tree-title">
            <span class="tree-icon">{{ icon }}</span>
            <span class="tree-name">{{ title }}</span>
            <span class="tree-kind">{{ kindLabel || kind }}</span>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useModelStore } from "@/stores/model.store";
import { useSelectionStore } from "@/stores/selection.store";
import { useUiStore } from "@/stores/ui.store";
import type { ModelElement } from "@/parser/types";
import { getKindMeta } from "@/constants/model-kinds";

const modelStore = useModelStore();
const selectionStore = useSelectionStore();
const uiStore = useUiStore();
const expandAll = ref(true);
const manualExpandedKeys = ref<string[]>([]);

const treeData = computed(() => buildTree(modelStore.model.elements));
const expandedKeys = computed(() => manualExpandedKeys.value);
const selectedKeys = computed(() =>
  selectionStore.selectedId ? [selectionStore.selectedId] : [],
);

watch(
  treeData,
  (nodes) => {
    manualExpandedKeys.value = expandAll.value ? flattenTreeKeys(nodes) : [];
  },
  { immediate: true },
);

watchEffect(() => {
  if (selectionStore.selectedId) {
    uiStore.setActiveRightTab("properties");
  }
});

watch(expandAll, (value) => {
  manualExpandedKeys.value = value ? flattenTreeKeys(treeData.value) : [];
});

function onSelect(keys: string[]) {
  const [id] = keys;
  if (!id) return;
  selectionStore.select(id, "node");
}

function onExpand(keys: string[]) {
  manualExpandedKeys.value = keys;
}

function buildTree(elements: ModelElement[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  elements.forEach((element: ModelElement) => {
    const meta = getKindMeta(element.kind);
    map.set(element.id, {
      key: element.id,
      title: element.name,
      kind: element.kind,
      icon: meta.icon,
      kindLabel: meta.label,
      children: [],
    });
  });

  elements.forEach((element: ModelElement) => {
    const node = map.get(element.id);
    if (!node) return;
    if (element.parentId && map.has(element.parentId)) {
      map.get(element.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function flattenTreeKeys(nodes: any[]) {
  const result: string[] = [];
  nodes.forEach((node) => {
    result.push(node.key);
    if (node.children?.length) {
      result.push(...flattenTreeKeys(node.children));
    }
  });
  return result;
}
</script>

<style scoped>
.browser {
  height: 100%;
}

.browser__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 10px;
}

.browser__body {
  min-height: 0;
  height: 100%;
  padding: 0 10px 16px;
  overflow: auto;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: var(--text-primary);
}

.tree-icon {
  width: 12px;
  flex-shrink: 0;
  text-align: center;
  font-size: 11px;
}

.browser :deep(.ant-tree-switcher) {
  width: 14px;
  margin-right: 0;
}

.browser :deep(.ant-tree-node-content-wrapper) {
  padding-inline: 0 2px;
}

.tree-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-kind {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 10px;
}
</style>
