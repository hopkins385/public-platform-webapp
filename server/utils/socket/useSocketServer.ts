import { Server } from 'socket.io';
import { SocketEvent } from '~/server/utils/socket/socketEnum';
import { consola } from 'consola';

let count = 0;
let io: Server | null = null;

const logger = consola.create({}).withTag('socket-io');

export function useSocketServer() {
  function createServer() {
    if (!io) {
      logger.info('Creating socket server');
      const {
        public: {
          socket: { port },
        },
      } = useRuntimeConfig();

      io = new Server(Number(port), {
        serveClient: false,
        cors: {
          origin: '*',
        },
      });

      // middleware
      // io.use(async (socket, next) => {
      //   const token = socket.handshake.auth.token;
      //   const { data } = await getServerSession(_event);
      //   next();
      // });

      io.on('connection', (socket) => {
        logger.info('socket connected');

        socket.on(SocketEvent.join, (roomId) => {
          logger.info(`socket join ${roomId}`);
          socket.join(roomId);
        });

        socket.on(SocketEvent.up, (data: { value: number; room: string }) => {
          count = count + data.value;
          io?.to(data.room).emit(SocketEvent.new_count, count);
        });

        socket.on(SocketEvent.down, (data: { value: number; room: string }) => {
          count = count - data.value;
          io?.to(data.room).emit(SocketEvent.new_count, count);
        });

        socket.on('disconnect', () => {
          logger.info('socket disconnected');
        });
      });
    }

    return io;
  }

  function getServer() {
    return createServer();
  }

  return {
    getServer,
  };
}
