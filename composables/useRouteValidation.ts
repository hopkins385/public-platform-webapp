import { z } from 'zod';

export default function useRouteValidation() {
  function isValidRouteUlid(params: any) {
    const idSchema = z.object({
      id: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidChatId(params: any) {
    const idSchema = z.object({
      chatId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectId(params: any) {
    const idSchema = z.object({
      projectId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidCollectionId(params: any) {
    const idSchema = z.object({
      collectionId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidAssistantId(params: any) {
    const idSchema = z.object({
      assistantId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidWorkflowId(params: any) {
    const idSchema = z.object({
      workflowId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidDocumentId(params: any) {
    const idSchema = z.object({
      documentId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectWorkflowId(params: any) {
    const idSchema = z.object({
      projectId: z.string().cuid2(),
      workflowId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidProjectDocumentId(params: any) {
    const idSchema = z.object({
      projectId: z.string().cuid2(),
      documentId: z.string().cuid2(),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidPage(params: any) {
    const regexScheme = /^[1-9]\d{0,4}$/;
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
    hasValidDocumentId,
    hasValidProjectWorkflowId,
    hasValidProjectDocumentId,
    hasValidCollectionId,
    hasValidPage,
  };
}
