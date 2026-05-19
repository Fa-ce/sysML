# SysML v2 图形化前端工程 — Vue 版落地文档

> 框架：Vue 3 + TypeScript 5  
> 构建工具：Vite 5  
> 图形引擎：AntV/X6 v2  
> 编辑器：vue-codemirror（CodeMirror 6）

---

## 一、完整依赖清单

### 1.1 生产依赖（dependencies）

#### 前端框架

| 包名         | 版本    | 用途       |
| ------------ | ------- | ---------- |
| `vue`        | ^3.4.29 | UI 框架    |
| `vue-router` | ^4.3.3  | 客户端路由 |

#### 图形引擎（核心）

| 包名                        | 版本    | 用途                               |
| --------------------------- | ------- | ---------------------------------- |
| `@antv/x6`                  | ^2.18.1 | 图形引擎核心：节点、边、画布、事件 |
| `@antv/x6-vue-shape`        | ^2.1.6  | X6 中使用 Vue 组件作为节点内容     |
| `@antv/x6-plugin-history`   | ^2.2.4  | Undo / Redo 命令历史               |
| `@antv/x6-plugin-selection` | ^2.2.2  | 框选、多选节点                     |
| `@antv/x6-plugin-minimap`   | ^2.0.7  | 右下角缩略图导航                   |
| `@antv/x6-plugin-clipboard` | ^2.1.3  | 节点复制粘贴                       |
| `@antv/x6-plugin-keyboard`  | ^2.2.2  | 快捷键绑定                         |
| `@antv/x6-plugin-snapline`  | ^2.0.7  | 节点对齐辅助线                     |
| `@antv/x6-plugin-scroller`  | ^2.0.10 | 滚轮缩放 + 拖拽平移画布            |

#### 自动布局引擎

| 包名           | 版本    | 用途                                                    |
| -------------- | ------- | ------------------------------------------------------- |
| `@antv/layout` | ^0.3.23 | Dagre（BDD 层次图）、Force（UseCase）自动布局，按需启用 |

#### 代码编辑器

| 包名                       | 版本    | 用途                           |
| -------------------------- | ------- | ------------------------------ |
| `vue-codemirror`           | ^6.1.1  | CodeMirror 6 的 Vue 3 封装     |
| `@codemirror/state`        | ^6.4.1  | CodeMirror 状态管理核心        |
| `@codemirror/view`         | ^6.26.3 | CodeMirror 视图核心            |
| `@codemirror/language`     | ^6.10.2 | 语言支持基础（语法高亮、折叠） |
| `@codemirror/lint`         | ^6.8.1  | 错误标注（下划线、侧边栏标记） |
| `@codemirror/autocomplete` | ^6.17.0 | 自动补全                       |
| `@codemirror/commands`     | ^6.6.0  | 键盘命令（格式化、注释等）     |
| `@lezer/highlight`         | ^1.2.1  | Lezer 语法树高亮标注           |

#### SysML v2 解析器

| 包名         | 版本    | 用途                                               |
| ------------ | ------- | -------------------------------------------------- |
| `chevrotain` | ^11.0.3 | 词法 + 语法分析工具库，纯 JS，运行在 Web Worker 中 |

#### 状态管理

| 包名            | 版本   | 用途                                                    |
| --------------- | ------ | ------------------------------------------------------- |
| `pinia`         | ^2.1.7 | Vue 官方状态管理，组合式 API 风格，完整 TypeScript 支持 |
| `@pinia/colada` | ^0.8.3 | Pinia 的异步数据获取插件（可选，用于服务端模型加载）    |

#### HTTP 请求库

| 包名    | 版本   | 用途                                                   |
| ------- | ------ | ------------------------------------------------------ |
| `axios` | ^1.7.2 | HTTP 请求，统一处理 token 鉴权、错误拦截、loading 状态 |

#### UI 组件库

| 包名                    | 版本    | 用途                                                    |
| ----------------------- | ------- | ------------------------------------------------------- |
| `ant-design-vue`        | ^4.2.3  | Ant Design Vue 4，与 AntV/X6 同一设计体系，视觉风格统一 |
| `@ant-design/icons-vue` | ^7.0.1  | Ant Design 图标库 Vue 版                                |
| `sass`                  | ^1.77.6 | css预处理器                                             |

#### 本地持久化存储

| 包名  | 版本   | 用途                                              |
| ----- | ------ | ------------------------------------------------- |
| `idb` | ^8.0.0 | IndexedDB 的 Promise 封装，模型自动保存、历史记录 |

#### 图形导出

| 包名            | 版本     | 用途                                                    |
| --------------- | -------- | ------------------------------------------------------- |
| `html-to-image` | ^1.11.11 | 画布导出 PNG / SVG（X6 内置导出方法已够用，此库作补充） |

#### 工具函数

| 包名        | 版本     | 用途                                                         |
| ----------- | -------- | ------------------------------------------------------------ |
| `lodash-es` | ^4.17.21 | 防抖（debounce）、深拷贝（cloneDeep），ESM 版按需 tree-shake |
| `dayjs`     | ^1.11.11 | 时间格式化，历史记录时间戳展示                               |

---

### 1.2 开发依赖（devDependencies）

#### 构建工具

