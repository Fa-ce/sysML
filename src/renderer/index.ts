import type { Cell } from "@antv/x6";
import type { SysmlModel } from "@/parser/types";
import type { DiagramView } from "@/stores/view.store";
import { getKindMeta } from "@/constants/model-kinds";

export function buildGraph(
  model: SysmlModel,
  view: DiagramView,
  positions: Record<string, { x: number; y: number }> = {},
): Cell.Metadata[] {
  const visibleElements = model.elements.filter((element) => {
    if (view === "requirements") {
      return ["requirementDef", "requirementUsage", "partDef", "package"].includes(
        element.kind,
      );
    }
    if (view === "ibd") {
      return ["partDef", "partUsage", "interfaceDef", "package", "port"].includes(
        element.kind,
      );
    }
    return !["attribute", "operation"].includes(element.kind);
  });

  const nodes = visibleElements.map((element, index) => {
    const theme = getKindMeta(element.kind);
    const position = positions[element.id];
    const isUsage = element.kind === "partUsage" || element.kind === "requirementUsage";
    return {
      id: element.id,
      shape: "rect",
      x: position?.x ?? 80 + (index % 4) * 240,
      y: position?.y ?? 80 + Math.floor(index / 4) * 140,
      width: 200,
      height: element.kind === "package" ? 92 : 82,
      attrs: {
        body: {
          fill: theme.bg,
          stroke: theme.border,
          strokeWidth: 1.5,
          rx: isUsage ? 8 : 4,
          ry: isUsage ? 8 : 4,
        },
        label: {
          text: `«${theme.label}»\n${element.name}${element.type ? ` : ${element.type}` : ""}`,
          fill: "#1f2937",
          fontSize: 12,
          fontWeight: 600,
          textAnchor: "middle",
          textVerticalAnchor: "middle",
          textWrap: {
            width: -24,
            height: -24,
          },
        },
      },
      data: element,
    };
  });

  const relations = model.relations
    .filter((relation) => {
      if (view === "requirements") {
        return relation.kind === "satisfy" || relation.kind === "containment";
      }
      if (view === "ibd") {
        return relation.kind === "binding" || relation.kind === "containment";
      }
      return true;
    })
    .map((relation) => {
      const targetId = visibleElements.find(
        (item) => item.id === relation.target || item.name === relation.target,
      )?.id;
      const sourceId = visibleElements.find(
        (item) => item.id === relation.source || item.name === relation.source,
      )?.id;
      if (!sourceId || !targetId) return null;
      return {
        id: relation.id,
        shape: "edge",
        source: { cell: sourceId },
        target: { cell: targetId },
        connector: { name: "smooth" },
        attrs: {
          line: {
            stroke:
              relation.kind === "binding"
                ? "#d38b00"
                : relation.kind === "satisfy"
                  ? "#c2397a"
                  : "#7b8798",
            strokeWidth: 1.3,
            strokeDasharray: relation.kind === "satisfy" ? "6 4" : undefined,
            targetMarker:
              relation.kind === "containment"
                ? null
                : { name: "block", width: 10, height: 10 },
          },
        },
        labels: relation.label
          ? [
              {
                attrs: {
                  label: {
                    text: relation.label,
                    fill: "#5f6f82",
                    fontSize: 11,
                  },
                },
              },
            ]
          : undefined,
        data: relation,
      };
    })
    .filter(Boolean) as Cell.Metadata[];

  const containment = visibleElements
    .filter((element) => element.parentId)
    .map((element) => ({
      id: `${element.parentId}->${element.id}:containment`,
      shape: "edge",
      source: { cell: element.parentId },
      target: { cell: element.id },
      attrs: {
        line: {
          stroke: "#b2bfce",
          strokeWidth: 1,
          opacity: 0.55,
        },
      },
      connector: { name: "smooth" },
      data: {
        id: `${element.parentId}->${element.id}:containment`,
        kind: "containment",
        source: element.parentId,
        target: element.id,
      },
    }));

  return [...nodes, ...containment, ...relations];
}
