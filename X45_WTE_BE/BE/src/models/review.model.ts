import mongoose, { Schema } from 'mongoose';

export interface ReviewDocument extends mongoose.Document {
  dishId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  isRecommended: boolean;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    dishId: { type: Schema.Types.ObjectId, ref: 'Dish', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    isRecommended: { type: Boolean, required: true, default: true },
    comment: { type: String, maxlength: 1000, default: '' }
  },
  { timestamps: true }
);

reviewSchema.index({ dishId: 1, userId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema, 'Review');
