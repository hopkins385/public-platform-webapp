import type { Editor } from '@tiptap/vue-3';

export function getSelectedText(editor: Editor) {
  if (!editor) return '';
  const { from, to } = editor.state.selection;
  // get the text for the current selection
  return editor.state.doc.textBetween(from, to) || '';
}

export function getCursorPosition(editor: Editor) {
  if (!editor) return 0;
  return editor.state.selection.$anchor.pos;
}

export async function getCompletionText(text: string) {
  // simulate async call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const data = 'completion';
  return data;
}

interface CursorPosAndText {
  cursorPosition: number;
  selectedText: string;
}

export function getCursorPosAndText(editor: Editor) {
  if (!editor) return {} as CursorPosAndText;
  const { from, to } = editor.state.selection;
  const cursorPosition = editor.state.selection.$anchor.pos;
  const selectedText = editor.state.doc.textBetween(from, to) || '';
  return { cursorPosition, selectedText } as CursorPosAndText;
}

/*
  const insertFullText = () => {
    // insert auotcomplete text at cursor position inside of proseMirror
    console.log('insertFullText: ', props.suggestionText);
    if (!props.suggestionText) return;
    // 0. get length of autocomplete text
    const suggestionTextLength = props.suggestionText.length;
    if (suggestionTextLength === 0) return;

    // 1. get cursor position
    const cursorPosition = editor?.state.selection.$anchor.pos;

    // 2. insert text at cursor position
    editor?.chain().insertContentAt(cursorPosition, props.suggestionText).run();
    // 3. set cursor position to end of inserted text
    editor?.commands.setTextSelection(cursorPosition + suggestionTextLength);
  };
  */
