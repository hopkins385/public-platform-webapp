import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import consola from 'consola';

const logger = consola.create({}).withTag('socket-server');

let io: Server;
let engine: Engine;

export function init(serverPort: number, serverOrigin: string) {
  logger.info(
    'Creating new socket server at port %d with origin %s',
    serverPort,
    serverOrigin,
  );
  engine = new Engine();
  io = new Server(serverPort, {
    serveClient: false,
    transports: ['websocket'],
    cors: {
      origin: serverOrigin,
      methods: ['GET'],
      // credentials: true,
    },
    // allowEIO3: true,
  });
  io.bind(engine);
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export function getEngine() {
  if (!engine) {
    throw new Error('Socket.io not initialized!');
  }
  return engine;
}

/*declare const globalThis: {
  io: ReturnType<typeof clientSingleton>;
} & typeof global;

const io = globalThis.io ?? clientSingleton();

export default io;

if (process.env.NODE_ENV !== 'production') globalThis.io = io;
*/
