import { z } from 'zod';

export default function useRouteValidation() {
  function isValidRouteUlid(params: any) {
    // id is a ulid e.g 01hs0wxy2bfts50e3tp4xvdtv5
    const ulidRegex = new RegExp('^[0-7][0-9a-hjkmnp-tv-z]{24}');
    const idSchema = z.object({
      id: z.string().min(26).max(26).toLowerCase().regex(ulidRegex),
    });
    const res = idSchema.safeParse(params);
    return res.success;
  }

  return {
    isValidRouteUlid,
  };
}
