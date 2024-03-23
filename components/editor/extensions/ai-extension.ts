import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/core';

export const pluginKey = new PluginKey('ai-extension');

let controller: AbortController | null = null;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      aiAction: (action: string) => ReturnType;
    };
  }
  interface EditorOptions {
    lang: string | null;
    completionHandler: (editor: Editor, action: string, lang: string) => void;
  }
}

export const AI = Extension.create({
  name: 'ai',
  addOptions() {
    return {
      lang: null,
      completionHandler: () => {},
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
      }),
    ];
  },
  addCommands() {
    return {
      aiAction:
        (action: string) =>
        ({ editor }) => {
          const { lang, completionHandler } = this.options;
          completionHandler(editor, action, lang);
          return true;
        },
    };
  },
});
