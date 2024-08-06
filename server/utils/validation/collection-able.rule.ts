import { z } from 'zod';
import { CollectionAbleTypeEnum } from '~/server/utils/enums/collection-able-enum';
export const collectionAbleRule = () =>
  z.object({
    id: cuidRule(),
    type: z.nativeEnum(CollectionAbleTypeEnum),
  });
