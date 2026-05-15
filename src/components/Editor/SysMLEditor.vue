<template>
  <div class="editor panel-section">
    <div class="editor__header">
      <span class="panel-title">SysML Editor</span>
      <span class="editor__meta">{{ lineCount }} 行</span>
    </div>

    <Codemirror
      v-model="modelStore.sourceText"
      :extensions="extensions"
      :style="{ height: '100%' }"
      @ready="onReady"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { linter } from "@codemirror/lint";
import {
  HighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
  type StreamParser,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useModelStore } from "@/stores/model.store";
import { useUiStore } from "@/stores/ui.store";
import { sysmlSnippets } from "@/constants/snippets";

const modelStore = useModelStore();
const uiStore = useUiStore();

let editorView: EditorView | null = null;

const sysmlKeywords = new Set([
  "package",
  "part",
  "def",
  "requirement",
  "interface",
  "attribute",
  "operation",
  "port",
  "connect",
  "to",
  "satisfy",
  "binding",
  "specializes",
  "state",
  "action",
]);

const sysmlParser: StreamParser<null> = {
  startState: () => null,
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return "string";
    if (stream.match(/\b\d+(?:\.\d+)?\b/)) return "number";
    if (stream.match(/[:{}()[\];,.]/)) return "punctuation";
    if (stream.match(/:>>|:>|::|->|=>|=/)) return "operator";
    if (stream.match(/[A-Za-z_]\w*/)) {
      const current = stream.current();
      if (sysmlKeywords.has(current)) return "keyword";
      if (/^[A-Z]/.test(current)) return "typeName";
      return "variableName";
    }
    stream.next();
    return null;
  },
};

const sysmlLanguage = StreamLanguage.define(sysmlParser);

const sysmlHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#005fb8", fontWeight: "700" },
  { tag: tags.comment, color: "#7b8798", fontStyle: "italic" },
  { tag: tags.string, color: "#b35a00" },
  { tag: tags.number, color: "#8a3ffc" },
  { tag: tags.typeName, color: "#0f766e", fontWeight: "600" },
  { tag: tags.variableName, color: "#243447" },
  { tag: tags.operator, color: "#c42b1c" },
  { tag: tags.punctuation, color: "#5f6f82" },
]);

const extensions = [
  EditorView.theme({
    "&": {
      height: "100%",
      color: "var(--text-primary)",
      backgroundColor: "transparent",
    },
    ".cm-content": {
      fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
      fontSize: "13px",
      caretColor: "var(--brand)",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--brand)" },
    ".cm-gutters": {
      backgroundColor: "var(--bg-surface-soft)",
      color: "var(--text-muted)",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(0, 120, 212, 0.05)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(0, 120, 212, 0.08)",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(0, 120, 212, 0.18)",
    },
  }),
  sysmlLanguage,
  syntaxHighlighting(sysmlHighlightStyle),
  autocompletion({
    override: [
      (context) => {
        const token = context.matchBefore(/\w*/);
        if (!token || (token.from === token.to && !context.explicit)) return null;
        return {
          from: token.from,
          options: sysmlSnippets.map((snippet) => ({
            label: snippet.title,
            detail: snippet.description,
            type: "keyword",
            apply: snippet.body,
          })),
        };
      },
    ],
  }),
  linter(() =>
    modelStore.diagnostics.map((item) => ({
      from: item.offset,
      to: item.offset + Math.max(item.length, 1),
      severity: item.severity,
      message: item.message,
    })),
  ),
];

const lineCount = computed(() => modelStore.sourceText.split("\n").length);

watch(
  () => uiStore.snippetToken,
  () => {
    if (!editorView || !uiStore.pendingSnippet) return;
    const selection = editorView.state.selection.main;
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: uiStore.pendingSnippet,
      },
      selection: {
        anchor: selection.from + uiStore.pendingSnippet.length,
      },
    });
    uiStore.consumeSnippet();
    editorView.focus();
  },
);

function onReady(payload: { view: EditorView }) {
  editorView = payload.view;
}
</script>

<style scoped>
.editor {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 10px;
}

.editor__meta {
  color: var(--text-secondary);
  font-size: 12px;
}

.editor :deep(.cm-editor) {
  flex: 1;
  min-height: 0;
}

.editor :deep(.cm-scroller) {
  overflow: auto;
}
</style>
