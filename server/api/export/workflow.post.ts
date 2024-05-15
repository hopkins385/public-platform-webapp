import { WorkflowService } from '../../services/workflow.service';
import { getServerSession } from '#auth';
import consola from 'consola';
import { sendStream } from 'h3';
import { Readable } from 'stream';

const logger = consola.create({}).withTag('conversation.post');

const workflowService = new WorkflowService();

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const body = await readBody(_event);
  const { workflowId } = body;

  if (!workflowId) {
    throw createError({
      statusCode: 400,
      message: 'Workflow ID is required',
    });
  }

  // wait 500ms
  await new Promise((resolve) => setTimeout(resolve, 500));

  const buffer = await workflowService.export(workflowId, 'xlsx');

  /*const stream = new Readable();
  stream.push(buffer);

  const file = `workflow-${workflowId}.xlsx`;
  _event.node.res.setHeader(
    'Content-Disposition',
    `attachment; filename="${file}"`,
  );
  _event.node.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  _event.node.res.setHeader('Content-Length', buffer.length);
  _event.node.res.write(buffer);
  _event.node.res.end();
  //
  // return sendStream(_event, stream);
  */

  return buffer;
});
