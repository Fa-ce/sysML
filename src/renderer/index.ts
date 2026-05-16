import type { Cell, Node } from "@antv/x6";
import type { ElementKind, SysmlModel } from "@/parser/types";
import type { DiagramView } from "@/stores/view.store";
import { SYSML_EDGE_MAPPING, SYSML_NODE_MAPPING, SYSML_VIEW_MAPPING } from "@/constants/sysml-mapping";
import { getShapeName, getVariantName } from "@/components/Canvas/nodes";

interface CompartmentItem {
  name: string;
  type?: string;
  direction?: string;
}

interface Compartment {
  title: string;
  items: CompartmentItem[];
}

interface NodePayload {
  variant: string;
  viewContext: DiagramView;
  isPrimary: boolean;
  stereotype: string;
  name: string;
  typeRef?: string;
  multiplicity?: string;
  visibility?: string;
  isAbstract?: boolean;
  isVariation?: boolean;
  documentationTip?: string;
  compartments: Compartment[];
  element: SysmlModel["elements"][number];
}

// 每个视图的"主角"节点类型（其他被视为配角，会淡化 + 紧凑）
const VIEW_PRIMARY_KINDS: Record<DiagramView, Set<ElementKind>> = {
  general: new Set<ElementKind>([
    "package",
    "partDef",
    "itemDef",
    "portDef",
    "connectionDef",
    "interfaceDef",
    "requirementDef",
    "viewDef",
    "viewpointDef",
    "renderingDef",
    "metadataDef",
    "comment",
    "documentation",
  ]),
  ibd: new Set<ElementKind>([
    "partUsage",
    "portUsage",
    "interfaceUsage",
    "connectionDef",
    "interfaceDef",
  ]),
  requirements: new Set<ElementKind>([
    "requirementDef",
    "requirementUsage",
    "constraintDef",
    "constraintUsage",
    "caseDef",
    "analysisCaseDef",
    "verificationCaseDef",
    "subject",
    "stakeholder",
  ]),
  behavior: new Set<ElementKind>([
    "actionDef",
    "actionUsage",
    "stateDef",
    "stateUsage",
    "controlNode",
    "useCaseDef",
    "useCaseUsage",
    "calculationDef",
    "calculationUsage",
    "analysisCaseDef",
  ]),
};

export function buildGraph(
  model: SysmlModel,
  view: DiagramView,
  positions: Record<string, { x: number; y: number }> = {},
): Cell.Metadata[] {
  const viewConfig = SYSML_VIEW_MAPPING[view];
  const portMap = buildPortMap(model, view);
  const allElements = model.elements;
  const visibleElements = model.elements.filter((element) =>
    viewConfig.nodeWhitelist.includes(element.kind),
  );

  const nodes: Cell.Metadata[] = visibleElements.map((element, index) => {
    const position = positions[element.id];
    const payload = buildNodePayload(element, allElements, model.relations, view);
    const size = estimateNodeSize(payload);

    return {
      id: element.id,
      shape: getShapeName(element.kind),
      x: position?.x ?? 80 + (index % 4) * 300,
      y: position?.y ?? 80 + Math.floor(index / 4) * 220,
      width: size.width,
      height: size.height,
      ports: portMap.get(element.id),
      data: payload,
    };
  });

  const relations = model.relations
    .filter((relation) => relation.kind !== "containment")
    .filter((relation) => viewConfig.edgeWhitelist.includes(relation.kind))
    .map((relation) => {
      const edgeConfig = SYSML_EDGE_MAPPING[relation.kind];
      const sourceEndpoint = resolveEndpoint(relation.source, visibleElements, allElements, view);
      const targetEndpoint = resolveEndpoint(relation.target, visibleElements, allElements, view);
      if (!sourceEndpoint || !targetEndpoint) return null;

      const stereoLabel = edgeNeedsStereotype(relation.kind)
        ? `«${relation.kind}»`
        : relation.label;
      const routingStrategy = edgeRouter(relation.kind);

      return {
        id: relation.id,
        shape: "edge",
        source: sourceEndpoint,
        target: targetEndpoint,
        connector: routingStrategy.connector,
        router: routingStrategy.router,
        attrs: {
          line: {
            stroke: edgeConfig.stroke,
            strokeWidth: 1.5,
            strokeDasharray: edgeConfig.dashed ? "5 3" : undefined,
            targetMarker: buildArrowMarker(edgeConfig.marker, edgeConfig.stroke),
            sourceMarker:
              relation.kind === "binding"
                ? {
                    name: "block",
                    width: 8,
                    height: 6,
                    fill: edgeConfig.stroke,
                  }
                : undefined,
          },
        },
        labels: stereoLabel
          ? [
              {
                position: 0.5,
                attrs: {
                  label: {
                    text: stereoLabel,
                    fill: edgeConfig.stroke,
                    fontSize: 10,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontWeight: 600,
                  },
                  rect: {
                    fill: "#FFFFFF",
                    stroke: "#E2E8F0",
                    strokeWidth: 0.5,
                    rx: 4,
                    ry: 4,
                  },
                },
              },
            ]
          : undefined,
        zIndex: 1,
        data: relation,
      } as Cell.Metadata;
    })
    .filter(Boolean) as Cell.Metadata[];

  const containment: Cell.Metadata[] = visibleElements
    .filter((element) => element.parentId)
    .filter(() => viewConfig.edgeWhitelist.includes("containment"))
    .filter((element) =>
      visibleElements.some((other) => other.id === element.parentId),
    )
    .map((element) => ({
      id: `${element.parentId}->${element.id}:containment`,
      shape: "edge",
      source: { cell: element.parentId },
      target: { cell: element.id },
      attrs: {
        line: {
          stroke: SYSML_EDGE_MAPPING.containment.stroke,
          strokeWidth: 1.2,
          opacity: 0.65,
          targetMarker: null,
          sourceMarker: {
            name: "diamond",
            width: 12,
            height: 8,
            fill: "#FFFFFF",
            stroke: SYSML_EDGE_MAPPING.containment.stroke,
            strokeWidth: 1.2,
          },
        },
      },
      connector: { name: "rounded", args: { radius: 8 } },
      router: { name: "manhattan", args: { padding: 16 } },
      zIndex: 0,
      data: {
        id: `${element.parentId}->${element.id}:containment`,
        kind: "containment" as const,
        source: element.parentId!,
        target: element.id,
      },
    }));

  return [...nodes, ...containment, ...relations];
}

