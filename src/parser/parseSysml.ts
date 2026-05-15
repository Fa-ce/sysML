import type {
  DiagnosticItem,
  ModelElement,
  ModelRelation,
  ParseResult,
  SysmlModel,
} from "./types";

interface StackItem {
  id: string;
  path: string;
  kind: ModelElement["kind"];
}

const packagePattern = /^\s*package\s+([A-Za-z_]\w*)\s*\{$/;
const partDefPattern = /^\s*part\s+def\s+([A-Za-z_]\w*)\s*\{$/;
const interfaceDefPattern = /^\s*interface\s+def\s+([A-Za-z_]\w*)\s*\{$/;
const requirementDefPattern = /^\s*requirement\s+def\s+([A-Za-z_]\w*)\s*\{$/;
const partUsagePattern = /^\s*part\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/;
const requirementUsagePattern =
  /^\s*requirement\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/;
const attributePattern =
  /^\s*attribute\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_][\w<>]*)\s*;$/;
const portPattern = /^\s*port\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_][\w<>]*)\s*;$/;
const operationPattern = /^\s*operation\s+([A-Za-z_]\w*)\((.*)\)\s*;$/;
const connectPattern =
  /^\s*connect\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)\s+to\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)\s*:\s*([A-Za-z_]\w*)\s*;$/;
const satisfyPattern = /^\s*satisfy\s+([A-Za-z_]\w*)\s*;$/;
const satisfyByPattern =
  /^\s*satisfy\s+([A-Za-z_]\w*)\s+by\s+([A-Za-z_]\w*)\s*;$/;

