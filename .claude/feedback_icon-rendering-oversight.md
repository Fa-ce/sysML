---
name: icon-rendering-oversight
description: 图标值类型变更后需同步更新渲染逻辑 - 避免值类型改动时遗漏依赖代码
metadata:
  type: feedback
---

## 教训：Icon 值类型改变需全链路同步

### 问题描述
在 Task 3（替换 emoji → Ant Design Icon 字符串）中，修改了 `sysml-mapping.ts` 中所有元素的 `icon` 字段值类型：
- **之前**：emoji 字符（如 `"📁"`）
- **之后**：Ant Design Icon 名称字符串（如 `"FolderOutlined"`）

但在 Task 4 时，没有同步更新使用这些 icon 的代码，导致图标以文本形式显示而不是作为组件渲染。

### 根本原因
**值类型改变的链式效应没有被完整考虑**：
- ✅ 数据层改动了 (sysml-mapping.ts)
- ✗ 遗漏了数据处理层的适配 (buildTree 函数)
- ✗ 遗漏了渲染层的适配 (模板中的 icon 渲染)

当 icon 是 emoji 时，`{{ icon }}` 能直接渲染。但改为字符串后，需要：
1. 在 buildTree 中将字符串转换为组件（`getIconComponent(icon)`）
2. 在模板中用 `<component :is="icon" />` 渲染

### 修复方案（用户实施）
```typescript
// buildTree 中
icon: getIconComponent(meta.icon),  // 将字符串转换为组件

// 模板中
<component :is="icon" class="tree-icon" twoToneColor="#f0fdfa" />
```

### 预防措施
**值类型改动检查清单**：
- [ ] 修改某个字段的值类型时，grep 搜索所有使用该字段的地方
- [ ] 对每个使用点评估是否需要适配
- [ ] 数据层 → 处理层 → 渲染层要完整验证
- [ ] 最好在修改时就考虑好全链路的适配

### 为什么这次没被及时发现
1. Task 3 只检查了"数据替换的准确性"，没有检查"数据消费的适配性"
2. 模板还没更新（那是 Task 4-6 的事），所以 emoji 图标虽然被替换了字符串，但没有立即显示问题
3. 等到实际渲染时才发现问题

### 相关任务
- Task 3: 替换 sysml-mapping.ts 的 icon
- Task 4: 修改 ModelBrowser.vue 的导入和辅助函数（应该同时考虑渲染适配）
- Task 5-6: 模板修改（实际由用户手动完成）
