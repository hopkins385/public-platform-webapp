import type { Editor } from '@tiptap/vue-3';
import { getSelectionText } from './../utils/editor-utils';
import useTurndown from '~/composables/useTurndown';
import useEditorCompletion from '~/composables/useEditorCompletion';

export default function useRunCompletion() {
  const { toMarkdown } = useTurndown();
  const { getEditorCompletion, isLoading } = useEditorCompletion();

  const runCompletion = (editor: Editor, action: string, lang: string) => {
    if (!editor) return;
    const { selectedText, pos } = getSelectionText(editor);

    const markdown = toMarkdown(editor.getHTML());

    const payload = {
      lang,
      action,
      selectedText,
      fullText: markdown,
      prompt: '',
    };

    getEditorCompletion(payload)
      .then((res) => {
        const tr = editor.state.tr.insertText(
          res?.completion || '',
          pos.from,
          pos.to,
        );
        editor.view.dispatch(tr);
        editor.commands.focus();
      })
      .catch((err) => {
        console.log('err: ', err);
      })
      .finally(() => {
        //
      });
  };

  return {
    isLoading,
    runCompletion,
  };
}
