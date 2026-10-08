import { Router } from 'express';
import { getDishReviews, upsertDishReview } from '../controllers/review.controller';
import { authGuard } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { upsertReviewSchema } from '../validators/review.validator';

export const reviewRouter = Router();

reviewRouter.get('/:dishId', authGuard, getDishReviews);
reviewRouter.post('/:dishId', authGuard, validateBody(upsertReviewSchema), upsertDishReview);
