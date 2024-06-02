import consola from 'consola';
import { getIO } from '../socket/socketInstance';

const logger = consola.create({}).withTag('row-completed-event');

export async function rowCompletedEvent(data: any) {
  try {
    const io = getIO(); // get the socket instance
    const { userId, workflowId } = data;
    const status = 'completed';
    io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
      ...data,
      status,
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit row completed event');
  }
}
