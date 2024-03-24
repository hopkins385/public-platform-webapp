import { getServerSession } from '#auth';
import { EditorService } from './../../services/editor.service';
import { getAuthUser } from '~/server/utils/auth/permission';
import { getEditorCompletionBody } from '~/server/utils/request/editorCompletionBody';

const config = useRuntimeConfig();
const editorService = new EditorService(config.openai.apiKey);

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
  const user = getAuthUser(session); // do not remove this line
  const body = await getEditorCompletionBody(event);

  const completion = await editorService.fetchCompletion({
    lang: body.lang,
    action: body.action,
    selectedText: body.selectedText,
    fullText: body.fullText,
    prompt: body.prompt,
  });

  return {
    completion,
  };
});
