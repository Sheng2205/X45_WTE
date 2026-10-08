import { Request, Response } from 'express';
import {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  updateIngredient
} from '../services/ingredient.service';

export const getAll = async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const ingredients = await getAllIngredients(search);
  return res.json(ingredients);
};

export const create = async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const ingredient = await createIngredient(name);
  if (!ingredient) return res.status(409).json({ message: 'Nguyên liệu đã tồn tại' });
  return res.status(201).json(ingredient);
};

export const update = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body as { name: string };
  const ingredient = await updateIngredient(id, name);
  if (!ingredient) return res.status(404).json({ message: 'Không tìm thấy nguyên liệu hoặc tên bị trùng lặp' });
  return res.json(ingredient);
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const ingredient = await deleteIngredient(id);
  if (!ingredient) return res.status(404).json({ message: 'Không tìm thấy nguyên liệu' });
  return res.json({ success: true });
};
