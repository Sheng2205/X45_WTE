import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, PlaySquare, ExternalLink, ChefHat, Globe, ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import { matchApi } from '../api/match.api';
import type { Dish, DishReviewsResponse } from '../api/match.api';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { getDishImageUrl } from '@/shared/lib/dishImages';

const MEAL_LABELS: Record<string, string> = {
  an_sang: 'Bữa sáng',
  an_trua: 'Bữa trưa',
  an_toi: 'Bữa tối',
  an_vat: 'Ăn vặt',
  do_uong: 'Đồ uống',
  mon_nhau: 'Món nhậu',
};

const DIET_LABELS: Record<string, string> = {
  chay: 'Ăn chay',
  man: 'Món mặn',
  keto: 'Keto',
  low_carb: 'Low Carb',
  eat_clean: 'Eat Clean',
};

const ALLERGEN_LABELS: Record<string, string> = {
  dau_phong: 'Đậu phộng',
  hai_san: 'Hải sản',
  trung: 'Trứng',
  sua: 'Sữa',
  gluten: 'Gluten',
  dau_nanh: 'Đậu nành',
};

const AREA_LABELS: Record<string, string> = {
  Vietnamese: 'Việt Nam',
  Chinese: 'Trung Hoa',
  Japanese: 'Nhật Bản',
  Thai: 'Thái Lan',
  Korean: 'Hàn Quốc',
  French: 'Pháp',
  Italian: 'Ý',
  American: 'Mỹ',
  Mexican: 'Mexico',
  Indian: 'Ấn Độ',
  British: 'Anh',
};

const CATEGORY_LABELS: Record<string, string> = {
  Beef: 'Món Bò',
  Chicken: 'Món Gà',
  Pork: 'Món Heo',
  Seafood: 'Hải Sản',
  Vegetarian: 'Món Chay',
  Vegan: 'Thuần Chay',
  Pasta: 'Mì & Bún',
  Dessert: 'Tráng Miệng',
  Side: 'Món Phụ',
  Starter: 'Khai Vị',
  Breakfast: 'Bữa Sáng',
  Lamb: 'Món Cừu',
  Miscellaneous: 'Món Khác',
};