| 包名                       | 版本   | 用途                                       |
| -------------------------- | ------ | ------------------------------------------ |
| `vite`                     | ^5.3.1 | 构建工具                                   |
| `@vitejs/plugin-vue`       | ^5.0.5 | Vite Vue 3 插件                            |
| `@vitejs/plugin-vue-jsx`   | ^4.0.1 | 支持 Vue JSX / TSX 语法（X6 节点组件需要） |
| `vite-plugin-vue-devtools` | ^7.3.1 | Vue DevTools 开发增强                      |

#### TypeScript

| 包名               | 版本     | 用途                           |
| ------------------ | -------- | ------------------------------ |
| `typescript`       | ^5.4.5   | TypeScript 编译器              |
| `vue-tsc`          | ^2.0.21  | Vue 文件的 TypeScript 类型检查 |
| `@types/lodash-es` | ^4.17.12 | lodash-es 类型定义             |

#### 代码规范

| 包名                               | 版本    | 用途                               |
| ---------------------------------- | ------- | ---------------------------------- |
| `eslint`                           | ^9.5.0  | 代码静态检查                       |
| `@typescript-eslint/parser`        | ^7.13.0 | TypeScript ESLint 解析器           |
| `@typescript-eslint/eslint-plugin` | ^7.13.0 | TypeScript ESLint 规则             |
| `eslint-plugin-vue`                | ^9.26.0 | Vue 文件 ESLint 规则               |
| `prettier`                         | ^3.3.2  | 代码格式化                         |
| `eslint-config-prettier`           | ^9.1.0  | 关闭与 Prettier 冲突的 ESLint 规则 |

#### 测试

| 包名               | 版本    | 用途                                              |
| ------------------ | ------- | ------------------------------------------------- |
| `vitest`           | ^1.6.0  | 单元测试框架                                      |
| `@vitest/ui`       | ^1.6.0  | Vitest 浏览器 UI 面板                             |
| `@vue/test-utils`  | ^2.4.6  | Vue 组件测试工具（对应 React 的 testing-library） |
| `jsdom`            | ^24.1.0 | Vitest 的 DOM 环境模拟                            |
| `@playwright/test` | ^1.44.1 | E2E 端到端测试                                    |

---

### 1.3 package.json 完整示例

```json
{
	"name": "sysml-viewer-vue",
	"version": "0.1.0",
	"private": true,
	"scripts": {
		"dev": "vite",
		"build": "vue-tsc -b && vite build",
		"preview": "vite preview",
		"test": "vitest run",
		"test:ui": "vitest --ui",
		"test:e2e": "playwright test",
		"lint": "eslint src --ext .ts,.tsx,.vue",
		"format": "prettier --write src",
		"typecheck": "vue-tsc --noEmit"
	},
	"dependencies": {
		"vue": "^3.4.29",
		"vue-router": "^4.3.3",
		"@antv/x6": "^2.18.1",
		"@antv/x6-vue-shape": "^2.1.6",
		"@antv/x6-plugin-history": "^2.2.4",
		"@antv/x6-plugin-selection": "^2.2.2",
		"@antv/x6-plugin-minimap": "^2.0.7",
		"@antv/x6-plugin-clipboard": "^2.1.3",
		"@antv/x6-plugin-keyboard": "^2.2.2",
		"@antv/x6-plugin-snapline": "^2.0.7",
		"@antv/x6-plugin-scroller": "^2.0.10",
		"@antv/layout": "^0.3.23",
		"vue-codemirror": "^6.1.1",
		"@codemirror/state": "^6.4.1",
		"@codemirror/view": "^6.26.3",
		"@codemirror/language": "^6.10.2",
		"@codemirror/lint": "^6.8.1",
		"@codemirror/autocomplete": "^6.17.0",
		"@codemirror/commands": "^6.6.0",
		"@lezer/highlight": "^1.2.1",
		"chevrotain": "^11.0.3",
		"pinia": "^2.1.7",
		"axios": "^1.7.2",
		"ant-design-vue": "^4.2.3",
		"@ant-design/icons-vue": "^7.0.1",
		"idb": "^8.0.0",
		"html-to-image": "^1.11.11",
		"lodash-es": "^4.17.21",
		"dayjs": "^1.11.11",
		"sass": "^1.77.6"
	},
	"devDependencies": {
		"vite": "^5.3.1",
		"@vitejs/plugin-vue": "^5.0.5",
		"@vitejs/plugin-vue-jsx": "^4.0.1",
		"vite-plugin-vue-devtools": "^7.3.1",
		"typescript": "^5.4.5",
		"vue-tsc": "^2.0.21",
		"@types/lodash-es": "^4.17.12",
		"eslint": "^9.5.0",
		"@typescript-eslint/parser": "^7.13.0",
		"@typescript-eslint/eslint-plugin": "^7.13.0",
		"eslint-plugin-vue": "^9.26.0",
		"prettier": "^3.3.2",
		"eslint-config-prettier": "^9.1.0",
		"vitest": "^1.6.0",
		"@vitest/ui": "^1.6.0",
		"@vue/test-utils": "^2.4.6",
		"jsdom": "^24.1.0",
		"@playwright/test": "^1.44.1"
	}
}
```

---

## 二、项目目录结构

