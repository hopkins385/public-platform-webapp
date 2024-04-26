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

  function hasValidProjectId(params: any) {
    const idSchema = z.object({
      projectId: z.string().regex(ulidRegex),
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

  return {
    isValidRouteUlid,
    hasValidProjectId,
    hasValidProjectWorkflowId,
  };
}
