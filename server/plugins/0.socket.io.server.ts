import type { NitroApp } from 'nitropack';
import { defineEventHandler } from 'h3';
import consola from 'consola';

const logger = consola.create({}).withTag('socket-server');

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const { getSocketServer, getEngine } = useSocketServer();
  const engine = getEngine();
  const io = getSocketServer();

  // middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    // TODO: socket authentication
    // const userId = socket.handshake.query['userId'];
    // if (!userId) {
    //   socket.disconnect();
    //   logger.info('User not authenticated');
    //   return;
    // }
    next();
  });

  io.on('connection', async (socket) => {
    const authToken = socket.handshake.query['auth'] as string;
    const userId = socket.handshake.query['userId'] as string;

    socket.on(SocketEvent.join, (input) => {
      // check if roomId is string
      if (typeof input?.roomId !== 'string') {
        logger.error('roomId is not a string', input?.roomId);
        return;
      }
      const room = `room_${input.roomId}`;
      socket.join(room);

      // say hello
      io.to(room).emit('new_message', 'Connected.');

      socket.on(SocketEvent.leave, (roomId) => {
        const rid = 'room_' + roomId;
        socket.leave(rid);
      });
    });

    socket.on('disconnect', () => {
      //
    });
  });

  // TODO: is this even required? Seems to be dead/unused code
  nitroApp.router.use(
    '/socket.io/',
    defineEventHandler({
      handler(event) {
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
