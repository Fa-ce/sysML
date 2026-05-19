<template>
	<div class="browser panel-section">
		<div class="browser__header">
			<span class="panel-title">Model Browser</span>
			<a-button type="link" size="small" @click="expandAll = !expandAll">
				{{ expandAll ? "收起" : "展开" }}
			</a-button>
		</div>

		<div class="browser__body">
			<a-tree
				block-node
				:tree-data="treeData"
				:expanded-keys="expandedKeys"
				:selected-keys="selectedKeys"
				@expand="onExpand"
				@select="onSelect"
			>
				<template #title="{ title, kind, icon, kindLabel, isVirtual }">
					<div class="tree-title">
						<component :is="icon" class="tree-icon" twoToneColor="#f0fdfa" />
						<span class="tree-name">{{ title }}</span>
						<span v-if="!isVirtual" class="tree-kind">{{ kindLabel || kind }}</span>
					</div>
				</template>
			</a-tree>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useModelStore } from "@/stores/model.store";
import { useSelectionStore } from "@/stores/selection.store";
import { useUiStore } from "@/stores/ui.store";
import type { ModelElement, ElementKind } from "@/parser/types";
import { getKindMeta } from "@/constants/model-kinds";
import * as Icons from "@ant-design/icons-vue";
import type { GroupType } from "@/parser/types";
import { ELEMENT_GROUP_MAPPING, GROUP_META } from "@/constants/model-groups";

const modelStore = useModelStore();
const selectionStore = useSelectionStore();
const uiStore = useUiStore();
const expandAll = ref(true);
const manualExpandedKeys = ref<string[]>([]);

// 获取元素应该放在哪个分组下
function getElementGroupType(kind: ElementKind): GroupType | null {
	const groupMapping: Record<ElementKind, GroupType | null> = {
		// 成员分组
		attribute: "attributes",
		attributeUsage: "attributes",
		port: "ports",
		operation: "operations",
		comment: "annotations",
		documentation: "annotations",
		textualRepresentation: "annotations",

		// 部件内的分组
		partDef: "parts",
		partUsage: "parts",
		itemDef: "parts",
		itemUsage: "parts",

		// 需求内的分组
		requirementDef: "requirements",
		requirementUsage: "requirements",
		subject: "subject",

		// 状态和行为容器（本身是容器，不属于任何虚拟分组）
		stateDef: null,
		stateUsage: null,
		actionDef: null,
		actionUsage: null,

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

const treeData = computed(() => buildTree(modelStore.model.elements));
const expandedKeys = computed(() => manualExpandedKeys.value);
const selectedKeys = computed(() =>
	selectionStore.selectedId ? [selectionStore.selectedId] : [],
);

watch(
	treeData,
	(nodes) => {
		manualExpandedKeys.value = expandAll.value ? flattenTreeKeys(nodes) : [];
	},
	{ immediate: true },
);

watchEffect(() => {
	if (selectionStore.selectedId) {
		uiStore.setActiveRightTab("properties");
	}
});

watch(expandAll, (value) => {
	manualExpandedKeys.value = value ? flattenTreeKeys(treeData.value) : [];
});

function onSelect(keys: string[]) {
	const [id] = keys;
	if (!id) return;

	// 虚拟节点不能选中
	if (id.includes('__group__')) return;

	selectionStore.select(id, "node");
}

function onExpand(keys: string[]) {
	manualExpandedKeys.value = keys;
}

function buildTree(elements: ModelElement[]) {
	const map = new Map<string, any>();
	const roots: any[] = [];

	// 第一步：创建所有元素节点
	elements.forEach((element: ModelElement) => {
		const meta = getKindMeta(element.kind);
		map.set(element.id, {
			key: element.id,
			title: element.name,
			kind: element.kind,
			icon: getIconComponent(meta.icon),
			kindLabel: meta.label,
			isVirtual: false,
			elementId: element.id,
			children: [],
		});
	});

	// 第二步：构建树结构并插入虚拟分组节点
	elements.forEach((element: ModelElement) => {
		const node = map.get(element.id);
		if (!node) return;

		// 根据元素类型添加虚拟分组节点
		const groupTypes = ELEMENT_GROUP_MAPPING[element.kind] || [];
		if (groupTypes.length > 0) {
			groupTypes.forEach((groupType) => {
				const groupMeta = GROUP_META[groupType];
				node.children.push({
					key: `${element.id}__group__${groupType}`,
					title: groupMeta.label,
					icon: getIconComponent(groupMeta.icon),
					isVirtual: true,
					groupType,
					parentElementId: element.id,
					children: [],
				});
			});
		}

		// 建立真实的父子关系
		if (element.parentId && map.has(element.parentId)) {
			const parentNode = map.get(element.parentId);

			// 根据元素类型，放到对应的虚拟分组下
			const groupType = getElementGroupType(element.kind);
			if (groupType) {
				// 在父节点的虚拟分组中查找对应分组
				const groupNode = parentNode.children.find(
					(child: any) => child.isVirtual && child.groupType === groupType
				);
				if (groupNode) {
					groupNode.children.push(node);
				} else {
					// 如果没有找到分组（不应该发生），直接加到父节点下
					parentNode.children.push(node);
				}
			} else {
				// 没有分组的直接放入父节点
				parentNode.children.push(node);
			}
		} else {
			// 没有 parentId 的是顶级元素
			roots.push(node);
		}
	});

	return roots;
}

function flattenTreeKeys(nodes: any[]) {
	const result: string[] = [];
	nodes.forEach((node) => {
		result.push(node.key);
		if (node.children?.length) {
			result.push(...flattenTreeKeys(node.children));
		}
	});
	return result;
}
</script>

<style scoped>
.browser {
	height: 100%;
}

.browser__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 18px 10px;
}

.browser__body {
	min-height: 0;
	height: 100%;
	padding: 0 10px 16px;
	overflow: auto;
}

.tree-title {
	display: flex;
	align-items: center;
	gap: 4px;
	min-width: 0;
	color: var(--text-primary);
}

.tree-icon {
	width: 12px;
	flex-shrink: 0;
	text-align: center;
	font-size: 11px;
	color: var(--icon-color);
}

.browser :deep(.ant-tree-switcher) {
	width: 14px;
	margin-right: 0;
}

.browser :deep(.ant-tree-node-content-wrapper) {
	padding-inline: 0 2px;
}

.tree-name {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tree-kind {
	margin-left: auto;
	flex-shrink: 0;
	color: var(--text-muted);
	font-size: 10px;
}
</style>
