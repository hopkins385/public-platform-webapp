import { LastLoginDto } from '../services/dto/last-login.dto';
import { UserService } from '../services/user.service';
import { eventEmitter } from '../utils/events';
import { consola } from 'consola';

const logger = consola.create({}).withTag('events');

export default defineNitroPlugin((nitroApp) => {
  const { getSocketServer } = useSocketServer();
  const io = getSocketServer();

  // listen for events
  eventEmitter.on('message', (msg) => {
    console.log('received message', msg);
  });

  eventEmitter.on('login', async (user) => {
    const { getClient } = usePrisma();
    const prisma = getClient();
    const userService = new UserService(prisma);
    const payload = LastLoginDto.fromRequest({
      email: user.email,
      lastLoginAt: new Date(),
    });
    await userService.updateLastLogin(payload);
    logger.info('user logged in', user);
  });

  eventEmitter.on('RowCompleted', async (data) => {
    const { workflowId } = data;
    io.to(`room_${workflowId}`).emit('new_message', data);
    logger.info('RowCompleted', data);
  });
});