// === 按关系类型选择路由策略 ===
function edgeRouter(kind: string): { router: any; connector: any } {
  // 结构关系：用正交 router，干净简洁
  const structural = ["specialization", "subsetting", "redefinition", "dependency", "import", "expose", "reference", "annotate"];
  // 行为/数据流：用 metro/orth router + smooth connector，体现流动感
  const behavioral = ["flow", "succession", "transition", "perform", "exhibit", "send", "accept"];
  // 互连：用正交 router，强调结构
  const connection = ["connection", "binding"];
  // 需求满足：用正交 router + 圆角，醒目易读
  const requirement = ["satisfy", "require", "verify", "allocate"];

  if (structural.includes(kind)) {
    return {
      router: { name: "manhattan", args: { padding: 20, step: 12 } },
      connector: { name: "rounded", args: { radius: 6 } },
    };
  }
  if (behavioral.includes(kind)) {
    return {
      router: { name: "metro", args: { padding: 16, step: 10 } },
      connector: { name: "smooth" },
    };
  }
  if (connection.includes(kind)) {
    return {
      router: { name: "manhattan", args: { padding: 16, step: 10 } },
      connector: { name: "rounded", args: { radius: 4 } },
    };
  }
  if (requirement.includes(kind)) {
    return {
      router: { name: "manhattan", args: { padding: 24, step: 14 } },
      connector: { name: "rounded", args: { radius: 8 } },
    };
  }
  return {
    router: { name: "normal" },
    connector: { name: "rounded", args: { radius: 6 } },
  };
}

function buildArrowMarker(marker: "block" | "open" | "none" | undefined, color: string) {
  if (marker === "none") return null;
  if (marker === "open") {
    return {
      name: "block",
      width: 10,
      height: 8,
      fill: "#FFFFFF",
      stroke: color,
      strokeWidth: 1.2,
    };
  }
  return { name: "block", width: 10, height: 8, fill: color };
}

function edgeNeedsStereotype(kind: string): boolean {
  return ["satisfy", "verify", "require", "allocate", "perform", "exhibit"].includes(kind);
}

