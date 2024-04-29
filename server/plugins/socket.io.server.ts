export default defineNitroPlugin((nitroApp) => {
  const socket = useSocketServer();
  return socket.getServer();
});
