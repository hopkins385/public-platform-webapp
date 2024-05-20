export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;
  const { $socket } = useNuxtApp();
  const { data: auth } = useAuth();
  if ($socket.connected || !auth.value?.user.id) {
    return;
  }
  $socket.connect();
  console.log('socket connected');
  //
  console.log('joining user channel');
  $socket.emit('join', `user:${auth.value.user.id}`);
});
