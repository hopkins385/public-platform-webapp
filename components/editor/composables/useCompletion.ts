import type { Editor } from '@tiptap/vue-3';
import {
  getCompletionText,
  getCursorPosAndText,
} from './../utils/editor-utils';

export default function useCompletion() {
  const isLoading = ref(false);
  const onOneClick = (editor: Editor) => {
    if (!editor) return;
    const { selectedText } = getCursorPosAndText(editor);

    isLoading.value = true;

    getCompletionText(selectedText)
      .then((completionText) => {
        const { from, to } = editor.state.selection;
        const tr = editor.state.tr.insertText(completionText, from, to);
        editor.view.dispatch(tr);
        editor.commands.focus();
      })
      .catch((err) => {
        console.log('err: ', err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  return {
    isLoading,
    onOneClick,
  };
}
