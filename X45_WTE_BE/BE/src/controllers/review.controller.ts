import { Request, Response } from 'express';
import { ReviewModel } from '../models/review.model';
import { UserModel } from '../models/user.model';

export const getDishReviews = async (req: Request, res: Response) => {
  const dishId = req.params.dishId as string;
  const reviews = await ReviewModel.find({ dishId }).sort({ createdAt: -1 });

  const total = reviews.length;
  const recommendedCount = reviews.filter((r) => r.isRecommended).length;
  const percentage = total > 0 ? Math.round((recommendedCount / total) * 100) : 100;

  const currentUserId = req.user?.sub;
  const userReview = currentUserId
    ? reviews.find((r) => String(r.userId) === String(currentUserId))
    : null;

  return res.json({
    total,
    recommendedCount,
    percentage,
    userReview,
    reviews
  });
};

export const upsertDishReview = async (req: Request, res: Response) => {
  const dishId = req.params.dishId as string;
  const userId = req.user!.sub;
  const { isRecommended, comment } = req.body;

  const user = await UserModel.findById(userId);
  const userName =
    user?.displayName || user?.email?.split('@')[0] || 'Thành viên Bếp Nhà';
  const userAvatar = user?.avatarUrl || '';

  const review = await ReviewModel.findOneAndUpdate(
    { dishId, userId },
    {
      dishId,
      userId,
      userName,
      userAvatar,
      isRecommended: Boolean(isRecommended),
      comment: typeof comment === 'string' ? comment.trim() : ''
    },
    { upsert: true, returnDocument: 'after' }
  );

  return res.json({ success: true, review });
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId as string;
  const review = await ReviewModel.findById(reviewId);

  if (!review) {
    return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
  }

  const isAuthor = String(review.userId) === String(req.user?.sub);
  const isAdmin = req.user?.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
  }

  await ReviewModel.findByIdAndDelete(reviewId);
  return res.json({ success: true, message: 'Đã xóa đánh giá thành công' });
};
