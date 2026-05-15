/// <reference lib="webworker" />

import { parseSysml } from "@/parser/parseSysml";

self.onmessage = (event: MessageEvent<{ id: string; text: string }>) => {
  try {
    const result = parseSysml(event.data.text);
    self.postMessage({
      id: event.data.id,
      type: "success",
      result,
    });
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      type: "error",
      error: error instanceof Error ? error.message : "解析失败",
    });
  }
};

export {};

