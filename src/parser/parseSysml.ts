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

const blockPatterns: Array<{
  pattern: RegExp;
  kind: ModelElement["kind"];
  specializations?: boolean;
}> = [
  { pattern: /^\s*package\s+([A-Za-z_]\w*)\s*\{$/, kind: "package" },
  {
    pattern:
      /^\s*(?:abstract\s+)?part\s+def\s+([A-Za-z_]\w*)\s*(?::>|specializes)\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*\{$/,
    kind: "partDef",
    specializations: true,
  },
  { pattern: /^\s*part\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "partDef" },
  { pattern: /^\s*item\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "itemDef" },
  { pattern: /^\s*port\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "portDef" },
  {
    pattern: /^\s*(?:abstract\s+)?connection\s+def\s+([A-Za-z_]\w*)\s*\{$/,
    kind: "connectionDef",
  },
  { pattern: /^\s*interface\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "interfaceDef" },
  { pattern: /^\s*requirement\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "requirementDef" },
  { pattern: /^\s*action\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "actionDef" },
  { pattern: /^\s*state\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "stateDef" },
  { pattern: /^\s*constraint\s+def\s+([A-Za-z_]\w*)\s*\{$/, kind: "constraintDef" },
];

const singleLineDefinitionPatterns: Array<{ pattern: RegExp; kind: ModelElement["kind"] }> = [
  { pattern: /^\s*item\s+def\s+([A-Za-z_]\w*)\s*;$/, kind: "itemDef" },
  { pattern: /^\s*part\s+def\s+([A-Za-z_]\w*)\s*;$/, kind: "partDef" },
  { pattern: /^\s*port\s+def\s+([A-Za-z_]\w*)\s*;$/, kind: "portDef" },
  { pattern: /^\s*constraint\s+def\s+([A-Za-z_]\w*)\s*;$/, kind: "constraintDef" },
];

const usagePatterns: Array<{
  pattern: RegExp;
  kind: ModelElement["kind"];
  referenceKind?: ModelRelation["kind"];
}> = [
  { pattern: /^\s*part\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "partUsage", referenceKind: "reference" },
  { pattern: /^\s*item\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "itemUsage", referenceKind: "reference" },
  { pattern: /^\s*requirement\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "requirementUsage", referenceKind: "reference" },
  { pattern: /^\s*interface\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "interfaceUsage", referenceKind: "reference" },
  { pattern: /^\s*action\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "actionUsage", referenceKind: "reference" },
  { pattern: /^\s*state\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "stateUsage", referenceKind: "reference" },
  { pattern: /^\s*constraint\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*;$/, kind: "constraintUsage", referenceKind: "reference" },
];

const openUsagePatterns: Array<{ pattern: RegExp; kind: ModelElement["kind"] }> = [
  { pattern: /^\s*action\s+([A-Za-z_]\w*)\s*\{$/, kind: "actionUsage" },
  { pattern: /^\s*state\s+([A-Za-z_]\w*)(?:\s+parallel)?\s*\{$/, kind: "stateUsage" },
];

const memberPatterns = {
  attribute: /^\s*attribute\s+([A-Za-z_]\w*)\s*:\s*([A-Za-z_][\w<>:]*)\s*;$/,
  port:
    /^\s*(?:(in|out|inout)\s+)?(?:(ref)\s+)?port\s+([A-Za-z_]\w*)\s*:\s*([~A-Za-z_][\w<>:]*)\s*;$/,
  operation: /^\s*operation\s+([A-Za-z_]\w*)\((.*)\)\s*;$/,
};

const relationPatterns = {
  connect:
    /^\s*connect\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)\s+to\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)\s*(?::\s*([A-Za-z_]\w*))?\s*;$/,
  dependency:
    /^\s*dependency\s+from\s+([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)\s+to\s+([A-Za-z_]\w*(?:::[A-Za-z_]\w*)*)\s*;$/,
  satisfy: /^\s*satisfy\s+([A-Za-z_]\w*)\s*;$/,
  satisfyBy: /^\s*satisfy\s+([A-Za-z_]\w*)\s+by\s+([A-Za-z_]\w*)\s*;$/,
  perform: /^\s*perform(?:\s+action)?\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*;$/,
  exhibit: /^\s*exhibit(?:\s+state)?\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*;$/,
  succession:
    /^\s*(?:succession\s+[A-Za-z_]\w*(?:\s*:\s*[A-Za-z_]\w*)?\s+)?first\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s+then\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*;$/,
};

export function parseSysml(source: string): ParseResult {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const elements: ModelElement[] = [];
  const relations: ModelRelation[] = [];
  const diagnostics: DiagnosticItem[] = [];
  const stack: StackItem[] = [];
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
    pathIndex.set(path, id);
    return element;
  };

  const updateCurrentElementDetails = (patch: Record<string, string>) => {
    const parent = currentParent();
    if (!parent) return;
    const target = elements.find((item) => item.id === parent.id);
    if (!target) return;
    target.details = {
      ...(target.details ?? {}),
      ...patch,
    };
  };

  const appendCurrentElementDetail = (key: string, value: string) => {
    const parent = currentParent();
    if (!parent) return;
    const target = elements.find((item) => item.id === parent.id);
    if (!target) return;
    const currentValue = String(target.details?.[key] ?? "");
    target.details = {
      ...(target.details ?? {}),
      [key]: currentValue ? `${currentValue}\n${value}` : value,
    };
  };

  const addRelation = (
    kind: ModelRelation["kind"],
    source: string,
    target: string,
    line: number,
    label?: string,
  ) => {
    relations.push({
      id: `${kind}:${source}->${target}:${line}`,
      kind,
      source,
      target,
      label,
      line,
    });
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

    const idMatch = trimmed.match(/^id\s*=\s*"(.+)"\s*;?$/);
    if (idMatch) {
      updateCurrentElementDetails({ id: idMatch[1] });
      offset += line.length + 1;
      return;
    }

    const textMatch = trimmed.match(/^text\s*=\s*"(.+)"\s*;?$/);
    if (textMatch) {
      updateCurrentElementDetails({ text: textMatch[1] });
      offset += line.length + 1;
      return;
    }

    const entryMatch = trimmed.match(/^entry(?:\s+(.+))?\s*;?$/);
    if (entryMatch) {
      appendCurrentElementDetail("entry", entryMatch[1]?.trim() || "entry");
      offset += line.length + 1;
      return;
    }

    const doMatch = trimmed.match(/^do\s+(.+?)\s*;?$/);
    if (doMatch) {
      appendCurrentElementDetail("do", doMatch[1].trim());
      offset += line.length + 1;
      return;
    }

    const exitMatch = trimmed.match(/^exit(?:\s+(.+))?\s*;?$/);
    if (exitMatch) {
      appendCurrentElementDetail("exit", exitMatch[1]?.trim() || "exit");
      offset += line.length + 1;
      return;
    }

    const acceptInlineMatch = trimmed.match(/^accept\s+(.+?)\s*;?$/);
    if (acceptInlineMatch) {
      appendCurrentElementDetail("accept", acceptInlineMatch[1].trim());
      const parent = currentParent();
      if (parent) {
        addRelation("accept", parent.id, acceptInlineMatch[1].trim(), lineNumber, "accept");
      }
      offset += line.length + 1;
      return;
    }

    const sendInlineMatch = trimmed.match(/^send\s+(.+?)\s*;?$/);
    if (sendInlineMatch) {
      appendCurrentElementDetail("send", sendInlineMatch[1].trim());
      const parent = currentParent();
      if (parent) {
        addRelation("send", parent.id, sendInlineMatch[1].trim(), lineNumber, "send");
      }
      offset += line.length + 1;
      return;
    }

    if (trimmed === "}" || trimmed === "};") {
      if (!stack.length) addDiagnostic(lineNumber, line, "检测到多余的右花括号");
      else stack.pop();
      offset += line.length + 1;
      return;
    }

    for (const item of blockPatterns) {
      const matched = item.pattern.exec(line);
      if (!matched) continue;
      const name = matched[1];
      const element = createElement(item.kind, name, lineNumber, line);
      stack.push({ id: element.id, path: element.path, kind: element.kind });
      if (item.specializations && matched[2]) {
        matched[2]
          .split(",")
          .map((text) => text.trim())
          .forEach((target) => addRelation("specialization", element.id, target, lineNumber, "specializes"));
      }
      offset += line.length + 1;
      return;
    }

    for (const item of singleLineDefinitionPatterns) {
      const matched = item.pattern.exec(line);
      if (!matched) continue;
      createElement(item.kind, matched[1], lineNumber, line);
      offset += line.length + 1;
      return;
    }

    for (const item of usagePatterns) {
      const matched = item.pattern.exec(line);
      if (!matched) continue;
      const [, name, type] = matched;
      const element = createElement(item.kind, name, lineNumber, line, { type });
      if (item.referenceKind) {
        addRelation(item.referenceKind, element.id, type, lineNumber, type);
      }
      offset += line.length + 1;
      return;
    }

    for (const item of openUsagePatterns) {
      const matched = item.pattern.exec(line);
      if (!matched) continue;
      const element = createElement(item.kind, matched[1], lineNumber, line);
      stack.push({ id: element.id, path: element.path, kind: element.kind });
      offset += line.length + 1;
      return;
    }

    let matched = memberPatterns.attribute.exec(line);
    if (matched) {
      createElement("attribute", matched[1], lineNumber, line, { type: matched[2] });
      offset += line.length + 1;
      return;
    }

    matched = memberPatterns.port.exec(line);
    if (matched) {
      const [, direction, refKeyword, name, type] = matched;
      const kind: ModelElement["kind"] = currentParent()?.kind === "portDef" ? "portUsage" : "port";
      createElement(kind, name, lineNumber, line, {
        type,
        details: {
          direction: direction ?? "",
          ref: Boolean(refKeyword),
          conjugated: type.startsWith("~"),
        },
      });
      offset += line.length + 1;
      return;
    }

    matched = memberPatterns.operation.exec(line);
    if (matched) {
      createElement("operation", matched[1], lineNumber, line, { details: { params: matched[2] } });
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.dependency.exec(line);
    if (matched) {
      addRelation("dependency", normalizeScopedRef(matched[1]), normalizeScopedRef(matched[2]), lineNumber, "dependency");
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.connect.exec(line);
    if (matched) {
      const relationKind = matched[3] === "binding" ? "binding" : "connection";
      addRelation(
        relationKind,
        resolveElementRef(currentPath(), matched[1]),
        resolveElementRef(currentPath(), matched[2]),
        lineNumber,
        matched[3] ?? relationKind,
      );
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.satisfy.exec(line);
    if (matched) {
      const parent = currentParent();
      if (!parent) addDiagnostic(lineNumber, line, "satisfy 必须定义在元素内部");
      else addRelation("satisfy", parent.id, matched[1], lineNumber, "satisfy");
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.satisfyBy.exec(line);
    if (matched) {
      addRelation("satisfy", normalizeScopedRef(matched[2]), matched[1], lineNumber, "satisfy");
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.perform.exec(line);
    if (matched) {
      const parent = currentParent();
      if (parent) addRelation("perform", parent.id, normalizeScopedRef(matched[1]), lineNumber, "perform");
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.exhibit.exec(line);
    if (matched) {
      const parent = currentParent();
      if (parent) addRelation("exhibit", parent.id, normalizeScopedRef(matched[1]), lineNumber, "exhibit");
      offset += line.length + 1;
      return;
    }

    matched = relationPatterns.succession.exec(line);
    if (matched) {
      addRelation("succession", normalizeScopedRef(matched[1]), normalizeScopedRef(matched[2]), lineNumber, "succession");
      const parent = currentParent();
      if (parent) {
        appendCurrentElementDetail("succession", `${matched[1]} -> ${matched[2]}`);
      }
      offset += line.length + 1;
      return;
    }

    const flowMatch = trimmed.match(/^flow\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s+to\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*;$/);
    if (flowMatch) {
      addRelation("flow", normalizeScopedRef(flowMatch[1]), normalizeScopedRef(flowMatch[2]), lineNumber, "flow");
      const parent = currentParent();
      if (parent) {
        appendCurrentElementDetail("flow", `${flowMatch[1]} -> ${flowMatch[2]}`);
      }
      offset += line.length + 1;
      return;
    }

    if (trimmed.startsWith("transition")) {
      const transMatch = trimmed.match(/first\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*).+then\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/);
      if (transMatch) {
        addRelation("transition", normalizeScopedRef(transMatch[1]), normalizeScopedRef(transMatch[2]), lineNumber, "transition");
      }
      if (trimmed.endsWith("{")) {
        stack.push({
          id: `${currentPath()}/transition-${lineNumber}`,
          path: `${currentPath()}/transition-${lineNumber}`,
          kind: "stateUsage",
        });
      }
      offset += line.length + 1;
      return;
    }

    if (
      trimmed.startsWith("id =") ||
      trimmed.startsWith("text =") ||
      trimmed.startsWith("accept ") ||
      trimmed.startsWith("send ") ||
      trimmed.startsWith("entry") ||
      trimmed.startsWith("exit") ||
      trimmed.startsWith("do ") ||
      trimmed.startsWith("if ") ||
      trimmed.startsWith("then ") ||
      trimmed.startsWith("subject ") ||
      trimmed.startsWith("require ") ||
      trimmed.startsWith("assert ") ||
      trimmed.startsWith("alias ") ||
      trimmed.startsWith("public ") ||
      trimmed.startsWith("private ") ||
      trimmed.startsWith("protected ") ||
      trimmed.startsWith("ref ")
    ) {
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

    addDiagnostic(lineNumber, line, "未识别的 SysML 语句");
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
        [
          "partDef",
          "itemDef",
          "portDef",
          "connectionDef",
          "requirementDef",
          "interfaceDef",
          "actionDef",
          "stateDef",
          "constraintDef",
          "package",
        ].includes(item.kind),
      )
      .flatMap((item) => [item.name, item.id]),
  );

  elements.forEach((element) => {
    if (
      ["partUsage", "itemUsage", "requirementUsage", "interfaceUsage", "actionUsage", "stateUsage", "constraintUsage"].includes(
        element.kind,
      ) &&
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
      if (["satisfy", "reference", "perform", "exhibit", "specialization", "transition", "succession"].includes(relation.kind)) {
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
    const [owner, ...rest] = ref.split(".");
    const normalized = [owner, ...rest].join("/");
    return scopePath ? `${scopePath}/${normalized}` : normalized;
  }
  return scopePath ? `${scopePath}/${ref}` : ref;
}

function normalizeScopedRef(ref: string) {
  return ref.replace(/::/g, "/");
}
