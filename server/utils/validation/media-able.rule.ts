import { z } from 'zod';
import { MediaAbleTypeEnum } from '../enums/media-able-enum';
export const mediaAbleRule = () =>
  z.object({
    id: cuidRule(),
    type: z.nativeEnum(MediaAbleTypeEnum),
  });
