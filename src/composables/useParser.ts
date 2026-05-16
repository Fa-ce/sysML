import { useModelStore } from "@/stores/model.store";
import { parseSysmlRemote } from "@/api/sysml";

export function useParser() {
  const modelStore = useModelStore();

  const parse = async (text: string) => {
    try {
      const result = await parseSysmlRemote(text);
      if (result.unmappedKinds.nodeKinds.length || result.unmappedKinds.edgeKinds.length) {
        console.warn("Unmapped SysML kinds from backend:", result.unmappedKinds);
      }
      modelStore.setParseResult(result.model, result.diagnostics);
      return result;
    } catch (error) {
      modelStore.setDiagnostics([
        {
          line: 1,
          column: 1,
          offset: 0,
          length: 1,
          severity: "error",
          message: String(error),
        },
      ]);
      modelStore.setIsParsing(false);
      return null;
    }
  };

  return { parse };
}
