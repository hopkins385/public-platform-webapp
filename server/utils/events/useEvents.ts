import { eventEmitter } from '.';

export function useEvents() {
  function event(name: string, data: any) {
    eventEmitter.emit(name, data);
  }

  return {
    event,
  };
}
