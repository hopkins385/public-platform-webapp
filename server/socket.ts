import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import consola from 'consola';

const logger = consola.create({}).withTag('socket-server');

const socketSingleton = () => {
  const { port, origin } = useRuntimeConfig().websocket;
  const serverPort = port ? Number(port) : 3001;
  const serverOrigin = origin || 'http://localhost';

  logger.info('Creating new socket server at port %d with origin %s', serverPort, serverOrigin);
  const engine = new Engine();
  const io = new Server(serverPort, {
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
  return { io, engine };
};

export type SocketServer = ReturnType<typeof socketSingleton>;

declare const globalThis: {
  socketGlobal: ReturnType<typeof socketSingleton>;
} & typeof global;

const socket = globalThis.socketGlobal ?? socketSingleton();

export default socket;

if (process.env.NODE_ENV !== 'production') globalThis.socketGlobal = socket;
