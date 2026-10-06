import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1, 'Tên nguyên liệu là bắt buộc').max(100)
});

export const updateIngredientSchema = createIngredientSchema;
