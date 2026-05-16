<template>
  <div class="canvas panel-section">
    <div class="canvas__header">
      <span class="panel-title">Diagram View</span>
      <div class="canvas__actions">
        <a-button size="small" @click="centerContent">适应画布</a-button>
        <a-button size="small" @click="refreshLayout">重排布局</a-button>
      </div>
    </div>

    <div class="canvas__stage">
      <div ref="containerRef" class="canvas__body" />
      <div ref="minimapRef" class="canvas__minimap" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Node } from "@antv/x6";
import { useModelStore } from "@/stores/model.store";
import { useViewStore } from "@/stores/view.store";
import { useSelectionStore } from "@/stores/selection.store";
import { useGraph } from "./useGraph";
import { buildGraph } from "@/renderer";
import { applyAutoLayout } from "@/composables/useAutoLayout";

const containerRef = ref<HTMLDivElement | null>(null);
const minimapRef = ref<HTMLDivElement | null>(null);
const modelStore = useModelStore();
const viewStore = useViewStore();
const selectionStore = useSelectionStore();
const graphController = useGraph(containerRef, minimapRef);

const renderGraph = (forceLayout = false) => {
  const graph = graphController.graph;
  if (!graph) return;
  const positions = viewStore.nodePositions[viewStore.activeView];
  graph.fromJSON({
    cells: buildGraph(modelStore.model, viewStore.activeView, positions) as any,
  });
  const hasSavedPosition = Object.keys(positions).length > 0;
  if (forceLayout || !hasSavedPosition) {
    // 等节点 Vue 组件挂载完成自适应尺寸后再布局
    setTimeout(() => {
      applyAutoLayout(graph);
      syncCurrentPositions();
      graph.centerContent();
    }, 50);
  }
};

onMounted(() => {
  const graph = graphController.create();
  if (!graph) return;

  // Inspector 联动：click 触发 selectionStore 同步
  graph.on("node:click", ({ node }) => {
    selectionStore.select(node.id, "node");
  });

  graph.on("edge:click", ({ edge }) => {
    selectionStore.select(edge.id, "edge");
  });

  graph.on("blank:click", () => {
    selectionStore.clear();
  });

  graph.on("node:moved", ({ node }: { node: Node }) => {
    const position = node.getPosition();
    viewStore.setNodePosition(viewStore.activeView, node.id, position);
  });

  renderGraph(true);
});

watch(
  [() => modelStore.model, () => viewStore.activeView, () => viewStore.graphVersion],
  () => {
    renderGraph();
  },
  { deep: true },
);

// 外部 selection store 变化 → 同步 X6 内部选中态
watch(
  [() => selectionStore.selectedId, () => selectionStore.selectedKind],
  ([id, kind]) => {
    const graph = graphController.graph;
    if (!graph) return;
    if (kind === "node" && id) {
      const node = graph.getCellById(id);
      if (node && node.isNode()) {
        graph.trigger("node:selected", { node });
      }
    } else {
      // 清除所有节点的 selected 状态
      graph.getNodes().forEach((node) => {
        graph.trigger("node:unselected", { node });
      });
    }
  },
);

onBeforeUnmount(() => {
  graphController.destroy();
});

function centerContent() {
  graphController.graph?.centerContent();
}

function refreshLayout() {
  const graph = graphController.graph;
  if (!graph) return;
  viewStore.clearNodePositions(viewStore.activeView);
  applyAutoLayout(graph);
  syncCurrentPositions();
  graph.centerContent();
}

function syncCurrentPositions() {
  const graph = graphController.graph;
  if (!graph) return;
  graph.getNodes().forEach((node) => {
    viewStore.setNodePosition(viewStore.activeView, node.id, node.getPosition());
  });
}
</script>

<style scoped>
.canvas {
  height: 100%;
}

.canvas__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 10px;
}

.canvas__actions {
  display: flex;
  gap: 8px;
}

.canvas__stage {
  position: relative;
  width: 100%;
  height: calc(100% - 54px);
}

.canvas__body {
  width: 100%;
  height: 100%;
}

.canvas__minimap {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 180px;
  height: 112px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
</style>
