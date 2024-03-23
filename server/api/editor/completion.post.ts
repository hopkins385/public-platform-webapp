import { EditorService } from './../../services/editor.service';
import { getAuthUser } from '~/server/utils/auth/permission';
import { getEditorCompletionBody } from '~/server/utils/request/editorCompletionRequest';

const config = useRuntimeConfig();
const editorService = new EditorService(config.openai.apiKey);

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  const body = await getEditorCompletionBody(event);

  const completion = await editorService.fetchCompletion({
    lang: body.lang,
    action: body.action,
    prompt: body.prompt,
  });

  return {
    completion,
  };
});
