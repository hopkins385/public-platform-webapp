import { getIO } from '../socket/socketInstance';

export async function rowCompleted(data: any) {
  const io = getIO();
  const { userId, workflowId } = data;
  const status = 'completed';
  io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
    ...data,
    status,
  });
}
