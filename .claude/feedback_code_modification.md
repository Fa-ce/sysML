---
name: code-modification-caution
description: "谨慎修改看似\"不对\"但已工作的代码 — 验证后再改"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c539b960-956f-4c4d-9620-dad49d24c3c8
---

## 规则

**不要随意改变已经工作的代码，即使看起来有问题或不遵循最佳实践。**

### Why
在 syson-front ModelBrowser.vue 中的修改经验：
- 将 `twoToneColor="#f0fdfa"` 改为 `:twoToneColor="'#f0fdfa'"` 破坏了图标颜色功能
- Ant Design Icons 在 Vue `<component>` 模板中的属性传递有特殊处理，静态属性实际上能正常工作
- 改动虽然看似"更正确"的 Vue 语法，但实际上破坏了功能

### How to apply
- **代码清理时**：只删除真正未使用的导入/函数，不改现有功能代码
- **重构前**：先本地验证修改后的功能是否仍可用，不要假设
- **IDE 警告**：区分"未使用"警告（安全删除）和"语法检查"警告（需谨慎）
- **改动策略**：分离"代码清理"和"功能改进"，分别验证每一类

**关键**：工作中宁可保留看似不优雅的代码，也要确保功能完整。
