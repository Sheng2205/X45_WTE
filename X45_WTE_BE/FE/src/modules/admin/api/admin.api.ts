import { http } from '@/shared/api/http';

export interface Ingredient {
  _id: string;
  name: string;
  createdAt: string;
}

export interface DishIngredient {
  ingredientId: string;
  name: string;
  quantity?: string;
}

export interface Dish {
  _id: string;
  name: string;
  description?: string;
  instructions?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  mealDbId?: string;
  area?: string;
  category?: string;
  mealType: string;
  dietTags: string[];
  allergens: string[];
  ingredients: DishIngredient[];
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
}

export const adminApi = {
  // Ingredients
  getIngredients: (search?: string) => http.get<Ingredient[]>(`/ingredients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createIngredient: (name: string) => http.post<Ingredient>('/ingredients', { name }),
  updateIngredient: (id: string, name: string) => http.put<Ingredient>(`/ingredients/${id}`, { name }),
  deleteIngredient: (id: string) => http.delete(`/ingredients/${id}`),
  // Dishes
  getDishes: (page = 1, limit = 20) => http.get<{ dishes: Dish[]; total: number }>(`/dishes?page=${page}&limit=${limit}`),
  getDish: (id: string) => http.get<Dish>(`/dishes/${id}`),
  createDish: (data: Omit<Dish, '_id' | 'createdBy' | 'isDeleted' | 'createdAt'>) => http.post<Dish>('/dishes', data),
  updateDish: (id: string, data: Partial<Omit<Dish, '_id' | 'createdBy' | 'isDeleted' | 'createdAt'>>) => http.put<Dish>(`/dishes/${id}`, data),
  deleteDish: (id: string) => http.delete(`/dishes/${id}`),
  syncTheMealDb: () => http.post<{ success: boolean; message: string; data: any }>('/dishes/sync-themealdb'),
};
