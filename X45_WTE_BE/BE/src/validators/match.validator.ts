import { z } from 'zod';
import { MEAL_TYPES, DIET_TAGS, ALLERGENS } from '../models/dish.model';

export const matchRequestSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất một nguyên liệu'),
  mealType: z.enum(MEAL_TYPES).optional(),
  dietTags: z.array(z.enum(DIET_TAGS)).optional(),
  allergens: z.array(z.enum(ALLERGENS)).optional()
});

export const weeklyPlanSchema = matchRequestSchema.extend({
  days: z.number().int().min(1).max(30).optional()
});
