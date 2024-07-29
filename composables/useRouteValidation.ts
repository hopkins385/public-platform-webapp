import { z } from 'zod';

export default function useRouteValidation() {
  const ulidRegex = new RegExp('^[0-9a-z]{26}$');

  function isValidRouteUlid(params: any) {
    // id is a ulid e.g 01hs0wxy2bfts50e3tp4xvdtv5
    const idSchema = z.object({
      id: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidChatId(params: any) {
    const idSchema = z.object({
      chatId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectId(params: any) {
    const idSchema = z.object({
      projectId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidCollectionId(params: any) {
    const idSchema = z.object({
      collectionId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidAssistantId(params: any) {
    const idSchema = z.object({
      assistantId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidWorkflowId(params: any) {
    const idSchema = z.object({
      workflowId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectWorkflowId(params: any) {
    const idSchema = z.object({
      projectId: z.string().regex(ulidRegex),
      workflowId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectDocumentId(params: any) {
    const idSchema = z.object({
      projectId: z.string().regex(ulidRegex),
      documentId: z.string().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidPage(params: any) {
    const regexScheme = /^[1-9]\d*$/;
    const idSchema = z.object({
      page: z.string().regex(regexScheme).optional().default('1'),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  return {
    isValidRouteUlid,
    hasValidChatId,
    hasValidProjectId,
    hasValidAssistantId,
    hasValidWorkflowId,
    hasValidProjectWorkflowId,
    hasValidProjectDocumentId,
    hasValidCollectionId,
    hasValidPage,
  };
}
