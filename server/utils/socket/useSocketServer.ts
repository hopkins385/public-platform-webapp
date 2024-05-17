import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import consola from 'consola';

let io: Server;
let engine: Engine;

export function useSocketServer() {
  function createSocketServer() {
    const { port } = useRuntimeConfig().websocket;

    if (!io) {
      engine = new Engine();
      io = new Server(Number(port), {
        serveClient: false,
        cors: {
          origin: '*',
        },
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
