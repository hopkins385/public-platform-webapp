import type { TrackTokensDto } from '../services/dto/track-tokens.dto';
import { ChatEvent } from '~/server/utils/enums/chat-event.enum';
import { eventEmitter } from '~/server/events';
import { consola } from 'consola';
import { AuthEvent } from '~/server/utils/enums/auth-event.enum';
import { WorkflowEvent } from '~/server/utils/enums/workflow-event.enum';
import { updateLastLogin } from '~/server/events/login.events';
import {
  firstUserMessageEvent,
  chatStreamFinishedEvent,
  chatToolCallStartEvent,
  chatToolCallEndEvent,
} from '~/server/events/chat.events';
import { cellActiveEvent, cellCompletedEvent, rowCompletedEvent } from '~/server/events/workflow.events';
import { UsageEvent } from '../utils/enums/usage-event.enum';
import { trackTokensEvent } from '../events/track-tokens.event';
import { updateCreditsEvent, type IUpdateCreditsEvent } from '../events/usage.events';

const logger = consola.create({}).withTag('event-listener');

function notImplemented() {
  throw new Error('not implemented');
}

export default defineNitroPlugin(() => {
  /**
   * EVENT LISTENERS
   */

  // Auth
  eventEmitter.on(AuthEvent.LOGIN, async (data) => await updateLastLogin(data));

  // Chat
  eventEmitter.on(ChatEvent.FIRST_USERMESSAGE, async (data) => await firstUserMessageEvent(data));
  eventEmitter.on(ChatEvent.STREAM_FINISHED, async (data) => await chatStreamFinishedEvent(data));
  eventEmitter.on(ChatEvent.STREAM_ERROR, () => notImplemented());
  eventEmitter.on(ChatEvent.STREAM_STOP_LENGTH, () => notImplemented());
  eventEmitter.on(ChatEvent.TOOL_START_CALL, (data) => chatToolCallStartEvent(data));
  eventEmitter.on(ChatEvent.TOOL_END_CALL, (data) => chatToolCallEndEvent(data));

  // Workflow
  eventEmitter.on(WorkflowEvent.ROW_COMPLETED, async (data) => await rowCompletedEvent(data));
  eventEmitter.on(WorkflowEvent.CELL_COMPLETED, async (data) => await cellCompletedEvent(data));
  eventEmitter.on(WorkflowEvent.CELL_ACTIVE, async (data) => await cellActiveEvent(data));

  // Usage
  eventEmitter.on(UsageEvent.TRACKTOKENS, async (data: TrackTokensDto) => await trackTokensEvent(data));
  eventEmitter.on(UsageEvent.UPDATE_CREDITS, async (data: IUpdateCreditsEvent) => await updateCreditsEvent(data));

  logger.info('Event listeners loaded');
});
