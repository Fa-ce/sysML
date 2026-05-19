# ModelBrowser 增强设计文档

> 文档日期：2026-05-18  
> 优先级：P1（交互能力补强）  
> 所有者：建模项目前端团队

---

## 1. 概述

### 目标

完善左侧 ModelBrowser 组件，支持虚拟分组节点，展示 SysML 模型的完整层级结构，并系统性地替换所有 emoji 图标为 Ant Design Icons，避免跨平台兼容性隐患。

### 范围

- ✓ 支持虚拟分组节点（Attributes、Ports、Operations 等）
- ✓ 替换所有 emoji 图标为 Ant Design Icons
- ✓ 更新图标渲染逻辑
- ✗ 暂不涉及：画布端口设计、多人协作等

### 预期收益

| 方面 | 改进 |
|------|------|
| **用户体验** | 树结构清晰，易于导航大型模型 |
| **代码质量** | 消除跨平台图标隐患 |
| **维护性** | 统一使用 Ant Design Icons，与框架一致 |

---

## 2. 架构设计

### 2.1 数据流

```
SysML 源代码
    ↓
前端 Parser (parseSysml.ts)
    ↓
ModelElement[] + 虚拟分组逻辑
    ↓
TreeNode[] (包含虚拟节点)
    ↓
ModelBrowser 渲染
```

### 2.2 树节点结构

**真实节点：**
```typescript
interface TreeNode {
  key: string;              // VirtualId 或 elementId
  title: string;            // 元素名称
  kind: ElementKind;        // 元素类型
  icon: string;             // Ant Design Icon 名称
  kindLabel: string;        // 元素类型标签
  isVirtual: false;
  elementId: string;        // 对应的 ModelElement.id
  children: TreeNode[];
}
```

**虚拟分组节点：**
```typescript
interface VirtualGroupNode extends TreeNode {
  isVirtual: true;
  groupType: GroupType;           // 'attributes' | 'ports' | ...
  parentElementId: string;        // 所属父元素
  elementId: undefined;
  kind: 'group';
}
```

### 2.3 分组规则

#### 有分组的容器元素

| 元素类型 | 分组类型 | 说明 |
|---------|--------|------|
| `partDef` / `partUsage` | attributes, ports, operations, parts, behaviors, requirements, annotations | 部件内的所有成员 |
| `itemDef` / `itemUsage` | attributes, operations, parts, annotations | 物件内的成员 |
| `requirementDef` / `requirementUsage` | text, subject, constraints, relations, annotations | 需求内的成员 |
| `stateDef` / `stateUsage` | entry, do, exit, transitions, annotations | 状态内的成员 |
| `actionDef` / `actionUsage` | flows, transitions, annotations | 动作内的成员 |
| `useCaseDef` / `useCaseUsage` | annotations | 用例内的注解 |

#### 无分组的容器元素（直接显示子元素）

| 元素类型 | 说明 |
|---------|------|
| `package` | 包中直接显示所有子元素 |
| `portDef` / `portUsage` | 端口定义/使用 |
| `connectionDef` | 连接定义 |
| `interfaceDef` / `interfaceUsage` | 接口定义/使用 |
| `constraintDef` / `constraintUsage` | 约束定义/使用 |
| `calculationDef` / `calculationUsage` | 计算定义/使用 |
| `caseDef` / `analysisCaseDef` / `verificationCaseDef` | 各类用例定义 |
| `viewDef` / `viewUsage` | 视图定义/使用 |
| `viewpointDef` / `viewpointUsage` | 视点定义/使用 |
| `renderingDef` | 渲染定义 |
| `metadataDef` | 元数据定义 |

### 2.4 虚拟节点的特点

- 不对应真实的 ModelElement
- 不能被选中、删除、编辑
- 仅用于组织和分类真实元素
- Key 格式：`{parentElementId}__group__{groupType}`

---

## 3. 图标替换方案

### 3.1 问题分析

**当前使用 emoji 图标的隐患：**
- ❌ 跨系统渲染不一致（不同 OS/浏览器显示不同）
- ❌ 部分旧环境不支持特殊 emoji
- ❌ 无法调整样式（颜色、大小）
- ❌ 代码维护性差

**解决方案：**
- ✓ 统一使用 Ant Design Icons（项目已集成）
- ✓ 保证跨平台一致性
- ✓ 支持样式自定义

### 3.2 图标映射表

#### 结构类元素

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| package | 📁 | `FolderOutlined` | 包/文件夹 |
| partDef | ■ | `SquareOutlined` | 部件定义 |
| partUsage | □ | `BorderOutlined` | 部件使用 |
| itemDef | ◇ | `DiamondOutlined` | 物件定义 |
| itemUsage | ◇ | `DiamondOutlined` | 物件使用 |
| portDef | ◎ | `NumberOutlined` | 端口定义 |
| portUsage | ◎ | `NumberOutlined` | 端口使用 |
| connectionDef | ◇ | `LinkOutlined` | 连接定义 |

