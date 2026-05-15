# syson-front

基于 `front.MD` 与 `syson-ui-v2/requirementV2.md` 新建的前端落地工程。

## 当前实现

- Vue 3 + TypeScript + Vite 工程骨架
- 三栏工作台：模型浏览器 / 图形视图 / 代码编辑器
- 顶部工具栏、右侧片段与属性面板、底部错误面板
- Web Worker 驱动的轻量 SysML 文本解析链路
- X6 通用图渲染与 Dagre 自动布局
- 本地 IndexedDB 自动保存

## 当前解析覆盖

首版解析器覆盖以下高频结构：

- `package`
- `part def`
- `part`
- `requirement def`
- `requirement`
- `interface def`
- `connect ... to ...`
- `satisfy ...`

这是一套可继续扩展的落地骨架，不是完整 SysML v2 解析器。

## 启动

```bash
npm install
npm run dev
```

