import { getServerSession } from '#auth';
import consola from 'consola';
import { services } from '~/server/service-instances';

const logger = consola.create({}).withTag('api.export.workflow.post');

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const body = await readBody(_event); // TODO: validate body
  const { workflowId } = body;

  if (!workflowId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Workflow ID is required',
    });
  }

  const type = 'xlsx';

  // debounce 500ms
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const buffer = await services.workflowService.export(workflowId, type);
    return buffer;
    //
  } catch (error) {
    logger.error(`Error exporting workflow to ${type}: Error is: ${error}`);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Error exporting workflow',
    });
  }
});
