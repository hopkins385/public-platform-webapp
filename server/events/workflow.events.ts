import consola from 'consola';
import socket from '../socket';

const logger = consola.create({}).withTag('row-completed-event');

export async function rowCompletedEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    const status = 'completed';
    socket.io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
      ...data,
      status,
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit row completed event');
  }
}

export async function cellCompletedEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    const status = 'completed';
    socket.io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
      ...data,
      status,
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit cell completed event');
  }
}

export async function cellActiveEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    socket.io.to(`user:${userId}`).emit(`workflow-${workflowId}-update`, {
      ...data,
      status: 'active',
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit cell active event');
  }
}
