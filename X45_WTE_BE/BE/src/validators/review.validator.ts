import { z } from 'zod';

export const upsertReviewSchema = z.object({
  isRecommended: z.boolean(),
  comment: z.string().max(1000).optional().default('')
});
