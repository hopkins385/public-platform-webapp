import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/core';

export const aiPluginKey = new PluginKey('ai-extension');

interface AiActionOptions {
  action: string;
  prompt?: string;
}

interface CompletionHandlerOptions {
  lang: string;
  action: string;
  prompt?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      aiAction: (aiActionOptions: AiActionOptions) => ReturnType;
    };
  }
  interface EditorOptions {
    lang: string | null;
    completionHandler: (
      editor: Editor,
      options: CompletionHandlerOptions,
    ) => void;
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
        key: aiPluginKey,
      }),
    ];
  },
  addCommands() {
    return {
      aiAction:
        (aiActionOptions: AiActionOptions) =>
        ({ editor }) => {
          const { lang, completionHandler } = this.options;
          const handlerOptions = {
            lang,
            action: aiActionOptions.action,
            prompt: aiActionOptions.prompt,
          };
          completionHandler(editor, handlerOptions);
          return true;
        },
    };
  },
});
