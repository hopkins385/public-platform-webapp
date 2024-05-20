import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const {
    socket: { host, port },
  } = useRuntimeConfig().public;

  const url = `${host}:${port}`;

  const { data: auth } = useAuth();

  const socketSrv = io(url, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: (cb) => {
      cb({ token: auth.value?.user.id });
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
