export async function rowCompleted(data: any) {
  const { getSocketServer } = useSocketServer();
  const io = getSocketServer();
  const { userId, workflowId } = data;
  const status = 'completed';
  io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
    ...data,
    status,
  });
}
