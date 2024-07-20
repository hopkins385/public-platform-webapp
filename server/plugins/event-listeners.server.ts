import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { eventEmitter } from '~/server/events';
import { consola } from 'consola';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { WorkflowEvent } from '~/server/utils/enums/workflow-event.enum';
import { updateLastLogin } from '~/server/events/login.events';
import { firstUserMessageEvent, chatStreamFinishedEvent } from '~/server/events/chat.events';
import { cellActiveEvent, cellCompletedEvent, rowCompletedEvent } from '~/server/events/workflow.events';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { TrackTokensDto } from '../services/dto/track-tokens.dto';
import { trackTokensEvent } from '../events/track-tokens.event';

const logger = consola.create({}).withTag('event-listener');

export default defineNitroPlugin((nitroApp) => {
  // Listen to events
  // Auth
  eventEmitter.on(AuthEvent.LOGIN, async (data) => await updateLastLogin(data));

  // Chat
  eventEmitter.on(ChatEvent.FIRST_USERMESSAGE, async (data) => await firstUserMessageEvent(data));
  eventEmitter.on(ChatEvent.STREAMFINISHED, async (data) => await chatStreamFinishedEvent(data));

  // Workflow
  eventEmitter.on(WorkflowEvent.ROW_COMPLETED, async (data) => await rowCompletedEvent(data));
  eventEmitter.on(WorkflowEvent.CELL_COMPLETED, async (data) => await cellCompletedEvent(data));
  eventEmitter.on(WorkflowEvent.CELL_ACTIVE, async (data) => await cellActiveEvent(data));

  // Usage
  eventEmitter.on(UsageEvent.TRACKTOKENS, async (data: TrackTokensDto) => await trackTokensEvent(data));

  logger.info('Event listeners loaded');
});
