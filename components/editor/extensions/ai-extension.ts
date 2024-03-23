import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/vue-3';
import useRunCompletion from '../composables/useRunCompletion';

export const pluginKey = new PluginKey('ai-extension');

let controller: AbortController | null = null;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      aiAction: (action: string) => ReturnType;
    };
  }
}

const { runCompletion } = useRunCompletion();

export const AI = Extension.create({
  name: 'ai',
  addOptions() {
    return {
      lang: null,
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
        ({ tr, editor }) => {
          const { lang } = this.options;
          runCompletion(editor, action, lang);
          return true;
        },
    };
  },
});
