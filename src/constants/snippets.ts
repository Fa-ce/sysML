export interface SysmlSnippet {
  id: string;
  title: string;
  group: string;
  description: string;
  body: string;
}

export const sysmlSnippets: SysmlSnippet[] = [
  {
    id: "package",
    title: "package",
    group: "基础定义",
    description: "包定义",
    body: "package ${Name} {\n\t\n}\n",
  },
  {
    id: "part-def",
    title: "part def",
    group: "基础定义",
    description: "部件定义",
    body: "part def ${Name} {\n\tattribute mass : Real;\n}\n",
  },
  {
    id: "action-def",
    title: "action def",
    group: "基础定义",
    description: "动作定义",
    body: "action def ${Name} {\n\t\n}\n",
  },
  {
    id: "interface-def",
    title: "interface def",
    group: "基础定义",
    description: "接口定义",
    body: "interface def ${PowerSource} {\n\tport outputPower : FlowPort;\n}\n",
  },
  {
    id: "requirement-def",
    title: "requirement def",
    group: "基础定义",
    description: "需求定义",
    body: "requirement def ${SafetyRequirement} {\n\tid = \"SAFE-001\";\n\ttext = \"输入需求描述\";\n}\n",
  },
  {
    id: "state-def",
    title: "state def",
    group: "基础定义",
    description: "状态定义",
    body: "state def ${Name} {\n\t\n}\n",
  },
  {
    id: "part-usage",
    title: "part",
    group: "使用类",
    description: "部件使用",
    body: "part ${engine} : ${Engine};\n",
  },
  {
    id: "action-usage",
    title: "action",
    group: "使用类",
    description: "动作使用",
    body: "action ${drive} : ${DriveAction};\n",
  },
  {
    id: "requirement-usage",
    title: "requirement",
    group: "使用类",
    description: "需求使用",
    body: "requirement ${performance} : ${PerformanceRequirement};\n",
  },
  {
    id: "reference-part",
    title: "reference part",
    group: "使用类",
    description: "引用部件",
    body: "reference part ${name} : ${Type};\n",
  },
  {
    id: "attribute",
    title: "attribute",
    group: "属性与约束",
    description: "属性定义",
    body: "attribute ${name} : ${Real};\n",
  },
  {
    id: "operation",
    title: "operation",
    group: "属性与约束",
    description: "操作定义",
    body: "operation ${start}();\n",
  },
  {
    id: "port",
    title: "port",
    group: "属性与约束",
    description: "端口定义",
    body: "port ${outputPower} : ${FlowPort};\n",
  },
  {
    id: "constraint",
    title: "constraint",
    group: "属性与约束",
    description: "约束定义",
    body: "constraint ${expression};\n",
  },
  {
    id: "binding",
    title: "connect",
    group: "关系",
    description: "绑定连接",
    body: "connect ${engine.outputPower} to ${wheels.axleConnect} : binding;\n",
  },
  {
    id: "satisfy",
    title: "satisfy",
    group: "关系",
    description: "需求满足",
    body: "satisfy ${performance} by ${engine};\n",
  },
  {
    id: "specializes",
    title: "specializes",
    group: "关系",
    description: "特化关系",
    body: "part def ${Child} specializes ${Parent} {\n\t\n}\n",
  },
];
