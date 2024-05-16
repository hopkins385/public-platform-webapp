import { KeydownEnum } from '../extensions/autocomplete/autocomplete-enums';
import type { ViewEvents } from '../extensions/autocomplete/autocomplete-types';
import type { EditorView } from '@tiptap/pm/view';

export default function useAutocomplete() {
  const insertWordMetaKey = 'insertedWord';

  function getCursorPos(view: EditorView) {
    const { selection } = view.state;
    const { $from } = selection;
    const start = $from.start();
    const end = $from.end();
    return { start, end };
  }

  function keyboardEvent(event: KeyboardEvent): KeydownEnum | null {
    if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
      return KeydownEnum.CtrlArrowRight;
    }
    if (event.key === 'Tab') {
      return KeydownEnum.TAB;
    }
    return null;
    /*switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        return event.key as KeydownEnum;
      case 'Tab':
        return KeydownEnum.tab;
      case 'Enter':
        return KeydownEnum.enter;
      case 'Escape':
        return KeydownEnum.close;
      case 'Ctrl+ArrowRight':
      case 'Cmd+ArrowRight':
      case 'Meta+ArrowRight':
        return KeydownEnum.CtrlArrowRight;
      default:
        return null;
    }*/
  }

  function onKeyDown({ view, event, queryResult }: ViewEvents) {
    const keyPressed = keyboardEvent(event);
    if (!queryResult) return false;
    if (!keyPressed) return false;

    if (keyPressed === KeydownEnum.TAB) {
      event.preventDefault();
      event.stopPropagation();
      view.dispatch(view.state.tr.insertText(queryResult).scrollIntoView());
      return true;
    }

    if (keyPressed === KeydownEnum.CtrlArrowRight) {
      const firstWord = queryResult.trim().split(' ')[0];

      event.preventDefault();
      event.stopPropagation();
      view.dispatch(
        view.state.tr
          .insertText(firstWord)
          .setMeta(insertWordMetaKey, true)
          .scrollIntoView(),
      );
      return true;
    }

    return false;
  }

  return {
    keyboardEvent,
    getCursorPos,
    onKeyDown,
    insertWordMetaKey,
  };
}
