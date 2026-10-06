import mongoose, { Schema } from 'mongoose';

export interface FavoriteDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  dishId: mongoose.Types.ObjectId;
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dishId: { type: Schema.Types.ObjectId, ref: 'Dish', required: true }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, dishId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<FavoriteDocument>('Favorite', favoriteSchema);