export function parseSysml(source: string): ParseResult {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const elements: ModelElement[] = [];
  const relations: ModelRelation[] = [];
  const diagnostics: DiagnosticItem[] = [];
  const stack: StackItem[] = [];
  const nameIndex = new Map<string, string>();
  const pathIndex = new Map<string, string>();
  let offset = 0;

  const currentParent = () => stack[stack.length - 1];
  const currentParentId = () => currentParent()?.id;
  const currentPath = () => currentParent()?.path ?? "";

  const createElement = (
    kind: ModelElement["kind"],
    name: string,
    lineNumber: number,
    lineText: string,
    extra?: Partial<ModelElement>,
  ) => {
    const path = currentPath() ? `${currentPath()}/${name}` : name;
    const id = path;
    const element: ModelElement = {
      id,
      name,
      kind,
      parentId: currentParentId(),
      path,
      line: lineNumber,
      source: lineText.trim(),
      ...extra,
    };
    elements.push(element);
    nameIndex.set(name, id);
    pathIndex.set(path, id);
    return element;
  };

  const addDiagnostic = (
    lineNumber: number,
    lineText: string,
    message: string,
    severity: DiagnosticItem["severity"] = "error",
  ) => {
    diagnostics.push({
      line: lineNumber,
      column: 1,
      offset,
      length: Math.max(lineText.length, 1),
      severity,
      message,
    });
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//")) {
      offset += line.length + 1;
      return;
    }

    if (trimmed === "}" || trimmed === "};") {
      if (!stack.length) {
        addDiagnostic(lineNumber, line, "检测到多余的右花括号");
      } else {
        stack.pop();
      }
      offset += line.length + 1;
      return;
    }

    let matched =
      packagePattern.exec(line) ??
      partDefPattern.exec(line) ??
      interfaceDefPattern.exec(line) ??
      requirementDefPattern.exec(line);

    if (matched) {
      const [full, name] = matched;
      let kind: ModelElement["kind"] = "package";
      if (full.includes("part def")) kind = "partDef";
      if (full.includes("interface def")) kind = "interfaceDef";
      if (full.includes("requirement def")) kind = "requirementDef";
      const element = createElement(kind, name, lineNumber, line);
      stack.push({ id: element.id, path: element.path, kind: element.kind });
      offset += line.length + 1;
      return;
    }

    matched = partUsagePattern.exec(line);
    if (matched) {
      const [, name, type] = matched;
      const element = createElement("partUsage", name, lineNumber, line, { type });
      relations.push({
        id: `${element.id}:reference`,
        kind: "reference",
        source: element.id,
        target: type,
        label: type,
        line: lineNumber,
      });
      offset += line.length + 1;
      return;
    }

    matched = requirementUsagePattern.exec(line);
    if (matched) {
      const [, name, type] = matched;
      const element = createElement("requirementUsage", name, lineNumber, line, {
        type,
      });
      relations.push({
        id: `${element.id}:reference`,
        kind: "reference",
        source: element.id,
        target: type,
        label: type,
        line: lineNumber,
      });
      offset += line.length + 1;
      return;
    }

    matched = attributePattern.exec(line);
    if (matched) {
      const [, name, type] = matched;
      createElement("attribute", name, lineNumber, line, { type });
      offset += line.length + 1;
      return;
    }

    matched = portPattern.exec(line);
    if (matched) {
      const [, name, type] = matched;
      createElement("port", name, lineNumber, line, { type });
      offset += line.length + 1;
      return;
    }

    matched = operationPattern.exec(line);
    if (matched) {
      const [, name, params] = matched;
      createElement("operation", name, lineNumber, line, {
        details: { params },
      });
      offset += line.length + 1;
      return;
    }

    matched = connectPattern.exec(line);
    if (matched) {
      const [, sourceRef, targetRef, relationType] = matched;
      relations.push({
        id: `${currentPath()}:${sourceRef}->${targetRef}`,
        kind: relationType === "binding" ? "binding" : "reference",
        source: resolveElementRef(currentPath(), sourceRef),
        target: resolveElementRef(currentPath(), targetRef),
        label: relationType,
        line: lineNumber,
      });
      offset += line.length + 1;
      return;
    }

    matched = satisfyPattern.exec(line);
    if (matched) {
      const [, requirementName] = matched;
      const parent = currentParent();
      if (!parent) {
        addDiagnostic(lineNumber, line, "satisfy 必须定义在元素内部");
      } else {
        relations.push({
          id: `${parent.id}:satisfy:${requirementName}`,
          kind: "satisfy",
          source: parent.id,
          target: requirementName,
          label: "satisfy",
          line: lineNumber,
        });
      }
      offset += line.length + 1;
      return;
    }

    matched = satisfyByPattern.exec(line);
    if (matched) {
      const [, requirementName, providerName] = matched;
      relations.push({
        id: `${providerName}:satisfy:${requirementName}:${lineNumber}`,
        kind: "satisfy",
        source: resolveElementRef(currentPath(), providerName),
        target: requirementName,
        label: "satisfy",
        line: lineNumber,
      });
      offset += line.length + 1;
      return;
    }

    if (trimmed.endsWith("{")) {
      addDiagnostic(lineNumber, line, "当前首版解析器无法识别该定义体");
      stack.push({
        id: `${currentPath()}/unknown-${lineNumber}`,
        path: `${currentPath()}/unknown-${lineNumber}`,
        kind: "package",
      });
      offset += line.length + 1;
      return;
    }

    if (
      !trimmed.startsWith("id =") &&
      !trimmed.startsWith("text =") &&
      trimmed !== "};" &&
      trimmed !== "{"
    ) {
      addDiagnostic(lineNumber, line, "未识别的 SysML 语句");
    }

    offset += line.length + 1;
  });

  if (stack.length) {
    diagnostics.push({
      line: lines.length,
      column: 1,
      offset: source.length,
      length: 1,
      severity: "error",
      message: "存在未闭合的定义块",
    });
  }

  const declaredTypes = new Set(
    elements
      .filter((item) =>
        ["partDef", "requirementDef", "interfaceDef", "package"].includes(item.kind),
      )
      .flatMap((item) => [item.name, item.id]),
  );

  elements.forEach((element) => {
    if (
      (element.kind === "partUsage" || element.kind === "requirementUsage") &&
      element.type &&
      !declaredTypes.has(element.type)
    ) {
      diagnostics.push({
        line: element.line,
        column: 1,
        offset: 0,
        length: element.source.length,
        severity: "warning",
        message: `引用类型 ${element.type} 当前未在模型中声明`,
      });
    }
  });

  relations.forEach((relation) => {
    if (!declaredTypes.has(relation.target) && !pathIndex.has(relation.target)) {
      if (relation.kind === "satisfy" || relation.kind === "reference") {
        diagnostics.push({
          line: relation.line,
          column: 1,
          offset: 0,
          length: 1,
          severity: "warning",
          message: `关系目标 ${relation.target} 尚未解析到具体元素`,
        });
      }
    }
  });

  const model: SysmlModel = { elements, relations };
  return { model, diagnostics };
}

function resolveElementRef(scopePath: string, ref: string) {
  if (ref.includes(".")) {
    const [owner] = ref.split(".");
    return scopePath ? `${scopePath}/${owner}` : owner;
  }
  return scopePath ? `${scopePath}/${ref}` : ref;
}
