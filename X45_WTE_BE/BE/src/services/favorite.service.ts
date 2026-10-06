import { FavoriteModel } from '../models/favorite.model';
import { DishModel } from '../models/dish.model';

export const getFavorites = async (userId: string) => {
  const favorites = await FavoriteModel.find({ userId })
    .populate({
      path: 'dishId',
      match: { isDeleted: false }
    })
    .sort({ createdAt: -1 });

  // Filter out favorites where dish was soft-deleted (populate returns null)
  return favorites.filter((f) => f.dishId !== null);
};

export const addFavorite = async (userId: string, dishId: string) => {
  // Verify dish exists and is not deleted
  const dish = await DishModel.findOne({ _id: dishId, isDeleted: false });
  if (!dish) return { error: 'not_found' as const };

  try {
    const favorite = await FavoriteModel.create({ userId, dishId });
    return { favorite };
  } catch (error: any) {
    // Duplicate key error (unique index on userId + dishId)
    if (error.code === 11000) return { error: 'duplicate' as const };
    throw error;
  }
};

export const removeFavorite = async (userId: string, dishId: string) => {
  return FavoriteModel.findOneAndDelete({ userId, dishId });
};
