<template>
	<div class="workbench">
		<header class="workbench__header glass-panel">
			<AppToolbar />
		</header>

		<main class="workbench__main">
			<aside class="workbench__browser glass-panel">
				<ModelBrowser />
			</aside>

			<section class="workbench__diagram glass-panel">
				<DiagramCanvas />
			</section>

			<section class="workbench__right">
				<section class="workbench__editor glass-panel">
					<SysMLEditor />
				</section>

				<aside class="workbench__side glass-panel">
					<div class="side-tabs">
						<a-segmented
							:value="uiStore.activeRightTab"
							:options="tabOptions"
							@change="onTabChange"
						/>
					</div>
					<SnippetLibrary v-if="uiStore.activeRightTab === 'snippets'" />
					<Inspector v-else />
				</aside>
			</section>
		</main>

		<footer class="workbench__footer glass-panel">
			<ErrorPanel />
		</footer>
	</div>
</template>

<script setup lang="ts">
import AppToolbar from "@/components/Toolbar/AppToolbar.vue";
import ModelBrowser from "@/components/Browser/ModelBrowser.vue";
import DiagramCanvas from "@/components/Canvas/DiagramCanvas.vue";
import SysMLEditor from "@/components/Editor/SysMLEditor.vue";
import SnippetLibrary from "@/components/Panels/SnippetLibrary.vue";
import Inspector from "@/components/Inspector/Inspector.vue";
import ErrorPanel from "@/components/Panels/ErrorPanel.vue";
import { useUiStore } from "@/stores/ui.store";

const uiStore = useUiStore();

const tabOptions = [
	{ label: "片段", value: "snippets" },
	{ label: "属性", value: "properties" },
];

function onTabChange(value: string | number) {
	uiStore.setActiveRightTab(value as "snippets" | "properties");
}
</script>

<style scoped>
.workbench {
	display: grid;
	grid-template-rows: 68px minmax(0, 1fr) 168px;
	gap: 14px;
	width: 100%;
	height: 100%;
	padding: 14px;
	background:
		linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.94),
			rgba(249, 250, 251, 0.98)
		),
		var(--bg-page);
}

.workbench__header {
	display: flex;
	align-items: center;
	border-radius: var(--radius-panel);
	padding: 0 18px;
}

.workbench__main {
	min-height: 0;
	display: grid;
	grid-template-columns: 280px minmax(300px, 1fr) 450px;
	gap: 14px;
}

.workbench__browser,
.workbench__diagram,
.workbench__editor,
.workbench__side,
.workbench__footer {
	border-radius: var(--radius-panel);
	overflow: hidden;
}

.workbench__browser,
.workbench__diagram,
.workbench__editor,
.workbench__side,
.workbench__right {
	min-height: 0;
}

.workbench__right {
	display: grid;
	grid-template-rows: minmax(320px, 1.05fr) minmax(240px, 0.95fr);
	gap: 14px;
}

.workbench__side {
	display: flex;
	flex-direction: column;
	min-height: 0;
}

.side-tabs {
	padding: 14px 14px 0;
}

.workbench__footer {
	min-height: 0;
}
</style>
