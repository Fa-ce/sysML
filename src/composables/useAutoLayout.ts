import { DagreLayout } from "@antv/layout";
import type { Graph } from "@antv/x6";

export function applyAutoLayout(graph: Graph) {
  const cells = graph.getCells();
  const nodes = cells
    .filter((cell) => cell.isNode())
    .map((cell) => ({
      id: cell.id,
      width: cell.getSize().width,
      height: cell.getSize().height,
    }));
  if (!nodes.length) return;

  const edges = cells
    .filter((cell) => cell.isEdge())
    .map((cell) => {
      const edge = cell.toJSON();
      return {
        source: edge.source?.cell,
        target: edge.target?.cell,
      };
    })
    .filter((edge) => edge.source && edge.target) as Array<{
    source: string;
    target: string;
  }>;

  const layout = new DagreLayout({
    type: "dagre",
    rankdir: "TB",
    align: "UL",
    nodesep: 72,
    ranksep: 120,
    controlPoints: true,
  });

  const result = layout.layout({ nodes, edges });
  result.nodes?.forEach((node) => {
    const cell = graph.getCellById(node.id) as any;
    cell?.position((node as any).x ?? 0, (node as any).y ?? 0);
  });
}