```
sysml-viewer-vue/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.ts                          # 应用入口，注册插件、X6 自定义节点/边
│   ├── App.vue                          # 根组件，路由出口
│   │
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── SysMLEditor.vue          # vue-codemirror 封装，绑定防抖解析
│   │   │   ├── sysml-highlight.ts       # CodeMirror 6 自定义语言高亮规则
│   │   │   ├── sysml-lint.ts            # CodeMirror 6 linter（解析错误 → 下划线）
│   │   │   └── sysml-completion.ts      # CodeMirror 6 自动补全 Snippet
│   │   │
│   │   ├── Canvas/
│   │   │   ├── DiagramCanvas.vue        # X6 Graph 实例化和生命周期管理
│   │   │   ├── useGraph.ts              # X6 Graph 的 Composable 封装
│   │   │   ├── nodes/                   # 自定义 X6 节点（Vue 单文件组件）
│   │   │   │   ├── BDDBlockNode.vue     # BDD 块定义节点（属性/操作分区）
│   │   │   │   ├── IBDPartNode.vue      # IBD 部件节点（动态端口）
│   │   │   │   ├── UseCaseNode.vue      # 椭圆用例节点
│   │   │   │   ├── ActorNode.vue        # 参与者（小人）节点
│   │   │   │   ├── StateNode.vue        # 状态机节点
│   │   │   │   └── ActionNode.vue       # 活动图动作节点
│   │   │   └── edges/                   # 自定义 X6 边（箭头样式定义）
│   │   │       ├── generalization.ts    # 空心三角（泛化）
│   │   │       ├── composition.ts       # 实心菱形（组合）
│   │   │       ├── association.ts       # 普通关联箭头
│   │   │       ├── dependency.ts        # 虚线依赖
│   │   │       └── connector.ts         # IBD 连接器
│   │   │
│   │   ├── Toolbar/
│   │   │   ├── AppToolbar.vue           # 顶部工具栏（视图切换、导出、Undo/Redo）
│   │   │   └── ViewSelector.vue         # BDD/IBD/UseCase 视图切换按钮组
│   │   │
│   │   ├── Inspector/
│   │   │   ├── Inspector.vue            # 右侧属性面板
│   │   │   ├── BlockInspector.vue       # Block 属性详情
│   │   │   └── EdgeInspector.vue        # 边/关系属性详情
│   │   │
│   │   └── Layout/
│   │       └── AppLayout.vue            # 三栏布局（编辑器 + 画布 + 属性面板）
│   │
│   ├── parser/
│   │   ├── lexer.ts                     # Chevrotain Lexer（Token 定义）
│   │   ├── parser.ts                    # Chevrotain Parser（CST 规则）
│   │   ├── transformer.ts               # CST → SysMLModel 语义模型
│   │   ├── validator.ts                 # 语义校验（重名、类型引用）
│   │   └── types.ts                     # SysMLModel TypeScript 类型定义
│   │
│   ├── renderer/
│   │   ├── bdd.builder.ts               # SysMLModel → X6 cells（BDD 视图）
│   │   ├── ibd.builder.ts               # SysMLModel → X6 cells（IBD 视图）
│   │   ├── usecase.builder.ts           # UseCase 视图构建
│   │   ├── activity.builder.ts          # Activity 视图构建
│   │   ├── statemachine.builder.ts      # State Machine 视图构建
│   │   └── index.ts                     # 视图构建器工厂函数
│   │
│   ├── stores/
│   │   ├── model.store.ts               # 语义模型 + 解析状态（Pinia）
│   │   ├── view.store.ts                # 当前视图类型 + X6 图数据（Pinia）
│   │   ├── selection.store.ts           # 选中元素（Pinia）
│   │   └── ui.store.ts                  # 面板折叠等 UI 状态（Pinia）
│   │
│   ├── services/
│   │   ├── http.ts                      # axios 实例 + 拦截器配置
│   │   ├── storage.ts                   # idb IndexedDB 操作封装
│   │   └── export.ts                    # X6 导出 PNG / SVG / JSON
│   │
│   ├── workers/
│   │   └── parser.worker.ts             # Web Worker：运行 Chevrotain 解析器
│   │
│   ├── composables/
│   │   ├── useParser.ts                 # 调用 parser.worker 的 Composable
│   │   ├── useAutoLayout.ts             # @antv/layout 布局 Composable（按需）
│   │   └── useAutoSave.ts               # 自动保存到 IndexedDB 的 Composable
│   │
│   ├── router/
│   │   └── index.ts                     # vue-router 路由配置
│   │
│   ├── utils/
│   │   ├── debounce.ts                  # 防抖（复用 lodash-es）
│   │   └── id.ts                        # UUID 生成
│   │
│   └── types/
│       ├── sysml.ts                     # SysML v2 语义模型类型
│       └── graph.ts                     # X6 节点/边数据类型扩展
│
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .eslintrc.cjs
├── .prettierrc
├── playwright.config.ts
└── package.json
```

---

## 三、核心模块实现

### 3.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";
import { resolve } from "path";

