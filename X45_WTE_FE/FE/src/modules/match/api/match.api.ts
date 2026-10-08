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
  cookTime?: number;
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
  searchIngredients: (search: string) =>
    http.get<Ingredient[]>(`/ingredients?search=${encodeURIComponent(search)}`),

  getAllIngredients: () =>
    http.get<Ingredient[]>('/ingredients'),

  match: (data: MatchRequest) =>
    http.post<{ results: ScoredDish[] }>('/dishes/match', data),

  getMatchDishes: async (payload: MatchRequest) => {
    const res = await http.post<{ results: ScoredDish[] }>('/dishes/match', payload);
    return res.data;
  },

  quickPick: (data: MatchRequest) =>
    http.post<ScoredDish>('/dishes/quick-pick', data),

  getQuickPick: async (payload: MatchRequest) => {
    const res = await http.post<ScoredDish>('/dishes/quick-pick', payload);
    return res.data;
  },

  weeklyPlan: (data: WeeklyPlanRequest) =>
    http.post<{ plan: { day: number; dish: ScoredDish['dish']; matchScore: number }[]; hasRepeat: boolean }>(
      '/dishes/weekly-plan',
      data
    ),

  getWeeklyPlan: async (payload: WeeklyPlanRequest = { days: 7, ingredients: [] }) => {
    const res = await http.post<{ plan: { day: number; dish: ScoredDish['dish']; matchScore: number }[]; hasRepeat: boolean }>(
      '/dishes/weekly-plan',
      payload
    );
    return res.data;
  },

  getDishes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    mealType?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.mealType) query.append('mealType', params.mealType);
    const qs = query.toString();
    const res = await http.get<{ dishes: Dish[]; total: number }>(`/dishes${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  getDish: (id: string) =>
    http.get<Dish>(`/dishes/${id}`),

  getReviews: (dishId: string) =>
    http.get<DishReviewsResponse>(`/reviews/${dishId}`),

  submitReview: (dishId: string, data: { isRecommended: boolean; comment?: string }) =>
    http.post<{ success: boolean; review: DishReview }>(`/reviews/${dishId}`, data),

  deleteReview: (reviewId: string) =>
    http.delete<{ success: boolean }>(`/reviews/${reviewId}`),
};

export interface DishReview {
  _id: string;
  dishId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isRecommended: boolean;
  comment?: string;
  createdAt: string;
}

export interface DishReviewsResponse {
  total: number;
  recommendedCount: number;
  percentage: number;
  userReview: DishReview | null;
  reviews: DishReview[];
}

export const dishService = matchApi;

