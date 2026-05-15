import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const snippetToken = ref(0);
  const pendingSnippet = ref("");
  const activeRightTab = ref<"snippets" | "properties">("snippets");

  const queueSnippetInsert = (snippet: string) => {
    pendingSnippet.value = snippet;
    snippetToken.value += 1;
    activeRightTab.value = "snippets";
  };

  const consumeSnippet = () => {
    pendingSnippet.value = "";
  };

  const setActiveRightTab = (value: "snippets" | "properties") => {
    activeRightTab.value = value;
  };

  return {
    snippetToken,
    pendingSnippet,
    activeRightTab,
    queueSnippetInsert,
    consumeSnippet,
    setActiveRightTab,
  };
});

