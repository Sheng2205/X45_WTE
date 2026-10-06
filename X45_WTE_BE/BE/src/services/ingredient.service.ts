import { IngredientModel } from '../models/ingredient.model';

export const getAllIngredients = async (search?: string) => {
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  return IngredientModel.find(query).sort({ name: 1 });
};

export const createIngredient = async (name: string) => {
  const existing = await IngredientModel.findOne({ name: name.toLowerCase().trim() });
  if (existing) return null;
  return IngredientModel.create({ name });
};

export const updateIngredient = async (id: string, name: string) => {
  const existing = await IngredientModel.findOne({
    name: name.toLowerCase().trim(),
    _id: { $ne: id }
  });
  if (existing) return null;
  return IngredientModel.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
};

export const deleteIngredient = async (id: string) => {
  return IngredientModel.findByIdAndDelete(id);
};
