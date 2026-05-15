<template>
  <div class="errors panel-section">
    <div class="errors__header">
      <span class="panel-title">Diagnostics</span>
      <span class="errors__count">{{ modelStore.diagnostics.length }} 条</span>
    </div>

    <div class="errors__body">
      <a-empty v-if="!modelStore.diagnostics.length" description="暂无错误或警告" />
      <div
        v-for="item in modelStore.diagnostics"
        :key="`${item.line}-${item.message}`"
        class="error-item"
        :class="`error-item--${item.severity}`"
      >
        <div class="error-item__meta">
          <span>{{ item.severity.toUpperCase() }}</span>
          <span>Line {{ item.line }}</span>
        </div>
        <div class="error-item__message">{{ item.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModelStore } from "@/stores/model.store";

const modelStore = useModelStore();
</script>

<style scoped>
.errors {
  height: 100%;
}

.errors__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
}

.errors__count {
  color: var(--text-secondary);
  font-size: 12px;
}

.errors__body {
  min-height: 0;
  height: 100%;
  overflow: auto;
  padding: 0 18px 18px;
}

.error-item {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-soft);
}

.error-item + .error-item {
  margin-top: 10px;
}

.error-item--error {
  border-color: rgba(196, 43, 28, 0.22);
}

.error-item--warning {
  border-color: rgba(183, 110, 0, 0.22);
}

.error-item__meta {
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.error-item__message {
  color: var(--text-primary);
  line-height: 1.6;
}
</style>
