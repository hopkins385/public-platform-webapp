export default function useWebsocket() {
  const { $socket } = useNuxtApp();

  function emit(event: string, data: any) {
    // client side only
    if (process.server) return;
    $socket.emit(event, data);
  }

  function on(event: string, callback: (data: any) => void) {
    // client side only
    if (process.server) return;
    $socket.on(event, callback);
  }

  return {
    emit,
    on,
  };
}
