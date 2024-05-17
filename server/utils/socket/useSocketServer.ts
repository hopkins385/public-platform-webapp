import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import consola from 'consola';

const logger = consola.create({}).withTag('socket-server');

let io: Server;
let engine: Engine;

export function useSocketServer() {
  function createSocketServer() {
    const { port } = useRuntimeConfig().websocket;

    if (!io) {
      try {
        engine = new Engine();
        io = new Server(Number(port), {
          serveClient: false,
          cors: {
            origin: '*',
          },
        });
        io.bind(engine);
      } catch (error) {
        logger.error('Error creating socket server', error);
      }
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
