import { matchApi } from '@/modules/match/api/match.api';
import type { MatchRequest, WeeklyPlanRequest } from '@/modules/match/api/match.api';

export const dishService = {
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
