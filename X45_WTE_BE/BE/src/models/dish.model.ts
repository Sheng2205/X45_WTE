import mongoose, { Schema } from 'mongoose';

export const MEAL_TYPES = ['an_sang', 'an_trua', 'an_toi', 'do_uong', 'an_vat', 'mon_nhau'] as const;
export const DIET_TAGS = ['chay', 'man', 'keto', 'low_carb', 'eat_clean'] as const;
export const ALLERGENS = ['dau_phong', 'hai_san', 'trung', 'sua', 'gluten', 'dau_nanh'] as const;

export interface DishIngredient {
  ingredientId: mongoose.Types.ObjectId;
  name: string;
  quantity?: string;
}

export interface DishDocument extends mongoose.Document {
  name: string;
  description?: string;
  instructions?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  mealDbId?: string;
  area?: string;
  category?: string;
  mealType: string;
  dietTags: string[];
  allergens: string[];
  ingredients: DishIngredient[];
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const dishIngredientSchema = new Schema<DishIngredient>(
  {
    ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
    name: { type: String },
    quantity: { type: String }
  },
  { _id: false }
);

const dishSchema = new Schema<DishDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    instructions: { type: String },
    imageUrl: { type: String },
    youtubeUrl: { type: String },
    mealDbId: { type: String },
    area: { type: String },
    category: { type: String },
    mealType: { type: String, required: true, enum: MEAL_TYPES },
    dietTags: [{ type: String, enum: DIET_TAGS }],
    allergens: [{ type: String, enum: ALLERGENS }],
    ingredients: [dishIngredientSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

dishSchema.index({ 'ingredients.ingredientId': 1 });
dishSchema.index({ mealType: 1, dietTags: 1 });

export const DishModel = mongoose.model<DishDocument>('Dish', dishSchema);
