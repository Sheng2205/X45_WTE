import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesApi } from '../api/favorites.api';
import type { Dish } from '@/modules/admin/api/admin.api';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
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

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const res = await favoritesApi.getAll();
      setFavorites(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách món yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (dishId: string) => {
    try {
      await favoritesApi.remove(dishId);
      toast.success('Đã xóa khỏi sổ tay yêu thích');
      setFavorites((prev) =>
        prev.filter((f) => {
          const d = f.dish || f.dishId;
          return d?._id !== dishId;
        })
      );
    } catch (err) {
      toast.error('Lỗi khi xóa món yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-border/60 p-6 space-y-4 bg-card">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out any entries where dish is null (e.g. if soft-deleted)
  const validFavorites = favorites.filter((f) => Boolean(f.dish || f.dishId));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Bộ sưu tập cá nhân
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mt-1.5">
          Sổ Tay Món Yêu Thích
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Tất cả những món ăn bạn tâm đắc được lưu trữ tại đây để bạn có thể xem lại công thức và lên lịch nấu bất cứ lúc nào.
        </p>
      </div>

      {validFavorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto">
          <div className="h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-muted mb-3 shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
              alt="Sổ tay món ăn"
              className="h-full w-full object-cover opacity-85"
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Sổ tay món ăn đang còn trống
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Bạn chưa lưu món ăn nào. Khi tìm món hoặc quay chọn ngẫu nhiên, hãy chạm vào biểu tượng trái tim để lưu lại công thức nhé!
            </p>
          </div>
          <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-7 py-3 h-11 shadow-md shadow-orange-600/20">
            <Link to="/match">Khám Phá Món Ngay →</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {validFavorites.map((item) => {
            const dish = (item.dish || item.dishId) as Dish;
            if (!dish || !dish._id) return null;
            const imageUrl = dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);

            return (
              <Card
                key={dish._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-orange-500/5"
              >
                {/* Real Dish Photography Banner */}
                <div className="relative aspect-[4/3] min-h-[220px] w-full overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={dish.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges & Remove Button */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-neutral-800 shadow-xs">
                      {MEAL_LABELS[dish.mealType] || dish.mealType}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(dish._id)}
                      className="rounded-full p-2 bg-black/50 text-white hover:bg-rose-600 hover:text-white backdrop-blur-md transition-colors"
                      title="Bỏ khỏi sổ tay"
                    >
                      <span className="text-xs font-bold leading-none">✕</span>
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      <Link to={`/dishes/${dish._id}`}>{dish.name}</Link>
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {dish.description || 'Món ăn gia đình thơm ngon, giàu hương vị.'}
                    </p>

                    <div className="text-xs sm:text-sm font-medium text-muted-foreground pt-1">
                      Gồm <strong>{dish.ingredients?.length || 0}</strong> nguyên liệu cần chuẩn bị
                    </div>

                    {dish.dietTags && dish.dietTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dish.dietTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-medium"
                          >
                            {DIET_LABELS[tag] || tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <Button variant="outline" asChild className="rounded-2xl h-11 text-sm w-full font-semibold border-border/80 hover:bg-muted">
                      <Link to={`/dishes/${dish._id}`}>Xem Công Thức Nấu →</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
