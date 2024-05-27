import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  // Destructure the socket configuration variables from runtime config
  const {
    socket: { host, port },
  } = useRuntimeConfig().public;

  // Construct the URL for the socket server
  const url = `${host}:${port}`;

  // Get authentication data using a custom hook
  const { data: auth } = useAuth();

  // Initialize the socket.io client
  const socketSrv = io(url, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    // Provide authentication token in the connection options
    auth: (cb) => {
      cb({ token: auth.value?.user.id });
    },
  });

  // Handle socket connection event
  socketSrv.on('connect', () => {
    console.log('Socket connected:', socketSrv.connected);

    // Emit 'join' event if user is authenticated
    if (auth.value?.user.id) {
      socketSrv.emit('join', `user:${auth.value.user.id}`);
    }
  });

  // Handle socket disconnection event
  socketSrv.on('disconnect', () => {
    console.log('Socket disconnected:', socketSrv.connected);
  });

  return {
    provide: {
      socket: socketSrv,
    },
  };
});
