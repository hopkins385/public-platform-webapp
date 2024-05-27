export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;
  const { $socket } = useNuxtApp();
  const { data: auth } = useAuth();
  if ($socket.connected || !auth.value?.user.id) {
    return;
  }
  $socket.connect();
});