export default defineConfig({
	plugins: [
		vue(),
		vueJsx(), // X6 Vue 节点组件有时需要 JSX 写法
		vueDevTools(),
	],
	resolve: {
		alias: { "@": resolve(__dirname, "src") },
	},
	worker: {
		format: "es", // Web Worker 使用 ES module 格式
	},
	optimizeDeps: {
		include: ["@antv/x6", "@antv/x6-vue-shape", "chevrotain"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"antv-x6": ["@antv/x6", "@antv/x6-vue-shape"],
					antdv: ["ant-design-vue", "@ant-design/icons-vue"],
					codemirror: [
						"vue-codemirror",
						"@codemirror/state",
						"@codemirror/view",
						"@codemirror/language",
						"@codemirror/lint",
						"@codemirror/autocomplete",
					],
					parser: ["chevrotain"],
				},
			},
		},
	},
});
```

### 3.2 应用入口

```typescript
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import Antd from "ant-design-vue";
import App from "./App.vue";
import { registerX6Nodes } from "./components/Canvas/nodes";
import { registerX6Edges } from "./components/Canvas/edges";
import { routes } from "./router";

// 注册 X6 自定义节点和边（在应用初始化时全局注册一次）
registerX6Nodes();
registerX6Edges();

const app = createApp(App);

app.use(createPinia());
app.use(createRouter({ history: createWebHistory(), routes }));
app.use(Antd);

app.mount("#app");
```

### 3.3 Pinia Store 设计

```typescript
// src/stores/model.store.ts
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { SysMLModel, Diagnostic } from "@/types/sysml";

export const useModelStore = defineStore("model", () => {
	// 源码文本
	const sourceText = ref<string>(EXAMPLE_SYSML);
	// 解析后的语义模型（shallowRef：模型对象大，不需要深度响应式）
	const model = shallowRef<SysMLModel | null>(null);
	// 诊断信息（错误 + 警告）
	const diagnostics = ref<Diagnostic[]>([]);
	// 解析进行中标志
	const isParsing = ref(false);

	function setSourceText(text: string) {
		sourceText.value = text;
	}

	function setParseResult(newModel: SysMLModel, newDiagnostics: Diagnostic[]) {
		model.value = newModel;
		diagnostics.value = newDiagnostics;
		isParsing.value = false;
	}

	function setIsParsing(v: boolean) {
		isParsing.value = v;
	}

	return {
		sourceText,
		model,
		diagnostics,
		isParsing,
		setSourceText,
		setParseResult,
		setIsParsing,
	};
});
```

```typescript
// src/stores/view.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export type ViewType = "bdd" | "ibd" | "usecase" | "activity" | "statemachine";

export const useViewStore = defineStore("view", () => {
	const activeView = ref<ViewType>("bdd");
	const ibdRoot = ref<string | null>(null); // IBD 视图的根 Part 名称
	const layoutEnabled = ref(false); // 是否启用自动布局

	function setActiveView(v: ViewType) {
		activeView.value = v;
	}
	function setIBDRoot(name: string | null) {
		ibdRoot.value = name;
	}
	function toggleLayout() {
		layoutEnabled.value = !layoutEnabled.value;
	}

	return {
		activeView,
		ibdRoot,
		layoutEnabled,
		setActiveView,
		setIBDRoot,
		toggleLayout,
	};
});
```

```typescript
// src/stores/selection.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionStore = defineStore("selection", () => {
	const selectedId = ref<string | null>(null);
	const selectedType = ref<"node" | "edge" | null>(null);

	function select(id: string, type: "node" | "edge") {
		selectedId.value = id;
		selectedType.value = type;
	}

	function clear() {
		selectedId.value = null;
		selectedType.value = null;
	}

	return { selectedId, selectedType, select, clear };
});
```

### 3.4 axios 实例配置

```typescript
// src/services/http.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { message } from "ant-design-vue";

const http: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
	timeout: 15000,
	headers: { "Content-Type": "application/json" },
});

// 请求拦截器：自动附加 token
http.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// 响应拦截器：统一错误提示
http.interceptors.response.use(
	(response) => response.data,
	(error: AxiosError<{ message?: string }>) => {
		const msg = error.response?.data?.message ?? error.message ?? "请求失败";
		message.error(msg);
		return Promise.reject(error);
	},
);

export default http;
```

### 3.5 IndexedDB 存储封装（与 React 版完全一致）

```typescript
// src/services/storage.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface SysMLDB extends DBSchema {
	projects: {
		key: string;
		value: {
			id: string;
			name: string;
			sourceText: string;
			updatedAt: number;
		};
		indexes: { "by-updated": number };
	};
	history: {
		key: number;
		value: { projectId: string; snapshot: string; timestamp: number };
		indexes: { "by-project": string };
	};
}

let db: IDBPDatabase<SysMLDB> | null = null;

async function getDB() {
	if (!db) {
		db = await openDB<SysMLDB>("sysml-viewer", 1, {
			upgrade(database) {
				const ps = database.createObjectStore("projects", { keyPath: "id" });
				ps.createIndex("by-updated", "updatedAt");
				const hs = database.createObjectStore("history", {
					keyPath: "id",
					autoIncrement: true,
				});
				hs.createIndex("by-project", "projectId");
			},
		});
	}
	return db;
}

