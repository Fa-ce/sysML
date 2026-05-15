import type { ElementKind } from "@/parser/types";

export interface KindMeta {
  icon: string;
  label: string;
  header: string;
  headerText: string;
  bg: string;
  border: string;
}

export const kindMetaMap: Record<ElementKind, KindMeta> = {
  package: {
    icon: "📁",
    label: "包",
    header: "#5B9BD5",
    headerText: "#fff",
    bg: "#F0F4FA",
    border: "#5B9BD5",
  },
  partDef: {
    icon: "■",
    label: "部件定义",
    header: "#388A34",
    headerText: "#fff",
    bg: "#F0F7F0",
    border: "#388A34",
  },
  partUsage: {
    icon: "□",
    label: "部件",
    header: "#5CB85C",
    headerText: "#fff",
    bg: "#F0F7F0",
    border: "#5CB85C",
  },
  requirementDef: {
    icon: "📋",
    label: "需求定义",
    header: "#B8860B",
    headerText: "#fff",
    bg: "#FDFAF0",
    border: "#B8860B",
  },
  requirementUsage: {
    icon: "📄",
    label: "需求",
    header: "#D4A017",
    headerText: "#fff",
    bg: "#FDFAF0",
    border: "#D4A017",
  },
  interfaceDef: {
    icon: "○",
    label: "接口定义",
    header: "#9B59B6",
    headerText: "#fff",
    bg: "#F8F2F8",
    border: "#9B59B6",
  },
  attribute: {
    icon: "⬡",
    label: "属性",
    header: "#4B5563",
    headerText: "#fff",
    bg: "#F9FAFB",
    border: "#9CA3AF",
  },
  operation: {
    icon: "⚙",
    label: "操作",
    header: "#5B6ABF",
    headerText: "#fff",
    bg: "#F0F2F8",
    border: "#5B6ABF",
  },
  port: {
    icon: "◎",
    label: "端口",
    header: "#3B7DD8",
    headerText: "#fff",
    bg: "#E8F0FE",
    border: "#3B7DD8",
  },
};

export function getKindMeta(kind: ElementKind): KindMeta {
  return kindMetaMap[kind];
}
