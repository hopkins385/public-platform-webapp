import type { NitroApp } from 'nitropack';
import consola from 'consola';
import { getServerSession } from '#auth';

const logger = consola.create({}).withTag('socket-server');

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const { getSocketServer, getEngine } = useSocketServer();
  const io = getSocketServer();
  const engine = getEngine();

  // middleware
  // io.use(async (socket, next) => {
  //   const token = socket.handshake.auth.token;
  //   next();
  // });

  io.on('connection', async (socket) => {
    const authToken = socket.handshake.query['auth'] as string;
    const userId = socket.handshake.query['userId'] as string;

    socket.on(SocketEvent.join, (room: string) => {
      // check if roomId is string
      if (typeof room !== 'string') {
        logger.error('room is not a string', room);
        return;
      }
      socket.join(room);
      logger.info(`User ${userId} joined room ${room}`);

      // say hello
      io.to(room.toLowerCase()).emit(
        'new_message',
        'Connected to room ' + room,
      );
      // socket
      //   .to(room.toLowerCase())
      //   .emit('new_message', 'Connected to room ' + room);
    });

    socket.on(SocketEvent.leave, (room) => {
      if (typeof room !== 'string') {
        logger.error('room is not a string', room);
        return;
      }
      socket.leave(room);
      logger.info(`User ${userId} left room ${room}`);
    });

    socket.on('disconnect', () => {
      //
    });
  });

  io.engine.on('connection_error', (err) => {
    logger.error('request', err.req); // the request object
    logger.error('code', err.code); // the error code, for example 1
    logger.error('message', err.message); // the error message, for example "Session ID unknown"
    logger.error('context', err.context); // some additional error context
  });

  nitroApp.router.use(
    '/socket.io/',
    defineEventHandler({
      handler(event) {
        // const session = getServerSession(event); // TODO: add auth
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          const nodeContext = peer.ctx.node;
          const req = nodeContext.req;

          // @ts-expect-error private method
          engine.prepare(req);

          const rawSocket = nodeContext.req.socket;
          const websocket = nodeContext.ws;

          // @ts-expect-error private method
          engine.onWebSocket(req, rawSocket, websocket);
        },
      },
    }),
  );
});