// === 估算节点尺寸（CSS 会自适应，X6 仍需要初始尺寸用于布局） ===
function estimateNodeSize(payload: NodePayload) {
  const headerH = 44;
  const compartmentHeaderH = 22;
  const itemH = 22;
  const compartmentPad = 12;

  const compartmentH = payload.compartments
    .filter((c) => c.items.length > 0)
    .reduce((sum, c) => sum + compartmentHeaderH + c.items.length * itemH + compartmentPad, 0);

  const baseHeight = headerH + compartmentH + 6;

  // 根据最长内容估算宽度
  const longestName =
    payload.compartments
      .flatMap((c) => c.items)
      .reduce((max, item) => {
        const text = `${item.direction ?? ""}${item.name}${item.type ?? ""}`;
        return Math.max(max, text.length);
      }, 0);

  const baseWidth = Math.max(240, Math.min(360, 180 + longestName * 6));

  return {
    width: baseWidth,
    height: Math.max(80, baseHeight),
  };
}

// === Element -> NodePayload 转换 ===
function buildNodePayload(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
  view: DiagramView,
): NodePayload {
  const theme = SYSML_NODE_MAPPING[element.kind];
  const variant = getVariantName(element.kind);
  const isPrimary = VIEW_PRIMARY_KINDS[view].has(element.kind);

  return {
    variant,
    viewContext: view,
    isPrimary,
    stereotype: theme.label,
    name: element.name,
    typeRef: element.type,
    multiplicity: stringOf(element.details?.multiplicity),
    visibility: visibilitySymbol(stringOf(element.details?.visibility)),
    isAbstract: boolOf(element.details?.isAbstract),
    isVariation: boolOf(element.details?.isVariation),
    documentationTip: stringOf(element.details?.documentation),
    compartments: isPrimary
      ? buildCompartmentsForKind(element, allElements, allRelations, view)
      : buildSecondaryCompartments(element, allElements, view),
    element,
  };
}

// 配角节点：所有视图下都不显示 compartment（保持紧凑）
// 注：IBD 视图下，配角 partDef 的端口已通过 buildPortMap 渲染为图形端口，
// 不需要在 compartment 重复显示文本列表。
function buildSecondaryCompartments(
  _element: SysmlModel["elements"][number],
  _allElements: SysmlModel["elements"],
  _view: DiagramView,
): Compartment[] {
  return [];
}

function buildCompartmentsForKind(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
  view: DiagramView,
): Compartment[] {
  // 特殊形状不需要 compartments（椭圆/圆/便签）
  const noCompartmentKinds = new Set([
    "useCaseDef",
    "useCaseUsage",
    "controlNode",
    "comment",
    "documentation",
    "textualRepresentation",
    "subject",
    "stakeholder",
    "attribute",
    "attributeUsage",
    "operation",
    "port",
    "portDef",
    "portUsage",
  ]);
  if (noCompartmentKinds.has(element.kind)) return [];

  switch (element.kind) {
    case "requirementDef":
    case "requirementUsage":
      return buildRequirementCompartments(element, allElements, allRelations);
    case "actionDef":
    case "actionUsage":
      return buildActionCompartments(element, allElements, allRelations);
    case "stateDef":
    case "stateUsage":
      return buildStateCompartments(element, allElements, allRelations);
    case "package":
      return buildPackageCompartments(element, allElements);
    case "interfaceDef":
    case "interfaceUsage":
      return buildInterfaceCompartments(element, allElements);
    case "connectionDef":
      return buildConnectionCompartments(element, allElements);
    default:
      return buildStructuralCompartments(element, allElements, allRelations, view);
  }
}

