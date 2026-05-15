import { defineStore } from "pinia";
import { ref } from "vue";
import type { DiagnosticItem, SysmlModel } from "@/parser/types";

export const useModelStore = defineStore("model", () => {
  const sourceText = ref("");
  const model = ref<SysmlModel>({ elements: [], relations: [] });
  const diagnostics = ref<DiagnosticItem[]>([]);
  const isParsing = ref(false);

  const setSourceText = (text: string) => {
    sourceText.value = text;
  };

  const setIsParsing = (value: boolean) => {
    isParsing.value = value;
  };

  const setDiagnostics = (items: DiagnosticItem[]) => {
    diagnostics.value = items;
  };

  const setParseResult = (nextModel: SysmlModel, nextDiagnostics: DiagnosticItem[]) => {
    model.value = nextModel;
    diagnostics.value = nextDiagnostics;
    isParsing.value = false;
  };

  return {
    sourceText,
    model,
    diagnostics,
    isParsing,
    setSourceText,
    setIsParsing,
    setDiagnostics,
    setParseResult,
  };
});

