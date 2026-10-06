import { Router } from 'express';
import { add, getAll, remove } from '../controllers/favorite.controller';
import { authGuard } from '../middlewares/auth.middleware';

export const favoriteRouter = Router();

favoriteRouter.get('/', authGuard, getAll);
favoriteRouter.post('/', authGuard, add);
favoriteRouter.delete('/:dishId', authGuard, remove);
