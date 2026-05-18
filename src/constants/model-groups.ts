import type { ElementKind, GroupType } from "@/parser/types";

// 定义每种元素的分组类型
export const ELEMENT_GROUP_MAPPING: Record<ElementKind, GroupType[]> = {
  // 容器定义类（有分组）
  partDef: ['attributes', 'ports', 'operations', 'parts', 'behaviors', 'requirements', 'annotations'],
  partUsage: ['attributes', 'ports', 'operations', 'parts', 'behaviors', 'requirements', 'annotations'],
  itemDef: ['attributes', 'operations', 'parts', 'annotations'],
  itemUsage: ['attributes', 'operations', 'parts', 'annotations'],
  requirementDef: ['text', 'subject', 'constraints', 'relations', 'annotations'],
  requirementUsage: ['text', 'subject', 'constraints', 'relations', 'annotations'],
  stateDef: ['entry', 'do', 'exit', 'transitions', 'annotations'],
  stateUsage: ['entry', 'do', 'exit', 'transitions', 'annotations'],
  actionDef: ['flows', 'transitions', 'annotations'],
  actionUsage: ['flows', 'transitions', 'annotations'],
  useCaseDef: ['annotations'],
  useCaseUsage: ['annotations'],

  // 容器定义类（无分组）
  package: [],
  portDef: [],
  portUsage: [],
  connectionDef: [],
  interfaceDef: [],
  interfaceUsage: [],
  constraintDef: [],
  constraintUsage: [],
  calculationDef: [],
  calculationUsage: [],
  caseDef: [],
  analysisCaseDef: [],
  verificationCaseDef: [],
  viewDef: [],
  viewUsage: [],
  viewpointDef: [],
  viewpointUsage: [],
  renderingDef: [],
  metadataDef: [],

  // 成员/注解类（通常不作为容器）
  attribute: [],
  attributeUsage: [],
  port: [],
  operation: [],
  comment: [],
  documentation: [],
  textualRepresentation: [],
  subject: [],
  stakeholder: [],
  controlNode: [],
};

// 虚拟分组节点的图标和标签
export const GROUP_META: Record<GroupType, { icon: string; label: string }> = {
  // 成员分组
  attributes: { icon: 'FileTextOutlined', label: 'Attributes' },
  ports: { icon: 'ApiOutlined', label: 'Ports' },
  operations: { icon: 'FunctionOutlined', label: 'Operations' },
  parts: { icon: 'ShoppingCartOutlined', label: 'Parts' },
  requirements: { icon: 'CheckSquareOutlined', label: 'Requirements' },
  behaviors: { icon: 'SwapOutlined', label: 'Behaviors' },
  annotations: { icon: 'CommentOutlined', label: 'Annotations' },

  // 状态内分组
  entry: { icon: 'LoginOutlined', label: 'Entry' },
  do: { icon: 'ClockCircleOutlined', label: 'Do' },
  exit: { icon: 'LogoutOutlined', label: 'Exit' },
  transitions: { icon: 'ArrowRightOutlined', label: 'Transitions' },

  // 行为内分组
  flows: { icon: 'SwitcherOutlined', label: 'Flows' },

  // 需求内分组
  text: { icon: 'FileTextOutlined', label: 'Text' },
  subject: { icon: 'UserOutlined', label: 'Subject' },
  constraints: { icon: 'LockOutlined', label: 'Constraints' },
  relations: { icon: 'LinkOutlined', label: 'Relations' },
};
