import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { eventEmitter } from '~/server/utils/events';
import { consola } from 'consola';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { WorkflowEvent } from '~/server/utils/enums/workflow-event.enum';
import { updateLastLogin } from '~/server/utils/events/login.events';
import { chatStreamFinished } from '~/server/utils/events/chat.events';
import { rowCompleted } from '~/server/utils/events/workflow.events';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { TrackTokensDto } from '../services/dto/track-tokens.dto';
import { trackTokens } from '~/server/utils/track-tokens';

const logger = consola.create({}).withTag('event-listener');

export default defineNitroPlugin((nitroApp) => {
  // Listen to events
  // Auth
  eventEmitter.on(AuthEvent.LOGIN, updateLastLogin);

  // Chat
  eventEmitter.on(ChatEvent.STREAMFINISHED, chatStreamFinished);

  // Workflow
  eventEmitter.on(WorkflowEvent.ROWCOMPLETED, rowCompleted);

  // Usage
  eventEmitter.on(UsageEvent.TRACKTOKENS, async (payload: TrackTokensDto) => {
    // const queue = getOrCreateQueue(QueueEnum.TOKENUSAGE);
    // await queue.add(JobEnum.TRACKTOKENS, payload);
    await trackTokens(payload);
  });
});