#### 需求类元素

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| requirementDef | 📋 | `FileTextOutlined` | 需求定义 |
| requirementUsage | 📄 | `FileOutlined` | 需求使用 |
| interfaceDef | ◇ | `ApiOutlined` | 接口定义 |
| interfaceUsage | ◇ | `ApiOutlined` | 接口使用 |

#### 行为类元素

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| actionDef | ▶ | `PlayCircleOutlined` | 动作定义 |
| actionUsage | ▷ | `PlayCircleOutlined` | 动作使用 |
| stateDef | ◐ | `HalfCircleOutlined` | 状态定义 |
| stateUsage | ◐ | `HalfCircleOutlined` | 状态使用 |
| calculationDef | ⚙ | `ToolOutlined` | 计算定义 |
| calculationUsage | ⚙ | `ToolOutlined` | 计算使用 |
| useCaseDef | ◈ | `BorderOutlined` | 用例定义 |
| useCaseUsage | ◈ | `BorderOutlined` | 用例使用 |
| controlNode | ● | `NodeIndexOutlined` | 控制节点 |

#### 约束和分析

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| constraintDef | 🔒 | `LockOutlined` | 约束定义 |
| constraintUsage | 🔒 | `LockOutlined` | 约束使用 |
| caseDef | ▦ | `FileTextOutlined` | 测试用例 |
| analysisCaseDef | ▥ | `CalculatorOutlined` | 分析用例 |
| verificationCaseDef | ▤ | `CheckOutlined` | 验证用例 |

#### 视图和元数据

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| viewDef | ▢ | `BorderOutlined` | 视图定义 |
| viewUsage | ▢ | `BorderOutlined` | 视图使用 |
| viewpointDef | ◆ | `EyeOutlined` | 视点定义 |
| viewpointUsage | ◆ | `EyeOutlined` | 视点使用 |
| renderingDef | ▨ | `BgColorsOutlined` | 渲染定义 |
| metadataDef | ⚙ | `ToolOutlined` | 元数据定义 |

#### 成员和注解

| 元素类型 | 当前 | 新 Icon | 说明 |
|---------|------|--------|------|
| attribute | ⬡ | `FieldNumberOutlined` | 属性 |
| attributeUsage | ⬢ | `FieldNumberOutlined` | 属性使用 |
| port | ◎ | `ApiOutlined` | 端口（成员） |
| operation | ⚙ | `FunctionOutlined` | 操作 |
| comment | 💬 | `CommentOutlined` | 注释 |
| documentation | 📄 | `FileTextOutlined` | 文档 |
| textualRepresentation | 📝 | `FileTextOutlined` | 文本表示 |
| subject | 👤 | `UserOutlined` | 主体 |
| stakeholder | 👥 | `TeamOutlined` | 利益相关者 |

#### 分组节点

| 分组类型 | Icon | 标签 |
|---------|------|------|
| attributes | `FileTextOutlined` | Attributes |
| ports | `ApiOutlined` | Ports |
| operations | `FunctionOutlined` | Operations |
| parts | `ShoppingCartOutlined` | Parts |
| requirements | `CheckSquareOutlined` | Requirements |
| behaviors | `SwapOutlined` | Behaviors |
| entry | `LoginOutlined` | Entry |
| do | `ClockCircleOutlined` | Do |
| exit | `LogoutOutlined` | Exit |
| transitions | `ArrowRightOutlined` | Transitions |
| flows | `SwitcherOutlined` | Flows |
| text | `FileTextOutlined` | Text |
| subject | `UserOutlined` | Subject |
| constraints | `LockOutlined` | Constraints |
| relations | `LinkOutlined` | Relations |

---

## 4. 文件修改清单

### 4.1 新建文件

#### `src/constants/model-groups.ts`

分组规则和虚拟节点图标配置。

```typescript
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
```

### 4.2 修改文件

#### `src/parser/types.ts`

添加分组类型定义。

```typescript
export type GroupType = 
  | 'attributes' 
  | 'ports' 
  | 'operations' 
  | 'parts' 
  | 'requirements' 
  | 'behaviors' 
  | 'annotations'
  | 'entry' 
  | 'do' 
  | 'exit' 
  | 'transitions' 
  | 'flows' 
  | 'text' 
  | 'subject' 
  | 'constraints' 
  | 'relations';
```

#### `src/constants/sysml-mapping.ts`

将所有 `icon` 字段从 emoji 改为 Ant Design Icon 名称。

```typescript
// 修改前
{
  icon: "📁",
  // ...
}

// 修改后
{
  icon: "FolderOutlined",
  // ...
}
```

#### `src/components/Browser/ModelBrowser.vue`

1. 导入 Ant Design Icons
2. 重写树构建逻辑，支持虚拟分组节点
3. 更新图标渲染模板
4. 更新选中和交互逻辑

