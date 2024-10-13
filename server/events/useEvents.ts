import { eventEmitter } from '.';

type EventData = any;

export interface UseEvents {
  event: (name: string, data: EventData) => boolean;
}

export function useEvents(): UseEvents {
  function event(name: string, data: EventData): boolean {
    return eventEmitter.emit(name, data);
  }

  return {
    event,
  };
}
