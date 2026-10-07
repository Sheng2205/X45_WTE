import { http } from '@/shared/api/http';
import { matchApi } from '@/modules/match/api/match.api';
import type { MatchRequest, WeeklyPlanRequest, Dish } from '@/modules/match/api/match.api';

export const dishService = {
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
    const res = await http.get<{ dishes: Dish[]; total: number }>(
      `/dishes${qs ? `?${qs}` : ''}`
    );
    return res.data;
  },

  getMatchDishes: async (payload: MatchRequest) => {
    const res = await matchApi.match(payload);
    return res.data;
  },

  getQuickPick: async (payload: MatchRequest) => {
    const res = await matchApi.quickPick(payload);
    return res.data;
  },

  getWeeklyPlan: async (payload: WeeklyPlanRequest = { days: 7, ingredients: [] }) => {
    const res = await matchApi.weeklyPlan(payload);
    return res.data;
  },

  getDish: async (id: string) => {
    const res = await matchApi.getDish(id);
    return res.data;
  }
};
