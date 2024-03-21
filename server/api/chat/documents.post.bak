import { Readable, Transform } from 'stream';
import { sendStream } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (_event) => {
  const { chat } = useEmbedDocuments();
  const session = await getServerSession(_event);
  const body = await readBody(_event);

  if (!session?.user || !session.user.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    });
  }

  const res = await chat(body.messages, _event.context.vectorStore, true);

  if (!res) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    });
  }

  const stream = Readable.from(res);
  const bufferStream = new Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      callback(null, chunk.response);
    },
  });
  stream.pipe(bufferStream);

  stream.on('error', (error) => {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: `Internal server error ${error}`,
    });
  });

  stream.on('end', () => {
    console.log('stream finished');
  });

  _event.node.res.on('close', () => {
    console.log('response closed');
    stream.destroy();
  });

  return sendStream(_event, bufferStream);
});
