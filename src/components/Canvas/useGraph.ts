import { Graph, MiniMap } from "@antv/x6";
import type { Ref } from "vue";

export function useGraph(
  containerRef: Ref<HTMLDivElement | null>,
  minimapRef: Ref<HTMLDivElement | null>,
) {
  let graph: Graph | null = null;

  const create = () => {
    if (!containerRef.value) return null;
    graph = new Graph({
      container: containerRef.value,
      autoResize: true,
      background: {
        color: "#FAFBFC",
      },
      grid: {
        visible: true,
        size: 16,
        type: "dot",
        args: { color: "#CBD5E1", thickness: 1 },
      },
      panning: { enabled: true, eventTypes: ["leftMouseDown"] },
      mousewheel: {
        enabled: true,
        modifiers: ["ctrl", "meta"],
        factor: 1.1,
        minScale: 0.3,
        maxScale: 2.5,
      },
      interacting: {
        nodeMovable: true,
        edgeMovable: false,
        edgeLabelMovable: false,
        arrowheadMovable: false,
        vertexMovable: false,
        vertexAddable: false,
        vertexDeletable: false,
      },
      translating: {
        restrict: false,
      },
      connecting: {
        allowBlank: false,
        allowNode: false,
        allowEdge: false,
        allowLoop: false,
      },
      highlighting: {
        nodeAvailable: {
          name: "stroke",
          args: { padding: 4, attrs: { "stroke-width": 2, stroke: "#3B82F6" } },
        },
      },
    });

    // 单选 + 高亮节点
    let selectedNodeId: string | null = null;
    const setSelected = (id: string | null) => {
      if (selectedNodeId === id) return;
      const prev = selectedNodeId;
      selectedNodeId = id;
      if (prev) graph?.trigger("node:unselected", { node: graph.getCellById(prev) });
      if (id) graph?.trigger("node:selected", { node: graph.getCellById(id) });
    };
    graph.on("node:click", ({ node }) => setSelected(node.id));
    graph.on("blank:click", () => setSelected(null));

    // 边 hover 高亮
    graph.on("edge:mouseenter", ({ edge }) => {
      const stroke = edge.attr("line/stroke");
      edge.attr("line/strokeWidth", 2.5);
      edge.attr("line/_originalStroke", stroke);
      edge.toFront();
    });
    graph.on("edge:mouseleave", ({ edge }) => {
      edge.attr("line/strokeWidth", 1.5);
    });

    if (minimapRef.value) {
      graph.use(
        new MiniMap({
          container: minimapRef.value,
          width: 200,
          height: 130,
          padding: 8,
          scalable: true,
          graphOptions: {
            async: true,
            background: {
              color: "#FAFBFC",
            },
          },
        }),
      );
    }
    return graph;
  };

  const destroy = () => {
    graph?.dispose();
    graph = null;
  };

  return {
    get graph() {
      return graph;
    },
    create,
    destroy,
  };
}