// === 结构类（part/item）的 compartment ===
function buildStructuralCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
  view: DiagramView,
): Compartment[] {
  const children = allElements.filter((item) => item.parentId === element.id);
  const backendAttrs = parseJsonArray<{ name: string; type: string }>(element.details?.attributes);
  const backendOps = parseJsonArray<{ name: string; params: string }>(element.details?.operations);
  const backendPorts = parseJsonArray<{ name: string; type: string; direction: string }>(
    element.details?.ports,
  );

  // IBD 视图：端口已作为图形端口（节点边缘的圆点）在 buildPortMap 中渲染，
  // 不在 compartment 重复显示文本端口列表。
  // 只显示 nested parts（子部件引用）这种 IBD 真正关心的信息。
  if (view === "ibd") {
    const nestedParts: CompartmentItem[] = children
      .filter((c) => c.kind === "partUsage")
      .slice(0, 5)
      .map((c) => ({ name: c.name, type: c.type }));
    return nestedParts.length > 0 ? [{ title: "parts", items: nestedParts }] : [];
  }

  const attributes: CompartmentItem[] = backendAttrs.length
    ? backendAttrs.slice(0, 6).map((a) => ({ name: a.name, type: a.type }))
    : children
        .filter((c) => c.kind === "attribute" || c.kind === "attributeUsage")
        .slice(0, 6)
        .map((c) => ({ name: c.name, type: c.type }));

  const ports: CompartmentItem[] = backendPorts.length
    ? backendPorts.slice(0, 6).map((p) => ({
        name: p.name,
        type: stripTilde(p.type),
        direction: p.direction || undefined,
      }))
    : children
        .filter((c) => c.kind === "port" || c.kind === "portUsage" || c.kind === "portDef")
        .slice(0, 6)
        .map((c) => ({
          name: c.name,
          type: c.type,
          direction: stringOf(c.details?.direction),
        }));

  const parts: CompartmentItem[] = children
    .filter((c) => c.kind === "partUsage" || c.kind === "partDef")
    .slice(0, 6)
    .map((c) => ({ name: c.name, type: c.type }));

  const operations: CompartmentItem[] = backendOps.slice(0, 4).map((o) => ({
    name: `${o.name}(${o.params || ""})`,
  }));

  const behaviors: CompartmentItem[] = [
    ...children
      .filter((c) => c.kind === "actionUsage" || c.kind === "actionDef")
      .slice(0, 3)
      .map((c) => ({ name: c.name, type: c.type })),
    ...children
      .filter((c) => c.kind === "stateUsage" || c.kind === "stateDef")
      .slice(0, 3)
      .map((c) => ({ name: c.name, type: c.type })),
    ...allRelations
      .filter((r) => r.source === element.id)
      .filter((r) => r.kind === "perform" || r.kind === "exhibit")
      .slice(0, 3)
      .map((r) => ({ name: `${r.kind} ${tailOf(r.target)}` })),
  ].slice(0, 6);

  return [
    { title: "attributes", items: attributes },
    { title: "operations", items: operations },
    { title: "ports", items: ports },
    { title: "parts", items: parts },
    { title: "behaviors", items: behaviors },
  ];
}

// === Requirement compartment ===
function buildRequirementCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const text = stringOf(element.details?.text);
  const reqId = stringOf(element.details?.requirementId);
  const constraintExpr = stringOf(element.details?.constraintExpr);

  const textItems: CompartmentItem[] = [];
  if (reqId) textItems.push({ name: `id: ${reqId}` });
  if (text) textItems.push({ name: truncate(text, 60) });

  const subjects = children
    .filter((c) => c.name.toLowerCase() === "subject" || c.kind === "subject")
    .slice(0, 3)
    .map((c) => ({ name: c.name, type: c.type }));

  const constraints: CompartmentItem[] = [
    ...(constraintExpr ? [{ name: truncate(constraintExpr, 50) }] : []),
    ...children
      .filter((c) => c.kind === "constraintUsage" || c.kind === "constraintDef")
      .slice(0, 4)
      .map((c) => ({ name: c.name, type: c.type })),
  ];

  const reqRelations: CompartmentItem[] = allRelations
    .filter((r) => r.source === element.id || r.target === element.id)
    .filter((r) => r.kind === "satisfy" || r.kind === "require" || r.kind === "verify")
    .slice(0, 5)
    .map((r) =>
      r.source === element.id
        ? { name: `${r.kind} →`, type: tailOf(r.target) }
        : { name: `${r.kind} ←`, type: tailOf(r.source) },
    );

  return [
    { title: "text", items: textItems },
    { title: "subject", items: subjects },
    { title: "constraints", items: constraints },
    { title: "relations", items: reqRelations },
  ];
}

// === Action compartment ===
function buildActionCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const parameters: CompartmentItem[] = children
    .filter((c) => c.kind === "attribute" || c.kind === "itemUsage" || c.kind === "itemDef")
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      type: c.type,
      direction: stringOf(c.details?.direction),
    }));

  const messaging: CompartmentItem[] = [
    ...stringOf(element.details?.accept)
      .split("\n")
      .filter(Boolean)
      .map((s) => ({ name: `accept ${s.trim()}` })),
    ...stringOf(element.details?.send)
      .split("\n")
      .filter(Boolean)
      .map((s) => ({ name: `send ${s.trim()}` })),
  ].slice(0, 4);

  const flows: CompartmentItem[] = allRelations
    .filter((r) => r.kind === "flow")
    .filter((r) => r.source.startsWith(element.id) || r.target.startsWith(element.id))
    .slice(0, 4)
    .map((r) => ({ name: `${tailOf(r.source)} → ${tailOf(r.target)}` }));

  return [
    { title: "parameters", items: parameters },
    { title: "send/accept", items: messaging },
    { title: "flow", items: flows },
  ];
}

