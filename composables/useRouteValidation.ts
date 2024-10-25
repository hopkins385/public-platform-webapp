import { z } from 'zod';
import { cuidSchema } from '~/utils/cuid.schema';

export default function useRouteValidation() {
  function hasValidId(params: any) {
    const idSchema = z.object({
      id: cuidSchema,
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  function hasValidChatId(params: any) {
    const res = z
      .object({
        chatId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidProjectId(params: any) {
    const res = z
      .object({
        projectId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidCollectionId(params: any) {
    const res = z
      .object({
        collectionId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidAssistantId(params: any) {
    const res = z
      .object({
        assistantId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidWorkflowId(params: any) {
    const res = z
      .object({
        workflowId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidDocumentId(params: any) {
    const res = z
      .object({
        documentId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidProjectWorkflowId(params: any) {
    const res = z
      .object({
        projectId: cuidSchema,
        workflowId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidProjectDocumentId(params: any) {
    const res = z
      .object({
        projectId: cuidSchema,
        documentId: cuidSchema,
      })
      .safeParse(params);
    return res.success;
  }

  function hasValidPage(params: any) {
    const regexScheme = /^[1-9]\d{0,4}$/;
    const res = z
      .object({
        page: z.string().regex(regexScheme).optional().default('1'),
      })
      .safeParse(params);
    return res.success;
  }

  return {
    hasValidId,
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
