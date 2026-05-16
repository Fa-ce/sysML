import type { DiagnosticItem, ElementKind, RelationKind, SysmlModel } from "@/parser/types";

const BASE = "http://localhost:8000";

interface BackendNode {
  id: string;
  kind: string;
  name: string;
  qualifiedName: string;
  parentId: string;
  attributes: Array<{ name: string; type: string }>;
  operations: Array<{ name: string; params: string }>;
  ports: Array<{ name: string; type: string; direction: string }>;
  multiplicity: string;
  typeRef: string;
  text: string;
  constraintExpr: string;
  requirementId: string;
  requirementText: string;
  isAbstract: boolean;
  isVariation: boolean;
  visibility: string;
  specialization: string[];
  documentation: string;
  sourceLine: number;
}

interface BackendEdge {
  id: string;
  kind: string;
  sourceId: string;
  targetId: string;
  label: string;
}

interface BackendParseResult {
  nodes: BackendNode[];
  edges: BackendEdge[];
  errors: Array<{ line: number; column: number; message: string; severity: string }>;
}

export interface BackendSnippet {
  key: string;
  label: string;
  code: string;
}

export async function parseSysmlRemote(source: string) {
  const response = await fetch(`${BASE}/api/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  if (!response.ok) {
    throw new Error(`解析服务调用失败: ${response.status}`);
  }

  const result = (await response.json()) as BackendParseResult;
  return adaptBackendParseResult(result);
}

export async function fetchRemoteSnippets() {
  const response = await fetch(`${BASE}/api/snippets`);
  if (!response.ok) {
    throw new Error(`片段服务调用失败: ${response.status}`);
  }
  return (await response.json()) as { categories: Record<string, BackendSnippet[]> };
}

function adaptBackendParseResult(result: BackendParseResult): {
  model: SysmlModel;
  diagnostics: DiagnosticItem[];
  unmappedKinds: { nodeKinds: string[]; edgeKinds: string[] };
} {
  const kindMap: Record<string, ElementKind> = {
    Package: "package",
    PartDefinition: "partDef",
    PartUsage: "partUsage",
    RequirementDefinition: "requirementDef",
    RequirementUsage: "requirementUsage",
    InterfaceDefinition: "interfaceDef",
    InterfaceUsage: "interfaceUsage",
    PortDefinition: "portDef",
    PortUsage: "portUsage",
    AttributeDefinition: "attribute",
    AttributeUsage: "attributeUsage",
    ActionDefinition: "actionDef",
    ActionUsage: "actionUsage",
    StateDefinition: "stateDef",
    StateUsage: "stateUsage",
    ConstraintDefinition: "constraintDef",
    ConstraintUsage: "constraintUsage",
    ItemDefinition: "itemDef",
    ItemUsage: "itemUsage",
    ConnectionDefinition: "connectionDef",
    UseCaseDefinition: "useCaseDef",
    UseCaseUsage: "useCaseUsage",
    CalculationDefinition: "calculationDef",
    CalculationUsage: "calculationUsage",
    CaseDefinition: "caseDef",
    AnalysisCaseDefinition: "analysisCaseDef",
    VerificationCaseDefinition: "verificationCaseDef",
    ViewDefinition: "viewDef",
    ViewUsage: "viewUsage",
    ViewpointDefinition: "viewpointDef",
    ViewpointUsage: "viewpointUsage",
    RenderingDefinition: "renderingDef",
    MetadataDefinition: "metadataDef",
    Comment: "comment",
    Documentation: "documentation",
    TextualRepresentation: "textualRepresentation",
    SubjectMembership: "subject",
    StakeholderMembership: "stakeholder",
  };

  const relationMap: Record<string, RelationKind> = {
    Containment: "containment",
    Binding: "binding",
    Satisfy: "satisfy",
    Require: "require",
    Verify: "verify",
    Dependency: "dependency",
    Import: "import",
    Expose: "expose",
    Connection: "connection",
    Flow: "flow",
    Succession: "succession",
    TransitionUsage: "transition",
    Specialization: "specialization",
    Redefinition: "redefinition",
    Subsetting: "subsetting",
    ReferenceSubsetting: "reference",
    PerformActionUsage: "perform",
    ExhibitStateUsage: "exhibit",
    SendActionUsage: "send",
    AcceptActionUsage: "accept",
    AnnotationEdge: "annotate",
    Allocation: "allocate",
    AllocationDefinition: "allocate",
    AllocationUsage: "allocate",
  };

  const unmappedNodeKinds = new Set<string>();
  const unmappedEdgeKinds = new Set<string>();

  const nodeById = new Map(result.nodes.map((node) => [node.id, node]));
  const definitionByName = new Map<string, BackendNode>();
  result.nodes.forEach((node) => {
    if (node.kind.endsWith("Definition")) {
      definitionByName.set(node.name, node);
    }
  });

  const elements = result.nodes.map((node) => {
    const kind = kindMap[node.kind];
    if (!kind) unmappedNodeKinds.add(node.kind);
    return {
      id: node.id,
      name: node.name,
      kind: kind ?? "package",
      parentId: node.parentId || undefined,
      path: node.qualifiedName.replace(/\./g, "/"),
      line: node.sourceLine,
      source: node.qualifiedName,
      type: node.typeRef || undefined,
      details: {
        text: node.requirementText || node.text || "",
        requirementId: node.requirementId || "",
        multiplicity: node.multiplicity || "",
        visibility: node.visibility || "",
        documentation: node.documentation || "",
        specialization: node.specialization.join(","),
        constraintExpr: node.constraintExpr || "",
        qualifiedName: node.qualifiedName || "",
        isAbstract: node.isAbstract,
        isVariation: node.isVariation,
        sourceLine: String(node.sourceLine ?? ""),
        backendKind: node.kind,
        attributes: JSON.stringify(node.attributes ?? []),
        operations: JSON.stringify(node.operations ?? []),
        ports: JSON.stringify(node.ports ?? []),
      },
    };
  });

  const inferredPortElements = inferPortElementsFromBackend(result.nodes, definitionByName, kindMap);
  elements.push(...inferredPortElements);

  const elementById = new Map(elements.map((element) => [element.id, element]));

  const relations = result.edges
    .map((edge) => {
      const mappedKind = relationMap[edge.kind];
      if (!mappedKind) unmappedEdgeKinds.add(edge.kind);
      const resolved = resolveBackendEdgeEndpoints(edge, nodeById, definitionByName, elementById);
      if (!resolved) return null;
      return {
        id: edge.id,
        kind: mappedKind ?? "reference",
        source: resolved.source,
        target: resolved.target,
        label: edge.label || edge.kind,
        line: 0,
      };
    })
    .filter(Boolean) as SysmlModel["relations"];

  const diagnostics: DiagnosticItem[] = result.errors.map((item) => ({
    line: item.line,
    column: item.column,
    offset: 0,
    length: 1,
    severity: item.severity === "error" ? "error" : "warning",
    message: item.message,
  }));

  return {
    model: { elements, relations },
    diagnostics,
    unmappedKinds: {
      nodeKinds: [...unmappedNodeKinds],
      edgeKinds: [...unmappedEdgeKinds],
    },
  };
}

function inferPortElementsFromBackend(
  nodes: BackendNode[],
  definitionByName: Map<string, BackendNode>,
  kindMap: Record<string, ElementKind>,
) {
  const elements: SysmlModel["elements"] = [];

  nodes.forEach((node) => {
    const hostKind = kindMap[node.kind];
    if (!hostKind) return;

    if (node.ports?.length) {
      node.ports.forEach((port, index) => {
        elements.push({
          id: `${node.id}::port::${port.name}::${index}`,
          name: port.name,
          kind: hostKind === "portDef" ? "portUsage" : "port",
          parentId: node.id,
          path: `${node.qualifiedName.replace(/\./g, "/")}/${port.name}`,
          line: node.sourceLine,
          source: port.name,
          type: port.type,
          details: {
            direction: port.direction || "",
            ref: false,
            conjugated: port.type.startsWith("~"),
            inferred: true,
          },
        });
      });
      return;
    }

    if (node.kind === "PartUsage" && node.typeRef) {
      const definition = definitionByName.get(node.typeRef);
      definition?.ports?.forEach((port, index) => {
        elements.push({
          id: `${node.id}::port::${port.name}::${index}`,
          name: port.name,
          kind: "portUsage",
          parentId: node.id,
          path: `${node.qualifiedName.replace(/\./g, "/")}/${port.name}`,
          line: node.sourceLine,
          source: port.name,
          type: port.type,
          details: {
            direction: port.direction || "",
            ref: false,
            conjugated: port.type.startsWith("~"),
            inferred: true,
          },
        });
      });
    }
  });

  return elements;
}

function resolveBackendEdgeEndpoints(
  edge: BackendEdge,
  nodeById: Map<string, BackendNode>,
  definitionByName: Map<string, BackendNode>,
  elementById: Map<string, SysmlModel["elements"][number]>,
) {
  const resolve = (ref: string) => {
    if (nodeById.has(ref)) return ref;
    const parts = ref.split(".");
    if (parts.length !== 2) return null;
    const [hostName, portName] = parts;
    const hostUsage = [...nodeById.values()].find((node) => node.name === hostName);
    if (!hostUsage) return null;

    const directPort = [...elementById.values()].find(
      (item) => item.parentId === hostUsage.id && item.name === portName,
    );
    if (directPort) return directPort.id;

    if (hostUsage.kind === "PartUsage" && hostUsage.typeRef) {
      const definition = definitionByName.get(hostUsage.typeRef);
      if (definition?.ports?.some((port) => port.name === portName)) {
        const inferredId = `${hostUsage.id}::port::${portName}::0`;
        return elementById.has(inferredId) ? inferredId : hostUsage.id;
      }
    }

    return hostUsage.id;
  };

  const source = resolve(edge.sourceId);
  const target = resolve(edge.targetId);
  if (!source || !target) return null;
  return { source, target };
}
