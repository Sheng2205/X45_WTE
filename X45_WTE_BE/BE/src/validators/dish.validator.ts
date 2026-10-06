import { z } from 'zod';
import { MEAL_TYPES, DIET_TAGS, ALLERGENS } from '../models/dish.model';

const dishIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'ID nguyên liệu là bắt buộc'),
  name: z.string().min(1, 'Tên nguyên liệu là bắt buộc'),
  quantity: z.string().optional()
});

export const createDishSchema = z.object({
  name: z.string().trim().min(1, 'Tên món ăn là bắt buộc').max(200),
  description: z.string().max(2000).optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  mealDbId: z.string().optional(),
  area: z.string().optional(),
  category: z.string().optional(),
  mealType: z.enum(MEAL_TYPES),
  dietTags: z.array(z.enum(DIET_TAGS)).default([]),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
  ingredients: z.array(dishIngredientSchema).min(1, 'Món ăn phải có ít nhất 1 nguyên liệu')
});

export const updateDishSchema = createDishSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Cần cung cấp ít nhất một trường dữ liệu để cập nhật' }
);
