import consola from 'consola';
import jwt from 'jsonwebtoken';

const logger = consola.create({}).withTag('socket-server');

function getBaseURL(host: string, port: string): string {
  if (!port || port.length < 1 || port === '') return host;
  return `${host}:${port}`;
}

const socketSingleton = () => {
  const {
    auth: { secret, appId },
    public: {
      socket: { host, port },
    },
  } = useRuntimeConfig();
  const jwtToken = jwt.sign({ appId }, secret);
  const baseURL = getBaseURL(host, port);

  function emitEvent(payload: { room: string; event: string; data: any }): void {
    // logger.info('Emitting event:', payload.event, 'to room:', payload.room);
    $fetch(`/emit/${appId}`, {
      baseURL,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'POST',
      body: payload,
    })
      .then((res) => {})
      .catch((err) => {
        logger.error(err);
        logger.error('Failed to emit event:', payload.event, 'to room:', payload.room);
      });
  }

  return { emitEvent };
};

export type SocketServer = ReturnType<typeof socketSingleton>;

declare const globalThis: {
  socketGlobal: ReturnType<typeof socketSingleton>;
} & typeof global;

const socket = globalThis.socketGlobal ?? socketSingleton();

export default socket;

if (process.env.NODE_ENV !== 'production') globalThis.socketGlobal = socket;