export function DishDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [reviewsData, setReviewsData] = useState<DishReviewsResponse | null>(null);
  const [myVote, setMyVote] = useState<boolean>(true);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadReviews = (dishId: string) => {
    matchApi.getReviews(dishId)
      .then((res) => {
        setReviewsData(res.data);
        if (res.data?.userReview) {
          setMyVote(res.data.userReview.isRecommended);
          setMyComment(res.data.userReview.comment || '');
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      matchApi.getDish(id)
        .then((res) => setDish(res.data))
        .catch(() => toast.error('Không tìm thấy thông tin món ăn'))
        .finally(() => setLoading(false));

      loadReviews(id);

      favoritesApi.getAll()
        .then((res) => {
          const isFav = (res.data as any[]).some(
            (f) => (f.dish?._id || f.dishId?._id || f.dishId) === id
          );
          setIsFavorite(isFav);
        })
        .catch(() => {});
    }
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dish) return;
    setSubmittingReview(true);
    try {
      await matchApi.submitReview(dish._id, {
        isRecommended: myVote,
        comment: myComment.trim(),
      });
      toast.success('Cảm ơn bạn đã để lại đánh giá!');
      loadReviews(dish._id);
      setShowReviewForm(false);
    } catch {
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFavorite = async () => {
    if (!dish) return;
    try {
      if (isFavorite) {
        await favoritesApi.remove(dish._id);
        setIsFavorite(false);
        toast.success('Đã bỏ lưu món');
      } else {
        await favoritesApi.add(dish._id);
        setIsFavorite(true);
        toast.success('Đã lưu vào danh sách món yêu thích!');
      }
    } catch (e: any) {
      toast.error('Có lỗi xảy ra khi lưu món');
    }
  };

  const toggleCheck = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Món ăn không tồn tại hoặc đã bị xóa
        </h2>
        <Button onClick={() => navigate('/match')} className="rounded-full">
          Quay lại tìm món
        </Button>
      </div>
    );
  }

  const imageUrl = dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);

  // Parse step-by-step cooking instructions
  const instructionSteps = dish.instructions
    ? dish.instructions
        .split(/(?:\r?\n\s*\r?\n)|(?:^|\r?\n)(?=step\s*\d+)/i)
        .map((s) => s.replace(/^step\s*\d+[:.\s]*/i, '').trim())
        .filter((s) => s.length > 0)
    : [];

  return (
    <div className="space-y-8 pb-16 w-full">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span> Quay lại trang trước
        </button>
      </div>

      {/* Main Recipe Card with Real Photographic Banner */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        {/* Large Culinary Photo Banner - Generous height & delectable focus */}
        <div className="relative aspect-[16/9] min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] w-full overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

          {/* Floating Category Pills on Photo */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-bold text-neutral-800 shadow-sm">
                {MEAL_LABELS[dish.mealType] || dish.mealType}
              </span>

              {dish.area && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-medium text-white border border-white/20">
                  <Globe className="size-3.5" />
                  {AREA_LABELS[dish.area] || dish.area}
                </span>
              )}

              {dish.category && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-medium text-white border border-white/20">
                  {CATEGORY_LABELS[dish.category] || dish.category}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              className={`rounded-full backdrop-blur-md text-xs sm:text-sm font-semibold px-5 py-2.5 h-10 transition-all shadow-sm flex items-center gap-2 ${
                isFavorite
                  ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                  : 'bg-white/90 text-neutral-800 border-white hover:bg-white'
              }`}
            >
              <Heart className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Đã lưu sổ tay' : 'Lưu món này'}</span>
            </Button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              {dish.name}
            </h1>
          </div>
        </div>

        {/* Recipe Info Body */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Diet Pills */}
          {dish.dietTags && dish.dietTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dish.dietTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 text-xs sm:text-sm font-semibold"
                >
                  {DIET_LABELS[tag] || tag}
                </span>
              ))}
            </div>
          )}

          {/* Editorial Description */}
          <div className="rounded-2xl bg-muted/40 border border-border/60 p-5 text-sm sm:text-base text-foreground/90 leading-relaxed italic">
            "{dish.description || 'Món ăn gia đình thơm ngon, giàu dinh dưỡng, rất thích hợp để đổi vị cho bữa cơm sum họp.'}"
          </div>

          {/* Allergen Warning Box if present */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-2">
              <div className="text-xs sm:text-sm font-bold text-destructive tracking-wide">
                Lưu ý chất gây dị ứng trong món này:
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {dish.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-xs sm:text-sm font-semibold"
                  >
                    {ALLERGEN_LABELS[allergen] || allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients Checklist */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Danh Sách Nguyên Liệu ({dish.ingredients?.length || 0})
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tích chọn để kiểm tra nguyên liệu bạn đã chuẩn bị đủ chưa
            </p>
          </div>

          <span className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full self-start sm:self-auto">
            Đã có {checkedIngredients.length}/{dish.ingredients?.length || 0} nguyên liệu
          </span>
        </div>

        <ul className="divide-y divide-border/50">
          {dish.ingredients?.map((ing, idx) => {
            const isChecked = checkedIngredients.includes(ing.name);
            return (
              <li
                key={idx}
                onClick={() => toggleCheck(ing.name)}
                className="py-3.5 px-3 flex items-center justify-between cursor-pointer rounded-xl hover:bg-muted/40 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center text-xs font-bold transition-colors ${
                      isChecked
                        ? 'border-primary bg-primary text-white'
                        : 'border-border/80 bg-background text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <span
                    className={`text-base ${
                      isChecked
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground font-semibold'
                    }`}
                  >
                    {ing.name}
                  </span>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
                  {ing.quantity || 'Tùy khẩu vị'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Step-by-Step Cooking Instructions (From TheMealDB) */}
      {instructionSteps.length > 0 && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3.5 border-b border-border/60 pb-4">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ChefHat className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Hướng Dẫn Nấu Ăn Từng Bước
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Công thức chi tiết từng công đoạn chế biến
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {instructionSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 sm:gap-5 rounded-2xl bg-muted/30 border border-border/50 p-5 transition-all hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-white shadow-xs">
                  {idx + 1}
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Bước {idx + 1}
                  </span>
                  <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Video Tutorial Link if available */}
      {dish.youtubeUrl && (
        <div className="rounded-3xl border border-rose-200/60 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/20 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 shrink-0">
              <PlaySquare className="size-7" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                Video Hướng Dẫn Nấu Ăn
              </h3>
              <p className="text-sm text-muted-foreground">
                Xem đầu bếp thực hiện từng bước trên YouTube
              </p>
            </div>
          </div>

          <a
            href={dish.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-6 py-3 transition-colors shadow-sm self-stretch sm:self-auto justify-center"
          >
            <span>Mở Video YouTube</span>
            <ExternalLink className="size-4" />
          </a>
        </div>
      )}

      {/* Community Reviews & Recommendation Section */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Đánh Giá & Nhận Xét
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Cảm nhận và mẹo nấu từ cộng đồng thành viên Bếp Nhà
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-full">
              <ThumbsUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {reviewsData?.total ? `${reviewsData.percentage}% khuyên nên thử` : '100% đánh giá tích cực'}
              </span>
              <span className="text-xs text-muted-foreground">({reviewsData?.total ?? 0})</span>
            </div>

            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="rounded-full bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold h-9 px-4 cursor-pointer"
            >
              {reviewsData?.userReview ? 'Sửa đánh giá của bạn' : '+ Viết nhận xét'}
            </Button>
          </div>
        </div>

        {/* User Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="rounded-2xl bg-muted/40 border border-border/80 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bạn có thích hoặc muốn đề xuất món này không?
              </span>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMyVote(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                    myVote
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-card text-foreground border-border/80 hover:border-emerald-500'
                  }`}
                >
                  <ThumbsUp className="size-4" />
                  <span>Khuyên nên nấu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMyVote(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                    !myVote
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-card text-foreground border-border/80 hover:border-rose-500'
                  }`}
                >
                  <ThumbsDown className="size-4" />
                  <span>Chưa hợp vị</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chia sẻ cảm nhận hoặc mẹo nhỏ khi nấu (tùy chọn)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder="Ví dụ: Món này ăn kèm dưa leo rất ngon, nên bớt cay nếu nhà có trẻ nhỏ..."
                className="w-full rounded-xl border border-border/80 bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                className="rounded-xl text-xs font-medium cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={submittingReview}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold gap-1.5 cursor-pointer"
              >
                {submittingReview ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {reviewsData?.userReview ? 'Cập nhật đánh giá' : 'Đăng đánh giá'}
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col gap-2.5 transition hover:border-border"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      {rev.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground">
                        {rev.userName}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-2">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      rev.isRecommended
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {rev.isRecommended ? (
                      <>
                        <ThumbsUp className="size-3" /> Khuyên dùng
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="size-3" /> Chưa hợp vị
                      </>
                    )}
                  </span>
                </div>

                {rev.comment && (
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-10">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">Chưa có đánh giá nào cho món ăn này</p>
              <p className="text-xs text-muted-foreground">
                Hãy là người đầu tiên thử nấu và để lại cảm nhận cho mọi người cùng biết nhé!
              </p>
              {!showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-full mt-2 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
                >
                  + Để lại đánh giá đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <Button variant="outline" asChild className="rounded-full text-sm font-semibold border-border/80 h-11 px-6">
          <Link to="/match">← Tìm món khác</Link>
        </Button>

        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-md shadow-orange-600/20 h-11 px-6">
          <Link to="/weekly-plan">Lên thực đơn tuần với món này →</Link>
        </Button>
      </div>
    </div>
  );
}
