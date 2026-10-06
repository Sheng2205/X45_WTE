import { Router } from 'express';
import { create, getAll, remove, update } from '../controllers/ingredient.controller';
import { authGuard } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createIngredientSchema, updateIngredientSchema } from '../validators/ingredient.validator';

export const ingredientRouter = Router();

ingredientRouter.get('/', authGuard, getAll);
ingredientRouter.post('/', authGuard, requireRole('admin'), validateBody(createIngredientSchema), create);
ingredientRouter.put('/:id', authGuard, requireRole('admin'), validateBody(updateIngredientSchema), update);
ingredientRouter.delete('/:id', authGuard, requireRole('admin'), remove);
