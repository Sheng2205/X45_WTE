import { DishDocument } from '../models/dish.model';

// ── Configurable weights (BR-2) ──────────────────────────────────────
const W1 = 0.7; // ingredient match weight
const W2 = 0.3; // soft criteria match weight

// ── Normalize helper: lowercase + strip Vietnamese diacritics ────────
// e.g. "Trứng gà" → "trung ga", "Cà chua" → "ca chua"
export const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .replace(/đ/gi, 'd')             // đ/Đ not decomposed by NFD
    .trim();

// ── Types ────────────────────────────────────────────────────────────
export interface MatchInput {
  ingredients: string[];   // array of ingredientId strings the user has
  mealType?: string;
  dietTags?: string[];
  allergens?: string[];
}

export interface ScoredDish {
  dish: DishDocument;
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
}

export interface WeeklyPlanDay {
  day: number;
  dish: DishDocument;
  matchScore: number;
}

export interface WeeklyPlanResult {
  plan: WeeklyPlanDay[];
  hasRepeat: boolean;
}

// ── BR-1: Hard-exclude dishes containing allergens ───────────────────
export const excludeAllergenDishes = (
  dishes: DishDocument[],
  allergens: string[]
): DishDocument[] => {
  if (!allergens || allergens.length === 0) return dishes;

  const allergenSet = new Set(allergens);
  return dishes.filter((dish) => {
    const dishAllergens = dish.allergens || [];
    return !dishAllergens.some((a) => allergenSet.has(a));
  });
};

// ── Partial-match helper: checks if any user token is a substring of
// the dish ingredient name OR the dish ingredient name is a substring
// of any user token (handles "Cà chua" ↔ "Cà chua chín mọng",
// "Nấm hương" ↔ "Nấm hương (Nấm đông cô)", etc.)
const partialMatch = (dishIngName: string, userSet: Set<string>): boolean => {
  const normDish = normalize(dishIngName);
  for (const userToken of userSet) {
    if (normDish === userToken) return true;          // exact
    if (normDish.includes(userToken)) return true;   // "Cà chua chín mọng" contains "ca chua"
    if (userToken.includes(normDish)) return true;   // "ca chua" contains shorter dish name
  }
  return false;
};

// ── BR-2: Calculate Match Score for a single dish ────────────────────
export const calculateMatchScore = (
  dish: DishDocument,
  userIngredientIds: string[],
  mealType?: string,
  dietTags?: string[]
): ScoredDish => {
  const userIngredientSet = new Set(
    userIngredientIds.map((item) => normalize(String(item)))
  );

  // Ingredient ratio
  const dishIngredients = dish.ingredients || [];
  const totalIngredients = dishIngredients.length;
  const matchedIngredients = dishIngredients.filter((ing) => {
    // 1. Exact ObjectId match (when FE sends real _id)
    const idMatch = ing.ingredientId && userIngredientSet.has(normalize(String(ing.ingredientId)));
    // 2. Exact or partial name match (handles verbose DB names vs short user input)
    const nameMatch = ing.name && partialMatch(ing.name, userIngredientSet);
    return Boolean(idMatch || nameMatch);
  }).length;

  const ingredientRatio = totalIngredients > 0 ? matchedIngredients / totalIngredients : 0;

  // Soft criteria ratio (mealType + dietTags)
  let criteriaMatched = 0;
  let criteriaTotal = 0;

  if (mealType) {
    criteriaTotal++;
    if (dish.mealType === mealType) criteriaMatched++;
  }

  if (dietTags && dietTags.length > 0) {
    criteriaTotal += dietTags.length;
    const dishDietTags = new Set(dish.dietTags || []);
    criteriaMatched += dietTags.filter((t) => dishDietTags.has(t)).length;
  }

  const criteriaRatio = criteriaTotal > 0 ? criteriaMatched / criteriaTotal : 0;

  // Final score
  const matchScore = W1 * ingredientRatio + W2 * criteriaRatio;

  return {
    dish,
    matchScore: Math.round(matchScore * 1000) / 1000,
    matchedIngredients,
    totalIngredients
  };
};

// ── Filter + Rank: combines BR-1 and BR-2 ────────────────────────────
export const filterAndRank = (
  allDishes: DishDocument[],
  input: MatchInput
): ScoredDish[] => {
  // Step 1: Hard-exclude allergens (BR-1)
  const safeDishes = excludeAllergenDishes(allDishes, input.allergens || []);

  // Step 2: Calculate match score for each dish (BR-2)
  const scored = safeDishes.map((dish) =>
    calculateMatchScore(dish, input.ingredients, input.mealType, input.dietTags)
  );

  // Step 3: Filter out dishes with zero matched ingredients
  const filtered = scored.filter((s) => s.matchedIngredients > 0);

  // Step 4: Sort descending by match score
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return filtered;
};

// ── BR-3: Weighted random pick ───────────────────────────────────────
export const weightedRandomPick = (scoredDishes: ScoredDish[]): ScoredDish | null => {
  if (scoredDishes.length === 0) return null;

  const totalWeight = scoredDishes.reduce((sum, s) => sum + s.matchScore, 0);
  if (totalWeight === 0) {
    return scoredDishes[Math.floor(Math.random() * scoredDishes.length)];
  }

  let random = Math.random() * totalWeight;
  for (const scored of scoredDishes) {
    random -= scored.matchScore;
    if (random <= 0) return scored;
  }

  return scoredDishes[scoredDishes.length - 1];
};

// ── BR-6 to BR-9: Generate Weekly Meal Plan ──────────────────────────
export const generateWeeklyPlan = (
  candidatePool: ScoredDish[],
  days: number = 7
): WeeklyPlanResult => {
  const usedDishIds: string[] = [];
  const plan: WeeklyPlanDay[] = [];
  let hasRepeat = false;

  for (let day = 1; day <= days; day++) {
    let availablePool = candidatePool.filter(
      (s) => !usedDishIds.includes(String(s.dish._id))
    );

    if (availablePool.length === 0) {
      availablePool = candidatePool;
      hasRepeat = true;
    }

    const picked = weightedRandomPick(availablePool);
    if (!picked) break;

    usedDishIds.push(String(picked.dish._id));
    plan.push({
      day,
      dish: picked.dish,
      matchScore: picked.matchScore
    });
  }

  return { plan, hasRepeat };
};
