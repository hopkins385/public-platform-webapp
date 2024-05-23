import consola from 'consola';
import type { TrackTokensDto } from '~/server/services/dto/track-tokens.dto';
import { getIO } from '../socket/socketInstance';

const logger = consola.create({}).withTag('track-tokens.worker');

export async function trackTokensEvent(payload: TrackTokensDto) {
  const prisma = usePrisma().getClient();
  const io = getIO();
  const { userId, llm, usage } = payload;

  const inputPrice1KTokens = 0.001;
  const outputPrice1KTokens = 0.003;
  const inputPricePerToken = inputPrice1KTokens / 1000;
  const outputPricePerToken = outputPrice1KTokens / 1000;
  const input_cost = usage.promptTokens * inputPricePerToken;
  const output_cost = usage.completionTokens * outputPricePerToken;

  function toInt(x: string | number, precision: number = 6): number {
    const float = +Number.parseFloat(x.toString()).toFixed(precision);
    const num = float * Math.pow(10, precision);
    return Math.round(num);
  }

  logger.info('Tracking tokens usage for user %s', userId);

  try {
    await prisma.tokenUsage.create({
      data: {
        id: ULID(),
        userId: userId.toLowerCase(),
        llmProvider: llm.provider.toString(),
        llmModel: llm.model.toString(),
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        cost: toInt(input_cost + output_cost),
      },
    });
  } catch (error) {
    logger.error('Error saving usage data: %o', error);
  }

  const room = `user:${userId}`;
  io.to(room).emit('usage', {
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
  });
}
