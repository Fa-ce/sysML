<template>
  <div class="inspector panel-section">
    <div class="inspector__header">
      <span class="panel-title">Inspector</span>
    </div>

    <div v-if="selectedElement" class="inspector__content">
      <a-descriptions :column="1" size="small">
        <a-descriptions-item label="名称">
          <span class="inspector__name">
            <a-tag v-if="boolDetail('isAbstract')" color="purple" class="inspector__tag">abstract</a-tag>
            <a-tag v-if="boolDetail('isVariation')" color="orange" class="inspector__tag">variation</a-tag>
            {{ selectedElement.name }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="类型">{{ selectedElement.kind }}</a-descriptions-item>
        <a-descriptions-item v-if="detailText('qualifiedName')" label="限定名">
          {{ detailText("qualifiedName") }}
        </a-descriptions-item>
        <a-descriptions-item label="路径">{{ selectedElement.path }}</a-descriptions-item>
        <a-descriptions-item label="定义行">{{ selectedElement.line }}</a-descriptions-item>
        <a-descriptions-item v-if="selectedElement.type" label="引用类型">
          {{ selectedElement.type }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('requirementId')" label="需求编号">
          {{ detailText("requirementId") }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('text')" label="文本">
          {{ detailText("text") }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('constraintExpr')" label="约束表达式">
          <code class="inspector__code">{{ detailText("constraintExpr") }}</code>
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('multiplicity')" label="多重度">
          {{ detailText("multiplicity") }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('visibility')" label="可见性">
          {{ detailText("visibility") }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('documentation')" label="文档">
          <div class="inspector__doc">{{ detailText("documentation") }}</div>
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('specialization')" label="特化">
          {{ detailText("specialization") }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailText('backendKind')" label="后端类型">
          {{ detailText("backendKind") }}
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
        <a-descriptions-item v-if="selectedRelation.line" label="定义行">
          {{ selectedRelation.line }}
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

function detailText(key: string) {
  const value = selectedElement.value?.details?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function boolDetail(key: string) {
  const value = selectedElement.value?.details?.[key];
  return value === true || value === "true";
}
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

.inspector__name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.inspector__tag {
  font-size: 11px;
  line-height: 1.4;
  margin-right: 2px;
}

.inspector__doc {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.inspector__code {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11.5px;
  background: rgba(0, 0, 0, 0.04);
  padding: 1px 6px;
  border-radius: 3px;
}
</style>
