<script setup lang="ts">
import { computed, inject, ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import type { Node } from "@antv/x6";

export interface CompartmentItem {
  name: string;
  type?: string;
  direction?: string;
}

export interface Compartment {
  title: string;
  items: CompartmentItem[];
}

export interface NodePayload {
  variant: string;
  viewContext?: string;
  isPrimary?: boolean;
  stereotype: string;
  name: string;
  typeRef?: string;
  multiplicity?: string;
  visibility?: string;
  isAbstract?: boolean;
  isVariation?: boolean;
  documentationTip?: string;
  compartments: Compartment[];
}

const getNode = inject<() => Node>("getNode");
const payload = ref<NodePayload | null>(null);
const rootEl = ref<HTMLDivElement | null>(null);
const isSelected = ref(false);

let unbindData: (() => void) | null = null;
let unbindSelected: (() => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let lastSize: { w: number; h: number } = { w: 0, h: 0 };

function syncPayload() {
  const node = getNode?.();
  if (!node) return;
  payload.value = node.getData<NodePayload>() ?? null;
}

function syncSize() {
  const node = getNode?.();
  if (!node || !rootEl.value) return;
  const rect = rootEl.value.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  // X6 缩放下 getBoundingClientRect 不靠谱，用 scrollWidth/Height 兜底
  const realW = Math.max(rootEl.value.scrollWidth, w);
  const realH = Math.max(rootEl.value.scrollHeight, h);
  if (realW === lastSize.w && realH === lastSize.h) return;
  if (realW < 80 || realH < 40) return;
  lastSize = { w: realW, h: realH };
  node.resize(realW, realH);
}

onMounted(() => {
  syncPayload();
  const node = getNode?.();
  if (!node) return;

  const dataHandler = () => syncPayload();
  node.on("change:data", dataHandler);
  unbindData = () => node.off("change:data", dataHandler);

  isSelected.value = (node as any).hasFocus?.() ?? false;
  const onSelect = (args: any) => {
    if (args.node?.id === node.id) isSelected.value = true;
  };
  const onUnselect = (args: any) => {
    if (args.node?.id === node.id) isSelected.value = false;
  };
  // X6 selection 事件通过 graph 触发，节点上可以监听 'node:selected'
  const graph = (node as any).model?.graph;
  graph?.on("node:selected", onSelect);
  graph?.on("node:unselected", onUnselect);
  unbindSelected = () => {
    graph?.off("node:selected", onSelect);
    graph?.off("node:unselected", onUnselect);
  };

  nextTick(() => {
    syncSize();
    if (rootEl.value && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => syncSize());
      resizeObserver.observe(rootEl.value);
    }
  });
});

watch(payload, () => nextTick(() => syncSize()), { deep: true });

onBeforeUnmount(() => {
  unbindData?.();
  unbindSelected?.();
  resizeObserver?.disconnect();
});

const hasMeta = computed(() => {
  const p = payload.value;
  if (!p) return false;
  return !!p.multiplicity || p.isAbstract || p.isVariation || !!p.documentationTip;
});

const visibleCompartments = computed(() => {
  return (payload.value?.compartments ?? []).filter((c) => c.items.length > 0);
});

const rootClass = computed(() => {
  const p = payload.value;
  if (!p) return [];
  const view = p.viewContext ?? "general";
  const isPrimary = p.isPrimary !== false;
  return [
    "sysml-node",
    `sysml-node--${p.variant}`,
    `sysml-view--${view}`,
    isPrimary ? "is-primary" : "is-secondary",
    isSelected.value ? "is-selected" : "",
  ].filter(Boolean);
});
</script>

<template>
  <div v-if="payload" ref="rootEl" :class="rootClass" :title="payload.documentationTip || ''">
    <div v-if="payload.variant === 'package'" class="sysml-node__tab">PKG</div>

    <div class="sysml-node__header">
      <span class="sysml-node__chip">«{{ payload.stereotype }}»</span>
      <div class="sysml-node__name-block">
        <div class="sysml-node__name">
          <span v-if="payload.visibility" class="sysml-node__visibility">{{
            payload.visibility
          }}</span>
          {{ payload.name }}
          <span v-if="payload.typeRef" class="sysml-node__type-suffix">
            : {{ payload.typeRef }}</span
          >
        </div>
        <div v-if="hasMeta" class="sysml-node__meta">
          <span v-if="payload.multiplicity" class="sysml-node__multiplicity">[{{
            payload.multiplicity
          }}]</span>
          <span v-if="payload.isAbstract" class="sysml-node__modifier">abstract</span>
          <span v-if="payload.isVariation" class="sysml-node__modifier">variation</span>
          <span v-if="payload.documentationTip" class="sysml-node__doc-icon">📄</span>
        </div>
      </div>
    </div>

    <div
      v-for="(section, idx) in visibleCompartments"
      :key="idx"
      class="sysml-node__compartment"
    >
      <div class="sysml-node__compartment-title">{{ section.title }}</div>
      <div
        v-for="(item, itemIdx) in section.items"
        :key="itemIdx"
        class="sysml-node__compartment-item"
      >
        <span class="sysml-node__compartment-item-bullet">▸</span>
        <span v-if="item.direction" class="sysml-node__compartment-item-direction">
          {{ item.direction }}
        </span>
        <span class="sysml-node__compartment-item-name">{{ item.name }}</span>
        <span v-if="item.type" class="sysml-node__compartment-item-type">{{ item.type }}</span>
      </div>
    </div>
  </div>
</template>
