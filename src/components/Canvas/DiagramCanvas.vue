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
import { getKindMeta } from "@/constants/model-kinds";

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
    applyAutoLayout(graph);
    syncCurrentPositions();
    graph.centerContent();
  }
  applySelectionState();
};

onMounted(() => {
  const graph = graphController.create();
  if (!graph) return;

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

watch(
  [() => selectionStore.selectedId, () => selectionStore.selectedKind],
  () => {
    applySelectionState();
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

function applySelectionState() {
  const graph = graphController.graph;
  if (!graph) return;

  graph.getNodes().forEach((node) => {
    const data = node.getData() as { kind?: Parameters<typeof getKindMeta>[0] } | undefined;
    const kind = data?.kind;
    if (!kind) return;
    const meta = getKindMeta(kind);
    const isUsage = kind === "partUsage" || kind === "requirementUsage";
    const isSelected =
      selectionStore.selectedKind === "node" && selectionStore.selectedId === node.id;

    node.attr({
      body: {
        stroke: isSelected ? "#0078D4" : meta.border,
        strokeWidth: isSelected ? 3 : 1.5,
        fill: meta.bg,
        rx: isUsage ? 8 : 4,
        ry: isUsage ? 8 : 4,
        filter: isSelected
          ? {
              name: "dropShadow",
              args: {
                dx: 0,
                dy: 2,
                blur: 6,
                color: "rgba(0, 120, 212, 0.28)",
              },
            }
          : undefined,
      },
    });
  });

  graph.getEdges().forEach((edge) => {
    const data = edge.getData() as { kind?: string } | undefined;
    const isSelected =
      selectionStore.selectedKind === "edge" && selectionStore.selectedId === edge.id;
    const baseStroke =
      data?.kind === "binding"
        ? "#d38b00"
        : data?.kind === "satisfy"
          ? "#c2397a"
          : data?.kind === "containment"
            ? "#b2bfce"
            : "#7b8798";
    const baseStrokeWidth = data?.kind === "containment" ? 1 : 1.3;

    edge.attr({
      line: {
        stroke: isSelected ? "#0078D4" : baseStroke,
        strokeWidth: isSelected ? 2.4 : baseStrokeWidth,
        opacity: data?.kind === "containment" ? 0.55 : 1,
      },
    });
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
