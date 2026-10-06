import mongoose, { Schema } from 'mongoose';

export interface IngredientDocument extends mongoose.Document {
  name: string;
}

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true }
  },
  { timestamps: true }
);

export const IngredientModel = mongoose.model<IngredientDocument>('Ingredient', ingredientSchema);
