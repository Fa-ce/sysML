import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useModelStore } from "./model.store";

export const useSelectionStore = defineStore("selection", () => {
  const selectedId = ref<string | null>(null);
  const selectedKind = ref<"node" | "edge" | null>(null);
  const modelStore = useModelStore();

  const selectedElement = computed(() =>
    modelStore.model.elements.find((item) => item.id === selectedId.value),
  );

  const selectedRelation = computed(() =>
    modelStore.model.relations.find((item) => item.id === selectedId.value),
  );

  const select = (id: string, kind: "node" | "edge") => {
    selectedId.value = id;
    selectedKind.value = kind;
    if (kind === "node") {
      const line = modelStore.model.elements.find((item) => item.id === id)?.line ?? null;
      modelStore.setFocusLine(line);
    }
  };

  const clear = () => {
    selectedId.value = null;
    selectedKind.value = null;
    modelStore.setFocusLine(null);
  };

  return {
    selectedId,
    selectedKind,
    selectedElement,
    selectedRelation,
    select,
    clear,
  };
});
