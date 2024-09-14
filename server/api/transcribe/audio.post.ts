import type { Options as FormidableOptions, File as FormidableFile } from 'formidable';
import { readFiles } from 'h3-formidable';
import { getServerSession } from '#auth';
import consola from 'consola';
import Groq from 'groq-sdk';
import { createReadStream } from 'fs';
import { basename, extname } from 'path';

const logger = consola.create({}).withTag('api.transcribe');

const options = {
  includeFields: true,
  multiples: false,
  maxFiles: 1,
  maxFilesSize: 5 * 1024 * 1024,
  filter: ({ mimetype }) => {
    return mimetype && mimetype.startsWith('audio/webm');
  },
} as FormidableOptions;

const groq = new Groq({
  apiKey: useRuntimeConfig().groq.apiKey,
});

export default defineEventHandler(async (_event) => {
  // Needs Auth
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // throws error if not authenticated

  const { files } = await readFiles(_event, options);

  if (!files.audioFile || !Array.isArray(files.audioFile) || files.audioFile.length === 0) {
    throw createError({
      statusCode: 406,
      statusMessage: 'Not Acceptable',
      message: 'Audio file missing.',
    });
  }

  const audioFile = files.audioFile[0] as FormidableFile;

  // Ensure the file has a .webm extension
  const fileExtension = extname(audioFile.originalFilename || '').toLowerCase();
  const fileName =
    fileExtension === '.webm' && audioFile.originalFilename && audioFile.originalFilename.endsWith('.webm')
      ? audioFile.originalFilename
      : `${basename(audioFile.originalFilename || 'audio', extname(audioFile.originalFilename || ''))}.webm`;

  const transcript = await getTranscript(audioFile.filepath, fileName);

  return {
    transcript,
  };
});

async function getTranscript(filePath: string, fileName: string): Promise<string | null> {
  if (!filePath || !fileName) {
    logger.error('No audio file provided');
    return null;
  }

  const fileStream = createReadStream(filePath);
  // Attach the filename to the stream
  (fileStream as any).name = fileName;

  try {
    const { text } = await groq.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-large-v3',
    });
    return text.trim() || null;
    //
  } catch (error) {
    logger.error('Failed to transcribe audio file %s', error);
    return null; // Empty audio file
  }
}
