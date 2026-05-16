import type { ElementKind } from "@/parser/types";
import { SYSML_NODE_MAPPING } from "./sysml-mapping";

export interface KindMeta {
  icon: string;
  label: string;
  header: string;
  headerText: string;
  bg: string;
  border: string;
}

export const kindMetaMap: Record<ElementKind, KindMeta> = Object.fromEntries(
  Object.entries(SYSML_NODE_MAPPING).map(([kind, config]) => [
    kind,
    {
      icon: config.icon,
      label: config.label,
      header: config.header,
      headerText: config.headerText,
      bg: config.bg,
      border: config.border,
    },
  ]),
) as Record<ElementKind, KindMeta>;

export function getKindMeta(kind: ElementKind): KindMeta {
  return kindMetaMap[kind];
}
