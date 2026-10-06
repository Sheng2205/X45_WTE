import { http } from '@/shared/api/http';

export interface MatchRequest {
  ingredients: string[];
  mealType?: string;
  dietTags?: string[];
  allergens?: string[];
}

export interface WeeklyPlanRequest extends MatchRequest {
  days?: number;
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
  ingredients: { ingredientId: string; name: string; quantity?: string }[];
}

export interface ScoredDish {
  dish: Dish;
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
}

export interface Ingredient {
  _id: string;
  name: string;
}

export const matchApi = {
  searchIngredients: (search: string) => http.get<Ingredient[]>(`/ingredients?search=${encodeURIComponent(search)}`),
  getAllIngredients: () => http.get<Ingredient[]>('/ingredients'),
  match: (data: MatchRequest) => http.post<{ results: ScoredDish[] }>('/dishes/match', data),
  quickPick: (data: MatchRequest) => http.post<ScoredDish>('/dishes/quick-pick', data),
  weeklyPlan: (data: WeeklyPlanRequest) => http.post<{ plan: { day: number; dish: ScoredDish['dish']; matchScore: number }[]; hasRepeat: boolean }>('/dishes/weekly-plan', data),
  getDish: (id: string) => http.get<Dish>(`/dishes/${id}`),
};
