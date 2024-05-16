import type { EditorView, DecorationAttrs } from '@tiptap/pm/view';
import type { AsyncQuery } from './AsyncQuery';

type Range = { start: number; end: number };

export interface SuggestionState {
  active: boolean;
  query: AsyncQuery | null;
  queryResult: string | null;
}

export interface ViewEvents {
  view: EditorView;
  event: KeyboardEvent;
  queryResult: SuggestionState['queryResult'];
}

export interface ChangeType {
  view: EditorView;
  range: Range | null;
  text: string | null;
}

export type Trigger = {
  name: string;
  trigger: string | RegExp;
  cancelOnFirstSpace?: boolean; // Default is true
  allArrowKeys?: boolean; // Default is false
  decorationAttrs?: DecorationAttrs;
};

export interface OpenAutocomplete {
  action: 'add';
  trigger: string;
  filter?: string;
  type: Trigger | null;
}

export interface CloseAutocomplete {
  action: 'remove';
}

export type AutocompleteTrMeta = OpenAutocomplete | CloseAutocomplete;
