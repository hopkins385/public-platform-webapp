export async function rowCompleted(data: any) {
  const { getSocketServer } = useSocketServer();
  const io = getSocketServer();
  const { workflowId } = data;
  io.to(`room_${workflowId}`).emit('new_message', data);
}
