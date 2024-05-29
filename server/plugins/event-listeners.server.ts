import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { eventEmitter } from '~/server/events';
import { consola } from 'consola';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { WorkflowEvent } from '~/server/utils/enums/workflow-event.enum';
import { updateLastLogin } from '~/server/events/login.events';
import { firstUserMessageEvent, chatStreamFinishedEvent } from '~/server/events/chat.events';
import { rowCompleted } from '~/server/events/workflow.events';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { TrackTokensDto } from '../services/dto/track-tokens.dto';
import { trackTokensEvent } from '../events/track-tokens.event';

const logger = consola.create({}).withTag('event-listener');

export default defineNitroPlugin((nitroApp) => {
  // Listen to events
  // Auth
  eventEmitter.on(AuthEvent.LOGIN, updateLastLogin);

  // Chat
  eventEmitter.on(ChatEvent.FIRST_USERMESSAGE, firstUserMessageEvent);
  eventEmitter.on(ChatEvent.STREAMFINISHED, chatStreamFinishedEvent);

  // Workflow
  eventEmitter.on(WorkflowEvent.ROWCOMPLETED, rowCompleted);

  // Usage
  eventEmitter.on(UsageEvent.TRACKTOKENS, async (payload: TrackTokensDto) => {
    // const queue = getOrCreateQueue(QueueEnum.TOKENUSAGE);
    // await queue.add(JobEnum.TRACKTOKENS, payload);
    await trackTokensEvent(payload);
  });

  logger.info('Event listeners loaded');
});
