import { createSharedComposable } from '@vueuse/core';

export const useWebsocketGlobal = createSharedComposable(useWebsocket);
