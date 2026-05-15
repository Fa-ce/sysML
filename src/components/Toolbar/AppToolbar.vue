<template>
  <div class="toolbar">
    <div class="toolbar__brand">
      <div class="toolbar__logo">S</div>
      <div>
        <div class="toolbar__title">Syson Front</div>
        <div class="toolbar__subtitle">代码驱动建模工作台</div>
      </div>
    </div>

    <div class="toolbar__actions">
      <a-segmented
        :value="viewStore.activeView"
        :options="viewOptions"
        @change="onViewChange"
      />

      <a-input-search
        :value="viewStore.searchKeyword"
        placeholder="搜索模型元素"
        allow-clear
        class="toolbar__search"
        @change="onSearchChange"
      />

      <a-tag :color="modelStore.isParsing ? 'processing' : diagnosticColor">
        {{ statusText }}
      </a-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useModelStore } from "@/stores/model.store";
import { useViewStore } from "@/stores/view.store";

const modelStore = useModelStore();
const viewStore = useViewStore();

const viewOptions = [
  { label: "通用视图", value: "general" },
  { label: "互连视图", value: "ibd" },
  { label: "需求视图", value: "requirements" },
];

const errorCount = computed(
  () => modelStore.diagnostics.filter((item) => item.severity === "error").length,
);

const warningCount = computed(
  () => modelStore.diagnostics.filter((item) => item.severity === "warning").length,
);

const diagnosticColor = computed(() => {
  if (errorCount.value > 0) return "error";
  if (warningCount.value > 0) return "warning";
  return "success";
});

const statusText = computed(() => {
  if (modelStore.isParsing) return "解析中";
  if (errorCount.value > 0) return `${errorCount.value} 个错误`;
  if (warningCount.value > 0) return `${warningCount.value} 个警告`;
  return "模型就绪";
});

function onViewChange(value: string | number) {
  viewStore.setActiveView(value as "general" | "ibd" | "requirements");
}

function onSearchChange(event: Event) {
  const target = event.target as HTMLInputElement;
  viewStore.setSearchKeyword(target.value);
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.toolbar__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.toolbar__logo {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #0078d4, #2899f5);
}

.toolbar__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.toolbar__subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-secondary);
}

.toolbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar__search {
  width: 220px;
}
</style>
