import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const {
    socket: { host, port },
  } = useRuntimeConfig().public;

  const url = port && port.length > 0 ? `${host}:${port}` : host;

  const { data: auth } = useAuth();

  const socketSrv = io(url, {
    autoConnect: true,
    transports: ['websocket'],
    auth: async (cb) => {
      try {
        const data = await $fetch('/api/socket/user-auth', { method: 'POST' });
        cb({ token: data?.token ?? '' });
      } catch (error) {
        cb({ token: '' });
      }
    },
  });

  // Register listeners for socket events
  socketSrv.on('connect', () => {
    console.log('Socket connected:', socketSrv.connected);

    // Emit 'join' event if user is authenticated
    if (auth.value?.user.id) {
      socketSrv.emit('join', `user:${auth.value.user.id}`);
    }
  });

  socketSrv.onAny((event, ...args) => {
    console.log('Socket event:', event, args);
  });

  // Handle socket disconnection event
  socketSrv.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return {
    provide: {
      socket: socketSrv,
    },
  };
});
