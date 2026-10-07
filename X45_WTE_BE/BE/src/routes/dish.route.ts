import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  remove,
  searchTheMealDbHandler,
  syncTheMealDb,
  update
} from '../controllers/dish.controller';
import { matchDishes, quickPick, weeklyPlan } from '../controllers/match.controller';
import { authGuard } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createDishSchema, updateDishSchema } from '../validators/dish.validator';
import { matchRequestSchema, weeklyPlanSchema } from '../validators/match.validator';

export const dishRouter = Router();

// Match routes (User/Admin) — must be BEFORE /:id to avoid route conflicts
dishRouter.post('/match', authGuard, validateBody(matchRequestSchema), matchDishes);
dishRouter.post('/quick-pick', authGuard, validateBody(matchRequestSchema), quickPick);
dishRouter.post('/weekly-plan', authGuard, validateBody(weeklyPlanSchema), weeklyPlan);

// TheMealDB routes — must be BEFORE /:id
dishRouter.post('/sync-themealdb', authGuard, requireRole('admin'), syncTheMealDb);
dishRouter.get('/themealdb/search', authGuard, searchTheMealDbHandler);

// CRUD routes (Admin / User read)
dishRouter.get('/', authGuard, getAll);
dishRouter.get('/:id', authGuard, getById);
dishRouter.post('/', authGuard, requireRole('admin'), validateBody(createDishSchema), create);
dishRouter.put('/:id', authGuard, requireRole('admin'), validateBody(updateDishSchema), update);
dishRouter.delete('/:id', authGuard, requireRole('admin'), remove);
