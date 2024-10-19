import { services } from '~/server/service-instances';
import { EditorService } from './../../services/editor.service';
import { getEditorCompletionBody } from '~/server/utils/request/editorCompletionBody';

const config = useRuntimeConfig();
const editorService = new EditorService(config.openai.apiKey);

export default defineEventHandler(async (_event) => {
  // Needs Auth
  const user = await services.authService.getAuthUser(_event);

  const body = await getEditorCompletionBody(_event);

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
