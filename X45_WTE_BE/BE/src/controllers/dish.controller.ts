import { Request, Response } from 'express';
import {
  createDish,
  getAllDishes,
  getDishById,
  softDeleteDish,
  updateDish
} from '../services/dish.service';
import type { CreateDishInput, UpdateDishInput } from '../services/dish.service';

export const getAll = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await getAllDishes({ page, limit });
  return res.json(result);
};

export const getById = async (req: Request, res: Response) => {
  const dish = await getDishById(req.params.id);
  if (!dish) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  return res.json(dish);
};

export const create = async (req: Request, res: Response) => {
  const data = req.body as CreateDishInput;
  const dish = await createDish(data, req.user!.sub);
  return res.status(201).json(dish);
};

export const update = async (req: Request, res: Response) => {
  const data = req.body as UpdateDishInput;
  const dish = await updateDish(req.params.id, data);
  if (!dish) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  return res.json(dish);
};

export const remove = async (req: Request, res: Response) => {
  const dish = await softDeleteDish(req.params.id);
  if (!dish) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  return res.json({ success: true });
};

export const syncTheMealDb = async (req: Request, res: Response) => {
  try {
    const { theMealDbService } = await import('../services/themealdb.service');
    const result = await theMealDbService.syncVietnameseMeals(req.user?.sub);
    return res.json({
      success: true,
      message: `Đồng bộ TheMealDB thành công: ${result.dishesUpserted} món ăn, ${result.ingredientsUpserted} nguyên liệu mới`,
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi đồng bộ TheMealDB'
    });
  }
};

export const searchTheMealDbHandler = async (req: Request, res: Response) => {
  try {
    const term = (req.query.s as string) || '';
    const { theMealDbService } = await import('../services/themealdb.service');
    const meals = await theMealDbService.searchMeals(term);
    return res.json({ meals });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Lỗi tìm kiếm TheMealDB'
    });
  }
};
