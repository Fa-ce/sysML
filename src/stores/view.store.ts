import { defineStore } from "pinia";
import { ref } from "vue";

export type DiagramView = "general" | "ibd" | "requirements" | "behavior";
type PositionMap = Record<string, { x: number; y: number }>;

export const useViewStore = defineStore("view", () => {
  const activeView = ref<DiagramView>("general");
  const searchKeyword = ref("");
  const graphVersion = ref(0);
  const nodePositions = ref<Record<DiagramView, PositionMap>>({
    general: {},
    ibd: {},
    requirements: {},
    behavior: {},
  });

  const setActiveView = (view: DiagramView) => {
    activeView.value = view;
  };

  const setSearchKeyword = (value: string) => {
    searchKeyword.value = value;
  };

  const requestGraphRefresh = () => {
    graphVersion.value += 1;
  };

  const setNodePosition = (
    view: DiagramView,
    id: string,
    position: { x: number; y: number },
  ) => {
    nodePositions.value[view] = {
      ...nodePositions.value[view],
      [id]: position,
    };
  };

  const clearNodePositions = (view: DiagramView) => {
    nodePositions.value[view] = {};
  };

  return {
    activeView,
    searchKeyword,
    graphVersion,
    nodePositions,
    setActiveView,
    setSearchKeyword,
    requestGraphRefresh,
    setNodePosition,
    clearNodePositions,
  };
});
