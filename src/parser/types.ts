export type ElementKind =
  | "package"
  | "partDef"
  | "partUsage"
  | "requirementDef"
  | "requirementUsage"
  | "interfaceDef"
  | "attribute"
  | "operation"
  | "port";

export type RelationKind = "containment" | "binding" | "satisfy" | "reference";

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

