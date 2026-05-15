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
        color: "#f9fafb",
      },
      grid: {
        visible: true,
        size: 12,
        type: "mesh",
        args: { color: "rgba(148, 163, 184, 0.18)" },
      },
      panning: true,
      mousewheel: {
        enabled: true,
        modifiers: ["ctrl", "meta"],
        factor: 1.08,
      },
      interacting: {
        edgeMovable: false,
        edgeLabelMovable: false,
        arrowheadMovable: false,
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
    });
    if (minimapRef.value) {
      graph.use(
        new MiniMap({
          container: minimapRef.value,
          width: 180,
          height: 112,
          padding: 8,
          scalable: true,
          graphOptions: {
            async: true,
            background: {
              color: "#f9fafb",
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
