import { z } from 'zod';
import { DishModel } from '../models/dish.model';
import { createDishSchema, updateDishSchema } from '../validators/dish.validator';

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

export const getAllDishes = async (query: { page?: number; limit?: number }) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [dishes, total] = await Promise.all([
    DishModel.find({ isDeleted: false }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    DishModel.countDocuments({ isDeleted: false })
  ]);

  return { dishes, total };
};

export const getDishById = async (id: string) => {
  return DishModel.findOne({ _id: id, isDeleted: false });
};

export const createDish = async (data: CreateDishInput, userId: string) => {
  return DishModel.create({ ...data, createdBy: userId });
};

export const updateDish = async (id: string, data: UpdateDishInput) => {
  return DishModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  );
};

export const softDeleteDish = async (id: string) => {
  return DishModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
};