export const storage = {
	async saveProject(project: SysMLDB["projects"]["value"]) {
		const db = await getDB();
		await db.put("projects", { ...project, updatedAt: Date.now() });
	},
	async loadProject(id: string) {
		return (await getDB()).get("projects", id);
	},
	async listProjects() {
		return (await getDB()).getAllFromIndex("projects", "by-updated");
	},
	async deleteProject(id: string) {
		return (await getDB()).delete("projects", id);
	},
	async saveHistorySnapshot(projectId: string, snapshot: string) {
		const db = await getDB();
		await db.add("history", { projectId, snapshot, timestamp: Date.now() });
		const all = await db.getAllFromIndex("history", "by-project", projectId);
		if (all.length > 50) {
			for (const item of all.slice(0, all.length - 50)) {
				await db.delete("history", item.timestamp);
			}
		}
	},
};
```

### 3.6 CodeMirror 6 语言支持（Vue 专属）

```typescript
// src/components/Editor/sysml-highlight.ts
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { StreamLanguage } from "@codemirror/language";

// 用 StreamLanguage 快速定义 SysML v2 高亮规则
// （不需要完整 Lezer 语法树，轻量实现）
export const sysmlStreamLanguage = StreamLanguage.define({
	name: "sysml",
	token(stream) {
		// 跳过空白
		if (stream.eatSpace()) return null;

		// 行注释
		if (stream.match("//")) {
			stream.skipToEnd();
			return "comment";
		}

		// 块注释
		if (stream.match("/*")) {
			let ch;
			while ((ch = stream.next()) != null) {
				if (ch === "*" && stream.eat("/")) break;
			}
			return "comment";
		}

		// 字符串
		if (stream.match(/"[^"]*"/)) return "string";

		// 多词关键字（顺序必须在单词关键字之前）
		if (stream.match(/part\s+def\b/)) return "keyword";
		if (stream.match(/port\s+def\b/)) return "keyword";
		if (stream.match(/state\s+def\b/)) return "keyword";

		// 单词关键字
		if (
			stream.match(
				/\b(package|part|attribute|port|connect|to|state|transition|accept|then|abstract|action|use|case|def|ref|in|out|inout|occurrence|item|flow|expose|include|extend|satisfy|requirement|first)\b/,
			)
		) {
			return "keyword";
		}

		// 特殊操作符
		if (stream.match(":>>")) return "operator";
		if (stream.match(":>")) return "operator";
		if (stream.match("::")) return "operator";

		// 数字
		if (stream.match(/\d+(\.\d+)?/)) return "number";

		// 标识符
		if (stream.match(/[a-zA-Z_][\w]*/)) return "variableName";

		// 其余字符逐个消耗
		stream.next();
		return null;
	},
});

// 配色方案（与 Ant Design 色系匹配）
export const sysmlHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: "#1d4ed8", fontWeight: "600" }, // 蓝色关键字
	{ tag: t.comment, color: "#6b7280", fontStyle: "italic" },
	{ tag: t.string, color: "#059669" }, // 绿色字符串
	{ tag: t.number, color: "#7c3aed" }, // 紫色数字
	{ tag: t.operator, color: "#dc2626" }, // 红色操作符
	{ tag: t.variableName, color: "#111827" },
]);

export const sysmlExtensions = [
	sysmlStreamLanguage,
	syntaxHighlighting(sysmlHighlightStyle),
];
```

```typescript
// src/components/Editor/sysml-lint.ts
import { linter, Diagnostic as CMDiagnostic } from "@codemirror/lint";
import { useModelStore } from "@/stores/model.store";

// 将 Pinia store 中的解析错误转换为 CodeMirror linter 诊断
export function sysmlLinter() {
	return linter((view) => {
		const store = useModelStore();
		return store.diagnostics.map(
			(d): CMDiagnostic => ({
				from: d.offset,
				to: d.offset + (d.length ?? 1),
				severity: d.severity === "error" ? "error" : "warning",
				message: d.message,
			}),
		);
	});
}
```

```typescript
// src/components/Editor/sysml-completion.ts
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";

export function sysmlCompletion(
	context: CompletionContext,
): CompletionResult | null {
	const word = context.matchBefore(/\w*/);
	if (!word || (word.from === word.to && !context.explicit)) return null;

	return {
		from: word.from,
		options: [
			{
				label: "part def",
				type: "keyword",
				apply: "part def ${1:Name} {\n\t$0\n}",
				detail: "定义块",
			},
			{
				label: "port def",
				type: "keyword",
				apply: "port def ${1:Name};",
				detail: "定义端口类型",
			},
			{
				label: "attribute",
				type: "keyword",
				apply: "attribute ${1:name} : ${2:Real};",
				detail: "属性",
			},
			{
				label: "part",
				type: "keyword",
				apply: "part ${1:name} : ${2:Type};",
				detail: "部件用法",
			},
			{
				label: "port",
				type: "keyword",
				apply: "port ${1:name} : ${2:PortType};",
				detail: "端口用法",
			},
			{
				label: "connect",
				type: "keyword",
				apply: "connect ${1:a.p} to ${2:b.q};",
				detail: "连接端口",
			},
			{
				label: "state def",
				type: "keyword",
				apply: "state def ${1:Name} {\n\t$0\n}",
				detail: "定义状态机",
			},
			{
				label: "package",
				type: "keyword",
				apply: "package ${1:Name} {\n\t$0\n}",
				detail: "定义包",
			},
			{
				label: "transition",
				type: "keyword",
				apply:
					"transition ${1:name} {\n\tfirst ${2:source}\n\taccept ${3:Trigger}\n\tthen ${4:target};\n}",
				detail: "状态转换",
			},
		],
	};
}
```

### 3.7 SysMLEditor 组件

```vue
<!-- src/components/Editor/SysMLEditor.vue -->
<template>
	<div class="sysml-editor">
		<div class="editor-header">
			<span class="editor-title">SysML v2</span>
			<a-tag v-if="modelStore.isParsing" color="processing">解析中…</a-tag>
			<a-tag v-else-if="errorCount > 0" color="error">
				{{ errorCount }} 个错误
			</a-tag>
			<a-tag v-else color="success">✓</a-tag>
		</div>

		<codemirror
			v-model="modelStore.sourceText"
			:extensions="extensions"
			:style="{ height: 'calc(100% - 36px)', fontSize: '13px' }"
			@change="onTextChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import { debounce } from "lodash-es";
