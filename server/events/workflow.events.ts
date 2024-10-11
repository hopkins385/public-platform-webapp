import consola from 'consola';
import socket from '~/server/socket';

const logger = consola.create({}).withTag('row-completed-event');

export async function rowCompletedEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    socket.emitEvent({
      room: `user:${userId}`,
      event: `workflow-${workflowId}-update`,
      data: {
        ...data,
        status: 'completed',
      },
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit row completed event');
  }
}

export async function cellCompletedEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    socket.emitEvent({
      room: `user:${userId}`,
      event: `workflow-${workflowId}-update`,
      data: {
        ...data,
        status: 'completed',
      },
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit cell completed event');
  }
}

export async function cellActiveEvent(data: any) {
  try {
    const { userId, workflowId } = data;
    socket.emitEvent({
      room: `user:${userId}`,
      event: `workflow-${workflowId}-update`,
      data: {
        ...data,
        status: 'active',
      },
    });
  } catch (e) {
    logger.error(e);
    throw new Error('Failed to emit cell active event');
  }
}
