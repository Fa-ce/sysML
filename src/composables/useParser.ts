import { onUnmounted } from "vue";
import { useModelStore } from "@/stores/model.store";
import type { ParseResult } from "@/parser/types";

export function useParser() {
  const modelStore = useModelStore();
  let worker: Worker | null = null;
  const pending = new Map<
    string,
    {
      resolve: (value: ParseResult) => void;
      reject: (reason?: unknown) => void;
    }
  >();

  const getWorker = () => {
    if (!worker) {
      worker = new Worker(new URL("../workers/parser.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (event) => {
        const { id, type, result, error } = event.data;
        const current = pending.get(id);
        if (!current) return;
        pending.delete(id);
        if (type === "success") current.resolve(result);
        else current.reject(error);
      };
    }
    return worker;
  };

  const parse = async (text: string) => {
    const id = crypto.randomUUID();
    try {
      const result = await new Promise<ParseResult>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        getWorker().postMessage({ id, text });
      });
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

  onUnmounted(() => {
    worker?.terminate();
    worker = null;
  });

  return { parse };
}

