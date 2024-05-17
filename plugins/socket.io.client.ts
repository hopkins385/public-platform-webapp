import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const {
    socket: { host, port },
  } = useRuntimeConfig().public;

  const url = `${host}:${port}`;

  const socketSrv = io(url, {
    autoConnect: true, // TODO: change this to false
    transports: ['websocket', 'polling'],
    query: {
      auth: '',
    },
  });

  socketSrv.onAny((event, ...args) => {
    console.log('socket event', event, args);
  });

  return {
    provide: {
      socket: socketSrv,
    },
  };
});