// === State compartment ===
function buildStateCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
  allRelations: SysmlModel["relations"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const actions: CompartmentItem[] = [];
  const entry = stringOf(element.details?.entry).trim();
  const doAction = stringOf(element.details?.do).trim();
  const exit = stringOf(element.details?.exit).trim();
  if (entry) actions.push({ name: `entry`, type: entry });
  if (doAction) actions.push({ name: `do`, type: doAction });
  if (exit) actions.push({ name: `exit`, type: exit });

  const subStates: CompartmentItem[] = children
    .filter((c) => c.kind === "stateUsage" || c.kind === "stateDef")
    .slice(0, 5)
    .map((c) => ({ name: c.name }));

  const transitions: CompartmentItem[] = allRelations
    .filter((r) => r.kind === "transition")
    .filter((r) => r.source.startsWith(element.id) || r.target.startsWith(element.id))
    .slice(0, 5)
    .map((r) => ({ name: `${tailOf(r.source)} → ${tailOf(r.target)}` }));

  return [
    { title: "state actions", items: actions },
    { title: "substates", items: subStates },
    { title: "transitions", items: transitions },
  ];
}

// === Package compartment ===
function buildPackageCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const members: CompartmentItem[] = children.slice(0, 8).map((c) => ({
    name: c.name,
    type: SYSML_NODE_MAPPING[c.kind]?.label ?? c.kind,
  }));

  return [{ title: "members", items: members }];
}

// === Interface compartment ===
function buildInterfaceCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const ends: CompartmentItem[] = children
    .filter((c) => c.kind === "port" || c.kind === "portUsage" || c.kind === "portDef")
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      type: c.type,
      direction: stringOf(c.details?.direction),
    }));

  const features: CompartmentItem[] = children
    .filter((c) => c.kind === "attribute" || c.kind === "attributeUsage")
    .slice(0, 4)
    .map((c) => ({ name: c.name, type: c.type }));

  return [
    { title: "ends", items: ends },
    { title: "features", items: features },
  ];
}

// === Connection compartment ===
function buildConnectionCompartments(
  element: SysmlModel["elements"][number],
  allElements: SysmlModel["elements"],
): Compartment[] {
  const children = allElements.filter((c) => c.parentId === element.id);
  const ports: CompartmentItem[] = children
    .filter((c) => c.kind === "port" || c.kind === "portUsage")
    .slice(0, 6)
    .map((c) => ({ name: c.name, type: c.type }));

  return [{ title: "ends", items: ports }];
}

// === 工具函数 ===
function stringOf(value: unknown): string {
  return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
}

function boolOf(value: unknown): boolean {
  return value === true || value === "true";
}

function visibilitySymbol(value: string): string {
  if (value === "public") return "+";
  if (value === "private") return "-";
  if (value === "protected") return "#";
  return "";
}

function tailOf(ref: string): string {
  return ref.split("/").at(-1) ?? ref;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "…";
}

function stripTilde(type: string): string {
  return type.startsWith("~") ? type.slice(1) : type;
}

