import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import consola from 'consola';

const logger = consola.create({}).withTag('socket-server');

let io: Server;
let engine: Engine;

export function useSocketServer() {
  function createSocketServer() {
    const { port, origin } = useRuntimeConfig().websocket;
    const serverPort = port ? Number(port) : 3001;
    const serverOrigin = origin || 'http://localhost';

    logger.info(
      'Creating socket server on port and host',
      serverPort,
      serverOrigin,
    );

    if (!io) {
      engine = new Engine();
      io = new Server(serverPort, {
        serveClient: false,
        transports: ['websocket'],
        cors: {
          origin: serverOrigin,
          methods: ['GET', 'POST'],
          credentials: true,
        },
        allowEIO3: true,
      });
      io.bind(engine);
    }
    return io;
  }

  function getSocketServer() {
    return createSocketServer();
  }

  function getEngine() {
    return engine;
  }

  return {
    getSocketServer,
    getEngine,
  };
}
