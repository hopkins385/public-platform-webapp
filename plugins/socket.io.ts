import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const {
    public: {
      socket: { host, port },
    },
  } = useRuntimeConfig();

  const url = `${host}:${port}`;

  const socket = io(url, {
    autoConnect: true, // TODO: change this to false
    transports: ['websocket', 'polling'],
    query: {
      auth: '',
    },
  });

  socket.onAny((event, ...args) => {
    console.log('socket event', event, args);
  });

  return {
    provide: {
      socket,
    },
  };
});
