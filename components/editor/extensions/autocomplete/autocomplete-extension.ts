import {
  Plugin,
  PluginKey,
  TextSelection,
  Transaction,
} from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, Extension } from '@tiptap/vue-3';
import { AsyncQuery } from './AsyncQuery';
import useAutocomplete from '../../composables/useAutocomplete';
import type { SuggestionState } from '../autocomplete/autocomplete-types';

interface CompletionHandlerOptions {
  lang: string;
  action: string;
  prompt?: string;
}
declare module '@tiptap/core' {
  interface EditorOptions {
    lang: string | null;
    autoCompletionHandler: (signal: AbortSignal, payload: any) => void;
  }
}

const { onKeyDown, insertWordMetaKey } = useAutocomplete();

const pluginKey = new PluginKey('autocomplete-suggestion');

let controller: AbortController | null = null;

function createDecorationSet(transaction: Transaction, suggestionText: string) {
  const selection = transaction.selection;
  const cursorPos = selection.$head.pos;
  const nextNode = transaction.doc.nodeAt(cursorPos);
  const textContentLength = selection.$head.parent.textContent.length;
  let decorationSet = DecorationSet.empty;

  if (!(selection instanceof TextSelection) || textContentLength < 5) {
    return decorationSet;
  }

  // This will add the widget decoration at the cursor position
  if (!nextNode || nextNode.isBlock) {
    const decorationWidget = Decoration.widget(
      cursorPos,
      () => {
        const spanNode = document.createElement('span');
        const content = '<span>$1</span>';
        let textContent = suggestionText;

        textContent = textContent.replace(/\[(.*?)\]/g, content);
        spanNode.innerHTML = textContent;
        spanNode.classList.add('autocomplete-suggestion');
        spanNode.setAttribute('data-decoration-id', 'autocomplete-decoration');

        return spanNode;
      },
      { side: 1 },
    );

    decorationSet = decorationSet.add(transaction.doc, [decorationWidget]);
  }
  return decorationSet;
}

function initState() {
  return {
    active: false,
    query: AsyncQuery.empty(),
    queryResult: null,
  } as SuggestionState;
}

export const AIAutocomplete = Extension.create({
  name: 'AutocompleteExtension',
  addOptions() {
    return {
      lang: null,
      autoCompletionHandler: () => {},
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return initState();
          },
          apply: (tr, prev) => {
            const { query: prevQuery } = prev;
            const { lang, autoCompletionHandler } = this.options;

            if (prevQuery !== null) {
              if (prevQuery.statusChanged(tr, 'success')) {
                return {
                  ...prev,
                  queryResult: prevQuery.data!,
                };
              }
              if (controller) {
                controller.abort();
                prevQuery.cancel();
              }
            }

            const next = { ...prev };

            // get the text content of the current node
            const textContent = tr.doc.textContent;
            const isWordPlusSpace = textContent.match(/\w\s$/);
            const wordCount = textContent.split(' ').length;

            // reset
            next.active = false;
            next.query = null;

            if (tr.docChanged && isWordPlusSpace && wordCount > 3) {
              controller = new AbortController();
              const signal = controller.signal;

              const newQuery = new AsyncQuery({
                query: async () => {
                  // return 'hello world';
                  return await autoCompletionHandler(signal, {
                    input: textContent,
                    context: '',
                  });
                },
                metaKey: pluginKey,
              });

              next.query = newQuery;
              next.active = true;
            }

            return next;
          },
        },
        props: {
          // Call the keydown hook if suggestion is active.
          handleKeyDown(view, event) {
            const { active, range, queryResult } = pluginKey.getState(
              view.state,
            );

            if (!active) {
              return false;
            }

            return onKeyDown({ view, event, queryResult });
          },
          decorations(editorState) {
            const { active, query } = pluginKey.getState(
              editorState,
            ) as SuggestionState;

            if (!active) {
              return DecorationSet.empty;
            }

            if (query?.data) {
              return createDecorationSet(editorState.tr, query?.data);
            }

            return DecorationSet.empty;
          },
        },
        view: (editor) => {
          return {
            update(editor, oldState) {
              const next = pluginKey.getState(editor.state);
              const prev = pluginKey.getState(oldState);
              const { query, queryResult } = next ?? {};

              // run the query update step
              query?.viewUpdate(editor, {
                ignoreCanceled: true,
                ignoreLoading: true,
                ignoreSuccess: false, // only update view on success
                ignoreError: true,
              });

              // do something when the query data is loaded
              // if (queryResult && queryResult !== prev?.queryResult) {
              //   console.log('query data loaded: ', queryResult);
              // }
            },
            destroy() {
              // console.log('view destroy');
              // run the query destroy step
              pluginKey.getState(editor.state)?.query?.viewDestroy();
            },
          };
        },
        appendTransaction: (transactions, oldState, newState) => {
          const { queryResult } = pluginKey.getState(
            oldState,
          ) as SuggestionState;

          // Check if a word was inserted
          const wordInserted = transactions.some((tr) =>
            tr.getMeta(insertWordMetaKey),
          );

          if (wordInserted) {
            // 1. remove word from the queryResult
            const queryResultWithoutWord = queryResult?.replace(/\w+/, '');
            // 2. set new queryResult

            // 3. remove the meta key
            return newState.tr.setMeta(insertWordMetaKey, false);
          }

          return null;
        },
      }),
    ];
  },
});
