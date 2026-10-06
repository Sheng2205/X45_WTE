import { Request, Response } from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../services/favorite.service';

export const getAll = async (req: Request, res: Response) => {
  const favorites = await getFavorites(req.user!.sub);
  return res.json(favorites);
};

export const add = async (req: Request, res: Response) => {
  const { dishId } = req.body as { dishId: string };
  if (!dishId) return res.status(400).json({ message: 'ID món ăn là bắt buộc' });

  const result = await addFavorite(req.user!.sub, dishId);

  if (result.error === 'not_found') {
    return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  }
  if (result.error === 'duplicate') {
    return res.status(409).json({ message: 'Món ăn đã có trong danh sách yêu thích' });
  }

  return res.status(201).json(result.favorite);
};

export const remove = async (req: Request, res: Response) => {
  const favorite = await removeFavorite(req.user!.sub, req.params.dishId);
  if (!favorite) return res.status(404).json({ message: 'Không tìm thấy món trong danh sách yêu thích' });
  return res.json({ success: true });
};
