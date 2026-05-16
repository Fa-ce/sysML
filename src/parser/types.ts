export type ElementKind =
  | "package"
  | "partDef"
  | "partUsage"
  | "itemDef"
  | "itemUsage"
  | "portDef"
  | "portUsage"
  | "connectionDef"
  | "requirementDef"
  | "requirementUsage"
  | "interfaceDef"
  | "interfaceUsage"
  | "actionDef"
  | "actionUsage"
  | "stateDef"
  | "stateUsage"
  | "constraintDef"
  | "constraintUsage"
  | "attribute"
  | "attributeUsage"
  | "operation"
  | "port"
  | "controlNode"
  | "useCaseDef"
  | "useCaseUsage"
  | "calculationDef"
  | "calculationUsage"
  | "caseDef"
  | "analysisCaseDef"
  | "verificationCaseDef"
  | "viewDef"
  | "viewUsage"
  | "viewpointDef"
  | "viewpointUsage"
  | "renderingDef"
  | "metadataDef"
  | "comment"
  | "documentation"
  | "textualRepresentation"
  | "subject"
  | "stakeholder";

export type RelationKind =
  | "containment"
  | "binding"
  | "satisfy"
  | "reference"
  | "connection"
  | "dependency"
  | "flow"
  | "succession"
  | "perform"
  | "exhibit"
  | "transition"
  | "specialization"
  | "accept"
  | "send"
  | "require"
  | "verify"
  | "import"
  | "expose"
  | "redefinition"
  | "subsetting"
  | "annotate"
  | "allocate";

export interface RangeInfo {
  line: number;
  column: number;
  offset: number;
  length: number;
}

export interface ModelElement {
  id: string;
  name: string;
  kind: ElementKind;
  parentId?: string;
  path: string;
  line: number;
  source: string;
  type?: string;
  details?: Record<string, string | number | boolean>;
}

export interface ModelRelation {
  id: string;
  kind: RelationKind;
  source: string;
  target: string;
  label?: string;
  line: number;
}

export interface DiagnosticItem extends RangeInfo {
  severity: "error" | "warning";
  message: string;
}

export interface SysmlModel {
  elements: ModelElement[];
  relations: ModelRelation[];
}

export interface ParseResult {
  model: SysmlModel;
  diagnostics: DiagnosticItem[];
}