function parseJsonArray<T>(value: unknown): T[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

// === Endpoint resolver（保留原逻辑）===
function resolveEndpoint(
  ref: string,
  visibleElements: SysmlModel["elements"],
  allElements: SysmlModel["elements"],
  view: DiagramView,
) {
  const exactAny = allElements.find((item) => item.id === ref);
  if (
    exactAny &&
    (exactAny.kind === "port" || exactAny.kind === "portUsage") &&
    exactAny.parentId &&
    visibleElements.some((v) => v.id === exactAny.parentId)
  ) {
    return { cell: exactAny.parentId, port: exactAny.id };
  }

  const exactVisible = visibleElements.find((item) => item.id === ref || item.name === ref);
  if (exactVisible) {
    return { cell: exactVisible.id };
  }

  if (!ref.includes("/") && !ref.includes(".")) return null;

  const separator = ref.includes("/") ? "/" : ".";
  const segments = ref.split(separator);
  const portName = segments.at(-1);
  const hostPath = segments.slice(0, -1).join(separator);
  if (!portName || !hostPath) return null;

  const host = visibleElements.find((item) => item.id === hostPath || item.name === hostPath);
  if (!host) return null;

  const port = allElements.find(
    (item) =>
      item.parentId === host.id &&
      (item.kind === "port" || item.kind === "portUsage") &&
      item.name === portName,
  );

  if (port) {
    return { cell: host.id, port: port.id };
  }

  return { cell: host.id };
}

// === Port 渲染（IBD 视图使用）===
function buildPortMap(model: SysmlModel, view: DiagramView) {
  const result = new Map<
    string,
    {
      groups: Record<string, any>;
      items: Array<{ id: string; group: string; attrs?: Record<string, unknown> }>;
    }
  >();

  if (view !== "ibd") return result;

  const portHosts = new Set(["partDef", "partUsage", "interfaceDef", "interfaceUsage"]);
  const ports = model.elements.filter(
    (element) =>
      (element.kind === "port" || element.kind === "portUsage") &&
      element.parentId &&
      model.elements.some((host) => host.id === element.parentId && portHosts.has(host.kind)),
  );

  const grouped = new Map<string, typeof ports>();
  ports.forEach((port) => {
    const hostId = port.parentId!;
    if (!grouped.has(hostId)) grouped.set(hostId, []);
    grouped.get(hostId)!.push(port);
  });

  grouped.forEach((hostPorts, hostId) => {
    const leftPorts = hostPorts.filter((p) => p.details?.direction === "in");
    const rightPorts = hostPorts.filter((p) => p.details?.direction === "out");
    const topPorts = hostPorts.filter((p) => p.details?.direction === "inout");
    const neutralPorts = hostPorts.filter((p) => {
      const dir = p.details?.direction;
      return dir !== "in" && dir !== "out" && dir !== "inout";
    });

    const items: Array<{ id: string; group: string; attrs?: Record<string, unknown> }> = [];

    leftPorts.forEach((p) => items.push(createPortItem(p, "left", "#16A34A")));
    rightPorts.forEach((p) => items.push(createPortItem(p, "right", "#DC2626")));
    topPorts.forEach((p) => items.push(createPortItem(p, "top", "#CA8A04")));
    neutralPorts.forEach((p, idx) =>
      items.push(createPortItem(p, idx % 2 === 0 ? "right" : "left", "#3B82F6")),
    );

    result.set(hostId, {
      groups: {
        left: groupAttrs("left"),
        right: groupAttrs("right"),
        top: groupAttrs("top"),
      },
      items,
    });
  });

  return result;
}

function groupAttrs(position: "left" | "right" | "top") {
  const textAnchor = position === "left" ? "end" : position === "right" ? "start" : "middle";
  const textX = position === "left" ? -10 : position === "right" ? 10 : 0;
  const textY = position === "top" ? -10 : 0;
  return {
    position,
    markup: [
      { tagName: "circle", selector: "shape" },
      { tagName: "text", selector: "text" },
    ],
    attrs: {
      shape: {
        magnet: true,
        r: 5,
        stroke: "#475569",
        strokeWidth: 1.5,
        fill: "#FFFFFF",
      },
      text: {
        fontSize: 10,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fill: "#475569",
        textAnchor,
        textVerticalAnchor: position === "top" ? "bottom" : "middle",
        x: textX,
        y: textY,
      },
    },
  };
}

function createPortItem(
  port: SysmlModel["elements"][number],
  group: "left" | "right" | "top",
  stroke: string,
) {
  const details = port.details ?? {};
  const isConjugated = details.conjugated === true || details.conjugated === "true";
  const isProxy = details.proxy === true || String(details.kind ?? "").toLowerCase().includes("proxy");
  const isRef = details.ref === true || details.ref === "true";
  const isFull = details.full === true || String(details.kind ?? "").toLowerCase().includes("full");

  let fill = "#FFFFFF";
  let strokeDash: string | undefined;

  if (isFull) {
    fill = stroke;
  } else if (isConjugated) {
    fill = "#CBD5E1";
  }

  if (isRef || isProxy) {
    strokeDash = "2.5 1.5";
  }

  const direction = stringOf(details.direction);
  const dirPrefix = direction ? `${direction} ` : "";
  const tilde = isConjugated ? "~" : "";
  const typeText = port.type ? `: ${tilde}${stripTilde(port.type)}` : "";
  const labelText = `${dirPrefix}${port.name}${typeText}`;

  return {
    id: port.id,
    group,
    attrs: {
      shape: {
        magnet: true,
        r: 5,
        stroke,
        strokeWidth: 1.5,
        fill,
        strokeDasharray: strokeDash,
      },
      text: { text: labelText },
    },
  };
}

// === 给 Node 上 selected/hover 类（供 X6 选中时呼应 CSS）===
export function bindNodeStateClasses(node: Node) {
  // 占位：未来如果需要 X6 选中态 → DOM class 绑定，可以在 useGraph 里调用
}