import { useModelStore } from "@/stores/model.store";
import { useParser } from "@/composables/useParser";
import { sysmlExtensions } from "./sysml-highlight";
import { sysmlLinter } from "./sysml-lint";
import { sysmlCompletion } from "./sysml-completion";
import { autocompletion } from "@codemirror/autocomplete";

const modelStore = useModelStore();
const { parse } = useParser();

// 编辑器扩展：高亮 + linter + 自动补全 + 基础主题
const extensions = [
	...sysmlExtensions,
	sysmlLinter(),
	autocompletion({ override: [sysmlCompletion] }),
	EditorView.theme({
		"&": { background: "#fafafa" },
		".cm-gutters": { background: "#f1f5f9", border: "none" },
		".cm-activeLineGutter": { background: "#e2e8f0" },
	}),
];

const errorCount = computed(
	() => modelStore.diagnostics.filter((d) => d.severity === "error").length,
);

// 防抖 500ms 触发解析
const onTextChange = debounce((text: string) => {
	modelStore.setIsParsing(true);
	parse(text);
}, 500);
</script>

<style scoped>
.sysml-editor {
	display: flex;
	flex-direction: column;
	height: 100%;
	border-right: 1px solid #e5e7eb;
}
.editor-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 12px;
	height: 36px;
	background: #f8fafc;
	border-bottom: 1px solid #e5e7eb;
	font-size: 12px;
	color: #6b7280;
}
.editor-title {
	font-weight: 600;
	color: #374151;
}
</style>
```

### 3.8 DiagramCanvas 组件（X6 + Vue）

```vue
<!-- src/components/Canvas/DiagramCanvas.vue -->
<template>
	<div class="diagram-canvas-wrapper">
		<!-- X6 画布挂载容器 -->
		<div ref="containerRef" class="diagram-canvas" />
		<!-- Minimap 挂载容器 -->
		<div ref="minimapRef" class="diagram-minimap" />
		<!-- 工具栏浮层 -->
		<div class="canvas-toolbar">
			<a-button-group size="small">
				<a-button @click="undo" :disabled="!canUndo">
					<template #icon><UndoOutlined /></template>
				</a-button>
				<a-button @click="redo" :disabled="!canRedo">
					<template #icon><RedoOutlined /></template>
				</a-button>
			</a-button-group>
			<a-button size="small" @click="fitView">适应窗口</a-button>
			<a-button size="small" @click="exportPNG">导出 PNG</a-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons-vue";
import { useGraph } from "./useGraph";
import { useModelStore } from "@/stores/model.store";
import { useViewStore } from "@/stores/view.store";
import { useSelectionStore } from "@/stores/selection.store";
import { buildGraph } from "@/renderer";
import { applyDagreLayout } from "@/composables/useAutoLayout";
import { exportAsPNG } from "@/services/export";

const containerRef = ref<HTMLDivElement | null>(null);
const minimapRef = ref<HTMLDivElement | null>(null);
const modelStore = useModelStore();
const viewStore = useViewStore();
const selectionStore = useSelectionStore();

const { graphRef, canUndo, canRedo, undo, redo } = useGraph(
	containerRef,
	minimapRef,
);

// 模型或视图类型变化时重新构建图
watch(
	[() => modelStore.model, () => viewStore.activeView],
	([model, view]) => {
		const graph = graphRef.value;
		if (!graph || !model) return;

		const cells = buildGraph(model, view, viewStore.ibdRoot);
		graph.fromJSON({ cells });

		if (viewStore.layoutEnabled) {
			applyDagreLayout(graph);
		}
	},
	{ immediate: false },
);

// 监听 X6 节点选中事件，同步到 Pinia
onMounted(() => {
	const graph = graphRef.value;
	if (!graph) return;
	graph.on("node:click", ({ node }) => selectionStore.select(node.id, "node"));
	graph.on("edge:click", ({ edge }) => selectionStore.select(edge.id, "edge"));
	graph.on("blank:click", () => selectionStore.clear());
});

function fitView() {
	graphRef.value?.centerContent();
}

async function exportPNG() {
	if (graphRef.value) await exportAsPNG(graphRef.value);
}
</script>

