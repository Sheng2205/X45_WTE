import { Request, Response } from 'express';
import { DishModel } from '../models/dish.model';
import { filterAndRank, weightedRandomPick, generateWeeklyPlan } from '../services/matchScore.service';
import type { MatchInput } from '../services/matchScore.service';

export const matchDishes = async (req: Request, res: Response) => {
  const input = req.body as MatchInput;

  const allDishes = await DishModel.find({ isDeleted: false });
  const results = filterAndRank(allDishes, input);

  return res.json({
    results: results.map((r) => ({
      dish: r.dish,
      matchScore: r.matchScore,
      matchedIngredients: r.matchedIngredients,
      totalIngredients: r.totalIngredients
    }))
  });
};

export const quickPick = async (req: Request, res: Response) => {
  const input = req.body as MatchInput;

  const allDishes = await DishModel.find({ isDeleted: false });
  const scored = filterAndRank(allDishes, input);

  if (scored.length === 0) {
    return res.status(400).json({ message: 'No matching dishes found' });
  }

  const picked = weightedRandomPick(scored);
  if (!picked) {
    return res.status(400).json({ message: 'No matching dishes found' });
  }

  return res.json({
    dish: picked.dish,
    matchScore: picked.matchScore,
    matchedIngredients: picked.matchedIngredients,
    totalIngredients: picked.totalIngredients
  });
};

export const weeklyPlan = async (req: Request, res: Response) => {
  const { ingredients, mealType, dietTags, allergens, days } = req.body as MatchInput & { days?: number };
  const effectiveDays = days && days > 0 ? days : 7;

  const allDishes = await DishModel.find({ isDeleted: false });
  const candidatePool = filterAndRank(allDishes, { ingredients, mealType, dietTags, allergens });

  if (candidatePool.length === 0) {
    return res.status(400).json({ message: 'No matching dishes found for weekly plan' });
  }

  const result = generateWeeklyPlan(candidatePool, effectiveDays);

  return res.json({
    plan: result.plan.map((p) => ({
      day: p.day,
      dish: p.dish,
      matchScore: p.matchScore
    })),
    hasRepeat: result.hasRepeat
  });
};
