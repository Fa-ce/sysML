import { defineStore } from "pinia";
import { ref } from "vue";

export interface RemoteSnippet {
  key: string;
  label: string;
  code: string;
}

export const useUiStore = defineStore("ui", () => {
  const snippetToken = ref(0);
  const pendingSnippet = ref("");
  const activeRightTab = ref<"snippets" | "properties">("snippets");
  const snippetCategories = ref<Record<string, RemoteSnippet[]>>({});

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

  const setSnippetCategories = (value: Record<string, RemoteSnippet[]>) => {
    snippetCategories.value = value;
  };

  return {
    snippetToken,
    pendingSnippet,
    activeRightTab,
    snippetCategories,
    queueSnippetInsert,
    consumeSnippet,
    setActiveRightTab,
    setSnippetCategories,
  };
});