**关键变更：**
- `buildTree()` 函数中添加虚拟分组节点创建逻辑
- 新增 `getElementGroupType()` 函数判断元素应该放在哪个分组
- 模板中使用 `<a-icon>` 组件渲染 Ant Design Icon
- `onSelect()` 中过滤掉虚拟节点（`id.includes('__group__')`）

**关键实现：**

```typescript
import * as Icons from '@ant-design/icons-vue';
import { ELEMENT_GROUP_MAPPING, GROUP_META } from '@/constants/model-groups';

// 获取元素应该放在哪个分组下
function getElementGroupType(kind: ElementKind): GroupType | null {
  const groupMapping: Record<ElementKind, GroupType | null> = {
    // 成员分组
    attribute: 'attributes',
    attributeUsage: 'attributes',
    port: 'ports',
    operation: 'operations',
    comment: 'annotations',
    documentation: 'annotations',
    textualRepresentation: 'annotations',
    
    // 部件内的分组
    partDef: 'parts',
    partUsage: 'parts',
    itemDef: 'parts',
    itemUsage: 'parts',
    
    // 需求内的分组
    requirementDef: 'requirements',
    requirementUsage: 'requirements',
    subject: 'subject',
    
    // 无分组的容器
    package: null,
    portDef: null,
    portUsage: null,
    connectionDef: null,
    interfaceDef: null,
    interfaceUsage: null,
    constraintDef: null,
    constraintUsage: null,
    calculationDef: null,
    calculationUsage: null,
    useCaseDef: null,
    useCaseUsage: null,
    caseDef: null,
    analysisCaseDef: null,
    verificationCaseDef: null,
    viewDef: null,
    viewUsage: null,
    viewpointDef: null,
    viewpointUsage: null,
    renderingDef: null,
    metadataDef: null,
    controlNode: null,
    stakeholder: null,
  };
  return groupMapping[kind] ?? null;
}

// 获取 Ant Design Icon 组件
function getIconComponent(iconName: string) {
  return Icons[iconName as keyof typeof Icons] || null;
}

// 在 onSelect 中过滤虚拟节点
function onSelect(keys: string[]) {
  const [id] = keys;
  if (!id) return;
  
  // 虚拟节点不能选中
  if (id.includes('__group__')) return;
  
  selectionStore.select(id, "node");
}
```

---

## 5. 交互流程

### 5.1 树的展开/折叠

```
用户点击树节点的展开箭头
  ↓
判断是虚拟节点还是真实节点
  ├─ 虚拟节点：展开/折叠其下的真实子元素
  └─ 真实节点：展开/折叠其下的虚拟分组节点
  ↓
updateExpandedKeys()
```

### 5.2 树的选中

```
用户点击树节点
  ↓
判断是否虚拟节点
  ├─ 是虚拟节点：忽略
  └─ 是真实节点：
      ↓
      selectionStore.select(elementId)
      ↓
      右侧 Inspector 面板显示详情
```

### 5.3 树的搜索/过滤

暂不在本设计范围内，但架构应支持后续扩展。

---

## 6. 测试用例

| 测试项 | 预期结果 |
|-------|--------|
| 展开 package，应显示虚拟分组节点 | ✓ 显示 Attributes、Ports 等分组 |
| 展开虚拟分组节点，应显示成员 | ✓ 显示 attribute、port 等元素 |
| 点击虚拟节点，不应选中 | ✓ 不触发 Inspector 更新 |
| 点击成员元素，应选中并显示详情 | ✓ Inspector 显示元素信息 |
| 所有图标在 Chrome/Firefox/Safari 显示一致 | ✓ 一致 |
| emoji 图标完全被替换 | ✓ 无 emoji |

---

## 7. 后续扩展点

1. **搜索/过滤** - 支持按名称搜索元素，虚拟分组自动展开/隐藏
2. **拖拽排序** - 支持在树中拖拽重新组织（需后端配合）
3. **右键菜单** - 虚拟节点可以有专门的菜单操作
4. **展开/折叠记忆** - 保存用户的展开状态

---

## 8. 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|--------|
| 树构建性能 | 虚拟节点可能增加内存占用 | 虚拟节点数据量小，预期影响可控 |
| 交互兼容性 | 虚拟节点的交互可能不一致 | 明确定义虚拟节点的行为规则 |
| 图标显示 | 某些旧浏览器可能不支持 Ant Design Icons | Ant Design 已支持 IE11+ |

---

## 9. 验收标准

- ✓ ModelBrowser 显示虚拟分组节点
- ✓ 所有 emoji 图标被替换为 Ant Design Icons
- ✓ 虚拟节点交互正确（不能选中、删除）
- ✓ 真实节点选中/交互正确
- ✓ 跨浏览器图标显示一致
- ✓ 无控制台错误或警告
- ✓ 代码审查通过

---

## 10. 附录：Ant Design Icon 导入

```typescript
import * as Icons from '@ant-design/icons-vue';

// 使用
<a-icon :icon="Icons.FolderOutlined" />
```

完整的可用 icon 列表见：https://ant.design/components/icon-cn