<style scoped>
.diagram-canvas-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
}
.diagram-canvas {
	width: 100%;
	height: 100%;
}
.diagram-minimap {
	position: absolute;
	bottom: 16px;
	right: 16px;
	width: 160px;
	height: 100px;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.canvas-toolbar {
	position: absolute;
	top: 12px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 8px;
	align-items: center;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(4px);
	padding: 6px 12px;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>
```

### 3.9 useGraph Composable

```typescript
// src/components/Canvas/useGraph.ts
import { ref, onMounted, onUnmounted, Ref, computed } from "vue";
import { Graph } from "@antv/x6";
import { Selection } from "@antv/x6-plugin-selection";
import { History } from "@antv/x6-plugin-history";
import { Scroller } from "@antv/x6-plugin-scroller";
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { Clipboard } from "@antv/x6-plugin-clipboard";
import { Snapline } from "@antv/x6-plugin-snapline";
import { MiniMap } from "@antv/x6-plugin-minimap";

export function useGraph(
	containerRef: Ref<HTMLDivElement | null>,
	minimapRef: Ref<HTMLDivElement | null>,
) {
	const graphRef = ref<Graph | null>(null);
	const canUndo = ref(false);
	const canRedo = ref(false);

	onMounted(() => {
		if (!containerRef.value) return;

		const graph = new Graph({
			container: containerRef.value,
			autoResize: true,
			background: { color: "#f8fafc" },
			grid: {
				visible: true,
				size: 10,
				type: "doubleMesh",
				args: [
					{ color: "#e2e8f0", thickness: 1 },
					{ color: "#cbd5e1", thickness: 1, factor: 4 },
				],
			},
			connecting: {
				snap: { radius: 20 },
				allowBlank: false,
				highlight: true,
				validateConnection({ targetMagnet }) {
					return !!targetMagnet;
				},
			},
		});

		graph.use(new Selection({ rubberband: true, showNodeSelectionBox: true }));
		graph.use(new History({ stackSize: 50 }));
		graph.use(new Scroller({ pannable: true }));
		graph.use(new Keyboard({ enabled: true }));
		graph.use(new Clipboard({ enabled: true }));
		graph.use(new Snapline({ enabled: true }));

		if (minimapRef.value) {
			graph.use(
				new MiniMap({ container: minimapRef.value, width: 160, height: 100 }),
			);
		}

		// 快捷键
		graph.bindKey(["ctrl+z", "meta+z"], () => graph.undo());
		graph.bindKey(["ctrl+shift+z", "meta+shift+z"], () => graph.redo());
		graph.bindKey(["ctrl+c", "meta+c"], () =>
			graph.copy(graph.getSelectedCells()),
		);
		graph.bindKey(["ctrl+v", "meta+v"], () => graph.paste());
		graph.bindKey("delete", () =>
			graph.getSelectedCells().forEach((c) => c.remove()),
		);
		graph.bindKey("backspace", () =>
			graph.getSelectedCells().forEach((c) => c.remove()),
		);

		// 同步 undo/redo 状态
		graph.on("history:change", () => {
			canUndo.value = graph.canUndo();
			canRedo.value = graph.canRedo();
		});

		graphRef.value = graph;
	});

	onUnmounted(() => {
		graphRef.value?.dispose();
		graphRef.value = null;
	});

	return {
		graphRef,
		canUndo,
		canRedo,
		undo: () => graphRef.value?.undo(),
		redo: () => graphRef.value?.redo(),
	};
}
```

### 3.10 X6 节点注册（Vue 组件式）

```typescript
// src/components/Canvas/nodes/index.ts
import { Graph } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import BDDBlockNode from "./BDDBlockNode.vue";
import IBDPartNode from "./IBDPartNode.vue";
import UseCaseNode from "./UseCaseNode.vue";
import ActorNode from "./ActorNode.vue";
import StateNode from "./StateNode.vue";

export function registerX6Nodes() {
	// 用 @antv/x6-vue-shape 的 register 方法
	// 将 Vue SFC 作为 X6 节点的渲染内容
	register({
		shape: "bdd-block",
		width: 200,
		height: 130,
		component: BDDBlockNode,
		ports: {
			groups: {
				top: {
					position: "top",
					attrs: {
						circle: {
							r: 4,
							magnet: true,
							stroke: "#64748b",
							fill: "#fff",
							strokeWidth: 1,
						},
					},
				},
				bottom: {
					position: "bottom",
					attrs: {
						circle: {
							r: 4,
							magnet: true,
							stroke: "#64748b",
							fill: "#fff",
							strokeWidth: 1,
						},
					},
				},
				left: {
					position: "left",
					attrs: {
						circle: {
							r: 4,
							magnet: true,
							stroke: "#64748b",
							fill: "#fff",
							strokeWidth: 1,
						},
					},
				},
				right: {
					position: "right",
					attrs: {
						circle: {
							r: 4,
							magnet: true,
							stroke: "#64748b",
							fill: "#fff",
							strokeWidth: 1,
						},
					},
				},
			},
		},
	});

	register({
		shape: "ibd-part",
		width: 180,
		height: 100,
		component: IBDPartNode,
	});
	register({
		shape: "use-case",
		width: 140,
		height: 60,
		component: UseCaseNode,
	});
	register({ shape: "uml-actor", width: 60, height: 80, component: ActorNode });
	register({
		shape: "sysml-state",
		width: 160,
		height: 60,
		component: StateNode,
	});
}
```

```vue
<!-- src/components/Canvas/nodes/BDDBlockNode.vue -->
<template>
	<div class="bdd-block">
		<!-- 标题区 -->
		<div class="bdd-header">
			<div v-if="node.data.isAbstract" class="bdd-stereotype">«abstract»</div>
			<div class="bdd-name">{{ node.data.name }}</div>
		</div>

		<!-- 属性区 -->
		<div v-if="node.data.attributes?.length" class="bdd-section">
			<div
				v-for="attr in node.data.attributes"
				:key="attr.name"
				class="bdd-item"
			>
				{{ attr.name }} : {{ attr.type }}
			</div>
		</div>

		<!-- 操作区 -->
		<div v-if="node.data.operations?.length" class="bdd-section bdd-ops">
			<div v-for="op in node.data.operations" :key="op.name" class="bdd-item">
				{{ op.name }}({{ op.params }})
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { Node } from "@antv/x6";

// @antv/x6-vue-shape 通过 inject 提供当前节点实例
const node = inject<Node>("getNode")!() as any;
</script>

<style scoped>
.bdd-block {
	width: 100%;
	height: 100%;
	border: 1.5px solid #374151;
	border-radius: 4px;
	background: #fff;
	font-family: "JetBrains Mono", "Fira Code", monospace;
	font-size: 12px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.bdd-header {
	background: #1e3a5f;
	color: #fff;
	padding: 4px 8px;
	text-align: center;
	flex-shrink: 0;
}
.bdd-stereotype {
	font-size: 10px;
	opacity: 0.75;
}
.bdd-name {
	font-weight: 700;
	font-size: 13px;
}
.bdd-section {
	border-top: 1px solid #d1d5db;
	padding: 3px 8px;
	flex: 1;
}
.bdd-ops {
	border-top: 1px solid #d1d5db;
}
.bdd-item {
	color: #374151;
	line-height: 1.6;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
```

### 3.11 useParser Composable（Web Worker 封装）

```typescript
// src/composables/useParser.ts
import { onUnmounted, ref } from "vue";
import { useModelStore } from "@/stores/model.store";

export function useParser() {
	const modelStore = useModelStore();
	const worker = ref<Worker | null>(null);
	const pending = new Map<string, { resolve: Function; reject: Function }>();

	// 懒加载 Worker
	function getWorker(): Worker {
		if (!worker.value) {
			worker.value = new Worker(
				new URL("../workers/parser.worker.ts", import.meta.url),
				{ type: "module" },
			);
			worker.value.onmessage = ({ data }) => {
				const cb = pending.get(data.id);
				if (!cb) return;
				pending.delete(data.id);
				data.type === "success" ?
					cb.resolve(data.result)
				:	cb.reject(data.error);
			};
		}
		return worker.value;
	}

	async function parse(text: string) {
		const id = crypto.randomUUID();
		const result = await new Promise<any>((resolve, reject) => {
			pending.set(id, { resolve, reject });
			getWorker().postMessage({ id, text });
		});
		modelStore.setParseResult(result.model, result.diagnostics);
	}

	onUnmounted(() => {
		worker.value?.terminate();
		worker.value = null;
	});

	return { parse };
}
```

### 3.12 useAutoSave Composable

```typescript
// src/composables/useAutoSave.ts
import { watch } from "vue";
import { debounce } from "lodash-es";
import { useModelStore } from "@/stores/model.store";
import { storage } from "@/services/storage";

export function useAutoSave(projectId: string) {
	const modelStore = useModelStore();

	const save = debounce(async (text: string) => {
		await storage.saveProject({
			id: projectId,
			name: projectId,
			sourceText: text,
			updatedAt: Date.now(),
		});
	}, 2000); // 用户停止输入 2 秒后自动保存

	watch(
		() => modelStore.sourceText,
		(text) => save(text),
	);
}
```

### 3.13 AppLayout 根布局

```vue
<!-- src/components/Layout/AppLayout.vue -->
<template>
	<a-layout style="height: 100vh;">
		<!-- 顶部工具栏 -->
		<a-layout-header
			style="padding: 0; height: 48px; line-height: 48px; background: #fff; border-bottom: 1px solid #e5e7eb;"
		>
			<AppToolbar />
		</a-layout-header>

		<a-layout>
			<!-- 左侧编辑器 -->
			<a-layout-sider
				:width="420"
				theme="light"
				style="border-right: 1px solid #e5e7eb; overflow: hidden;"
			>
				<SysMLEditor />
			</a-layout-sider>

			<!-- 中央画布 -->
			<a-layout-content style="position: relative; overflow: hidden;">
				<DiagramCanvas />
			</a-layout-content>

			<!-- 右侧属性面板 -->
			<a-layout-sider
				:width="280"
				theme="light"
				style="border-left: 1px solid #e5e7eb; overflow-y: auto;"
			>
				<Inspector />
			</a-layout-sider>
		</a-layout>
	</a-layout>
</template>

<script setup lang="ts">
import AppToolbar from "@/components/Toolbar/AppToolbar.vue";
import SysMLEditor from "@/components/Editor/SysMLEditor.vue";
import DiagramCanvas from "@/components/Canvas/DiagramCanvas.vue";
import Inspector from "@/components/Inspector/Inspector.vue";
</script>
```

---
