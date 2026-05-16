import { register } from "@antv/x6-vue-shape";
import NodeShell from "./NodeShell.vue";

// 把 ElementKind 转成 CSS class 后缀
// partDef -> part-def, useCaseDef -> use-case-def 等
function kindToVariant(kind: string): string {
  return kind
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

// 所有 SysML 元素类型共用 NodeShell，通过 variant 区分视觉
const SYSML_KINDS = [
  "package",
  "partDef",
  "partUsage",
  "itemDef",
  "itemUsage",
  "portDef",
  "portUsage",
  "connectionDef",
  "requirementDef",
  "requirementUsage",
  "interfaceDef",
  "interfaceUsage",
  "actionDef",
  "actionUsage",
  "stateDef",
  "stateUsage",
  "constraintDef",
  "constraintUsage",
  "useCaseDef",
  "useCaseUsage",
  "calculationDef",
  "calculationUsage",
  "caseDef",
  "analysisCaseDef",
  "verificationCaseDef",
  "viewDef",
  "viewUsage",
  "viewpointDef",
  "viewpointUsage",
  "renderingDef",
  "metadataDef",
  "comment",
  "documentation",
  "textualRepresentation",
  "subject",
  "stakeholder",
  "controlNode",
  "attribute",
  "attributeUsage",
  "operation",
  "port",
] as const;

let registered = false;

export function registerSysmlNodes() {
  if (registered) return;
  registered = true;

  SYSML_KINDS.forEach((kind) => {
    register({
      shape: `sysml-${kindToVariant(kind)}`,
      component: NodeShell as any,
      width: 260,
      height: 80,
    });
  });
}

export function getShapeName(kind: string): string {
  return `sysml-${kindToVariant(kind)}`;
}

export function getVariantName(kind: string): string {
  return kindToVariant(kind);
}
